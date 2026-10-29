using Dashboard.API.Controllers;
using Dashboard.Application.DTOs;
using Dashboard.Application.Services;
using Dashboard.Domain.Entities;
using Dashboard.Infrastructure;
using Dashboard.Infrastructure.Repositories;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Time.Testing;
using Moq;
using Moq.Protected;
using System.Net;
using System.Net.Http.Json;
using System.Security.Claims;
using Xunit;

namespace Dashboard.Tests;

public class GoogleOAuthTests
{
    private const string TestClientId = "243100354746-ts5ocku0ekqb382ccgvmktd4dtlijmvs.apps.googleusercontent.com";
    private const string TestClientSecret = "mock_super_secret_client_key_12345";
    private const string TestRedirectUri = "https://localhost:3000/api/google-ads/callback";
    private const string TestUserId = "user-mb-001";

    private readonly FakeTimeProvider _timeProvider;
    private readonly IConfiguration _configuration;
    private readonly IDataProtectionProvider _dataProtectionProvider;
    private readonly GoogleOAuthStateStore _stateStore;
    private readonly Mock<ILogger<GoogleOAuthService>> _loggerMock;
    private readonly List<string> _loggedMessages = new();

    public GoogleOAuthTests()
    {
        _timeProvider = new FakeTimeProvider(new DateTimeOffset(2026, 10, 28, 12, 0, 0, TimeSpan.Zero));

        var inMemorySettings = new Dictionary<string, string?>
        {
            ["GoogleOAuth:ClientId"] = TestClientId,
            ["GoogleOAuth:ClientSecret"] = TestClientSecret,
            ["GoogleOAuth:RedirectUri"] = TestRedirectUri,
        };

        _configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(inMemorySettings)
            .Build();

        _dataProtectionProvider = new EphemeralDataProtectionProvider();
        _stateStore = new GoogleOAuthStateStore(_timeProvider);

        _loggerMock = new Mock<ILogger<GoogleOAuthService>>();
        _loggerMock.Setup(x => x.Log(
            It.IsAny<LogLevel>(),
            It.IsAny<EventId>(),
            It.IsAny<It.IsAnyType>(),
            It.IsAny<Exception?>(),
            It.IsAny<Func<It.IsAnyType, Exception?, string>>()))
            .Callback(new InvocationAction(invocation =>
            {
                var state = invocation.Arguments[2];
                if (state != null)
                {
                    _loggedMessages.Add(state.ToString()!);
                }
            }));
    }

    private (GoogleOAuthService Service, AppDbContext DbContext, UnitOfWork UnitOfWork) CreateService(
        HttpMessageHandler httpHandler)
    {
        var dbOptions = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        var dbContext = new AppDbContext(dbOptions);

        var connRepo = new GoogleAdsConnectionRepo(dbContext);
        var uow = new UnitOfWork(
            dbContext,
            Mock.Of<Dashboard.Application.Interfaces.Repositories.IAdRepo>(),
            Mock.Of<Dashboard.Application.Interfaces.Repositories.IAdSetRepo>(),
            Mock.Of<Dashboard.Application.Interfaces.Repositories.IAssignmentRepo>(),
            Mock.Of<Dashboard.Application.Interfaces.Repositories.IAssociateProfileRepo>(),
            Mock.Of<Dashboard.Application.Interfaces.Repositories.IAssociateTeamRepo>(),
            Mock.Of<Dashboard.Application.Interfaces.Repositories.ICampaignRepo>(),
            Mock.Of<Dashboard.Application.Interfaces.Repositories.IClientRepo>(),
            Mock.Of<Dashboard.Application.Interfaces.Repositories.IPlatformRepo>(),
            Mock.Of<Dashboard.Application.Interfaces.Repositories.IUserRepo>(),
            Mock.Of<Dashboard.Application.Interfaces.Repositories.IRefreshTokenRepo>(),
            Mock.Of<Dashboard.Application.Interfaces.Repositories.IClientTargetRepo>(),
            Mock.Of<Dashboard.Application.Interfaces.Repositories.IAdDailyMetricsRepo>(),
            Mock.Of<Dashboard.Application.Interfaces.Repositories.ISearchTermRepo>(),
            Mock.Of<Dashboard.Application.Interfaces.Repositories.IExchangeRateRepo>(),
            connRepo);

        var httpClient = new HttpClient(httpHandler);

        var service = new GoogleOAuthService(
            httpClient,
            uow,
            _dataProtectionProvider,
            _stateStore,
            _configuration,
            _timeProvider,
            _loggerMock.Object);

        return (service, dbContext, uow);
    }

    [Fact]
    public async Task StartAuthorization_BuildsCorrectGoogleAuthorizationUrlWithAllRequiredParameters()
    {
        // Arrange
        var handler = new Mock<HttpMessageHandler>();
        var (service, _, _) = CreateService(handler.Object);

        // Act
        var result = await service.StartAuthorization(TestUserId);

        // Assert
        Assert.NotNull(result);
        Assert.False(result.HasToken);
        Assert.False(string.IsNullOrWhiteSpace(result.State));
        Assert.False(string.IsNullOrWhiteSpace(result.AuthorizationUrl));

        var uri = new Uri(result.AuthorizationUrl);
        Assert.Equal("accounts.google.com", uri.Host);
        Assert.Equal("/o/oauth2/v2/auth", uri.AbsolutePath);

        var query = Microsoft.AspNetCore.WebUtilities.QueryHelpers.ParseQuery(uri.Query);
        Assert.Equal(TestClientId, query["client_id"]);
        Assert.Equal(TestRedirectUri, query["redirect_uri"]);
        Assert.Equal("code", query["response_type"]);
        Assert.Equal("https://www.googleapis.com/auth/adwords", query["scope"]);
        Assert.Equal("offline", query["access_type"]);
        Assert.Equal("select_account consent", query["prompt"]);
        Assert.Equal(result.State, query["state"]);
        Assert.Equal("S256", query["code_challenge_method"]);
        Assert.NotEmpty(query["code_challenge"].ToString());
    }

    [Fact]
    public async Task ConnectController_UnauthenticatedUser_IsRejectedWithUnauthorized()
    {
        // Arrange
        var handler = new Mock<HttpMessageHandler>();
        var (service, _, _) = CreateService(handler.Object);
        var controller = new GoogleAdsController(service)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext() // No user principal
            }
        };

        // Act
        var actionResult = await controller.Connect();

        // Assert
        Assert.IsType<UnauthorizedObjectResult>(actionResult);
    }

    [Fact]
    public async Task HandleCallback_InvalidExpiredOrReusedState_IsRejected()
    {
        // Arrange
        var handler = new Mock<HttpMessageHandler>();
        var (service, _, _) = CreateService(handler.Object);

        // 1. Completely unknown state
        var unknownResult = await service.HandleCallbackAsync(new GoogleOAuthCallbackRequest(
            Code: "test_code",
            State: "totally_unknown_state_xyz",
            Error: null,
            BrowserState: null));
        Assert.False(unknownResult.Success);
        Assert.Equal(GoogleOAuthErrorCodes.InvalidState, unknownResult.ErrorCode);

        // 2. Expired state
        var startResult = await service.StartAuthorization(TestUserId);
        _timeProvider.Advance(GoogleOAuthStateStore.Lifetime.Add(TimeSpan.FromSeconds(1))); // advance beyond 10 min

        var expiredResult = await service.HandleCallbackAsync(new GoogleOAuthCallbackRequest(
            Code: "test_code",
            State: startResult.State,
            Error: null,
            BrowserState: null));
        Assert.False(expiredResult.Success);
        Assert.Equal(GoogleOAuthErrorCodes.InvalidState, expiredResult.ErrorCode);

        // 3. Reused state
        _timeProvider.SetUtcNow(new DateTimeOffset(2026, 10, 28, 14, 0, 0, TimeSpan.Zero));
        var freshStart = await service.StartAuthorization(TestUserId);

        // Setup mock response for successful first consume
        var mockResponse = new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = JsonContent.Create(new GoogleTokenResponse
            {
                AccessToken = "ya29.first_token",
                RefreshToken = "1//first_refresh",
                ExpiresIn = 3600,
                Scope = "https://www.googleapis.com/auth/adwords"
            })
        };

        var workingHandler = new Mock<HttpMessageHandler>();
        workingHandler.Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>())
            .ReturnsAsync(mockResponse);

        var (workingService, _, _) = CreateService(workingHandler.Object);

        var firstResult = await workingService.HandleCallbackAsync(new GoogleOAuthCallbackRequest(
            Code: "valid_code",
            State: freshStart.State,
            Error: null,
            BrowserState: null));
        Assert.True(firstResult.Success);

        // Try consuming the same state a second time
        var secondResult = await workingService.HandleCallbackAsync(new GoogleOAuthCallbackRequest(
            Code: "valid_code",
            State: freshStart.State,
            Error: null,
            BrowserState: null));
        Assert.False(secondResult.Success);
        Assert.Equal(GoogleOAuthErrorCodes.InvalidState, secondResult.ErrorCode);
    }

    [Fact]
    public async Task HandleCallback_UserDenialOrAccessDenied_ReturnsAccessDeniedErrorWithoutExchangingCode()
    {
        // Arrange
        var handler = new Mock<HttpMessageHandler>();
        var (service, _, _) = CreateService(handler.Object);

        var start = await service.StartAuthorization(TestUserId);

        var request = new GoogleOAuthCallbackRequest(
            Code: null,
            State: start.State,
            Error: "access_denied",
            BrowserState: null);

        // Act
        var result = await service.HandleCallbackAsync(request);

        // Assert
        Assert.False(result.Success);
        Assert.Equal(GoogleOAuthErrorCodes.AccessDenied, result.ErrorCode);

        // Verify token endpoint was NEVER called
        handler.Protected().Verify(
            "SendAsync",
            Times.Never(),
            ItExpr.IsAny<HttpRequestMessage>(),
            ItExpr.IsAny<CancellationToken>());
    }

    [Fact]
    public async Task HandleCallback_SuccessfulExchange_StoresEncryptedTokensForInitiatingUser()
    {
        // Arrange
        const string rawAccessToken = "ya29.sample_valid_access_token_123456";
        const string rawRefreshToken = "1//sample_valid_refresh_token_789012";

        var tokenHandler = new Mock<HttpMessageHandler>();
        tokenHandler.Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.Is<HttpRequestMessage>(req =>
                    req.RequestUri != null &&
                    req.RequestUri.AbsoluteUri == "https://oauth2.googleapis.com/token" &&
                    req.Method == HttpMethod.Post),
                ItExpr.IsAny<CancellationToken>())
            .ReturnsAsync(new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = JsonContent.Create(new GoogleTokenResponse
                {
                    AccessToken = rawAccessToken,
                    RefreshToken = rawRefreshToken,
                    ExpiresIn = 3600,
                    Scope = "https://www.googleapis.com/auth/adwords"
                })
            });

        var (service, dbContext, _) = CreateService(tokenHandler.Object);
        var start = await service.StartAuthorization(TestUserId);

        // Act
        var result = await service.HandleCallbackAsync(new GoogleOAuthCallbackRequest(
            Code: "valid_auth_code_999",
            State: start.State,
            Error: null,
            BrowserState: null));

        // Assert
        Assert.True(result.Success);
        Assert.Null(result.ErrorCode);

        // Verify stored entity in DB
        var storedConnection = await dbContext.GoogleAdsConnections
            .FirstOrDefaultAsync(c => c.UserId == TestUserId);

        Assert.NotNull(storedConnection);
        Assert.Equal(TestUserId, storedConnection.UserId);

        // Verify tokens are stored ENCRYPTED at rest (not plain text)
        Assert.NotEqual(rawAccessToken, storedConnection.AccessTokenEncrypted);
        Assert.NotEqual(rawRefreshToken, storedConnection.RefreshTokenEncrypted);

        // Verify tokens can be decrypted by IDataProtector
        var protector = _dataProtectionProvider.CreateProtector("Dashboard.GoogleOAuth.Tokens.v1");
        var decryptedAccessToken = protector.Unprotect(storedConnection.AccessTokenEncrypted);
        var decryptedRefreshToken = protector.Unprotect(storedConnection.RefreshTokenEncrypted);

        Assert.Equal(rawAccessToken, decryptedAccessToken);
        Assert.Equal(rawRefreshToken, decryptedRefreshToken);
        Assert.Equal("https://www.googleapis.com/auth/adwords", storedConnection.Scopes);
    }

    [Fact]
    public async Task HandleCallback_MissingRefreshTokenOnNewConnection_FailsAndDoesNotClaimSuccess()
    {
        // Arrange: New connection, but Google returns no refresh_token
        var tokenHandler = new Mock<HttpMessageHandler>();
        tokenHandler.Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>())
            .ReturnsAsync(new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = JsonContent.Create(new GoogleTokenResponse
                {
                    AccessToken = "ya29.only_access_token",
                    RefreshToken = null, // Missing!
                    ExpiresIn = 3600,
                    Scope = "https://www.googleapis.com/auth/adwords"
                })
            });

        var (service, dbContext, _) = CreateService(tokenHandler.Object);
        var start = await service.StartAuthorization(TestUserId);

        // Act
        var result = await service.HandleCallbackAsync(new GoogleOAuthCallbackRequest(
            Code: "code_without_refresh",
            State: start.State,
            Error: null,
            BrowserState: null));

        // Assert
        Assert.False(result.Success);
        Assert.Equal(GoogleOAuthErrorCodes.MissingRefreshToken, result.ErrorCode);

        var stored = await dbContext.GoogleAdsConnections.FirstOrDefaultAsync(c => c.UserId == TestUserId);
        Assert.Null(stored); // Nothing persisted
    }

    [Fact]
    public async Task StartAuthorization_WhenUserAlreadyHasValidConnection_PreventsReconnecting()
    {
        // Arrange
        var handler = new Mock<HttpMessageHandler>();
        var (service, dbContext, _) = CreateService(handler.Object);

        var protector = _dataProtectionProvider.CreateProtector("Dashboard.GoogleOAuth.Tokens.v1");
        await dbContext.GoogleAdsConnections.AddAsync(new GoogleAdsConnection
        {
            UserId = TestUserId,
            AccessTokenEncrypted = protector.Protect("ya29.current_access_token"),
            RefreshTokenEncrypted = protector.Protect("1//valid_refresh_token"),
            AccessTokenExpiresAt = DateTimeOffset.UtcNow.AddMinutes(30),
            Scopes = "https://www.googleapis.com/auth/adwords",
            CreatedAt = DateTimeOffset.UtcNow.AddDays(-1),
            UpdatedAt = DateTimeOffset.UtcNow.AddDays(-1)
        });
        await dbContext.SaveChangesAsync();

        // Act - authenticated user prompted to connect again
        var result = await service.StartAuthorization(TestUserId);

        // Assert - reconnection prevented: HasToken/AlreadyConnected is true, no Auth URL or State generated
        Assert.NotNull(result);
        Assert.True(result.HasToken);
        Assert.True(result.AlreadyConnected);
        Assert.Null(result.AuthorizationUrl);
        Assert.Null(result.State);
        Assert.Equal(GoogleOAuthErrorCodes.AlreadyConnected, result.ErrorCode);
    }

    [Fact]
    public async Task ConnectController_WhenUserAlreadyHasValidConnection_ReturnsConflictAndDoesNotSetCookie()
    {
        // Arrange
        var handler = new Mock<HttpMessageHandler>();
        var (service, dbContext, _) = CreateService(handler.Object);

        var protector = _dataProtectionProvider.CreateProtector("Dashboard.GoogleOAuth.Tokens.v1");
        await dbContext.GoogleAdsConnections.AddAsync(new GoogleAdsConnection
        {
            UserId = TestUserId,
            AccessTokenEncrypted = protector.Protect("ya29.current_token"),
            RefreshTokenEncrypted = protector.Protect("1//valid_refresh_token"),
            AccessTokenExpiresAt = DateTimeOffset.UtcNow.AddMinutes(30),
            Scopes = "https://www.googleapis.com/auth/adwords",
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        });
        await dbContext.SaveChangesAsync();

        var httpContext = new DefaultHttpContext
        {
            User = new ClaimsPrincipal(new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, TestUserId)
            }, "TestAuth"))
        };

        var controller = new GoogleAdsController(service)
        {
            ControllerContext = new ControllerContext { HttpContext = httpContext }
        };

        // Act - authenticated user prompted to connect again
        var actionResult = await controller.Connect();

        // Assert - returns 409 Conflict with already_connected errorCode
        var conflictResult = Assert.IsType<ConflictObjectResult>(actionResult);
        Assert.Equal(StatusCodes.Status409Conflict, conflictResult.StatusCode);

        // Verify state cookie was NEVER appended
        Assert.False(httpContext.Response.Headers.ContainsKey("Set-Cookie"));
    }

    [Fact]
    public async Task HandleCallback_WhenUserAlreadyHasValidConnection_RejectsWithAlreadyConnected()
    {
        // Arrange
        var handler = new Mock<HttpMessageHandler>();
        var (service, dbContext, _) = CreateService(handler.Object);

        var protector = _dataProtectionProvider.CreateProtector("Dashboard.GoogleOAuth.Tokens.v1");
        await dbContext.GoogleAdsConnections.AddAsync(new GoogleAdsConnection
        {
            UserId = TestUserId,
            AccessTokenEncrypted = protector.Protect("ya29.current_token"),
            RefreshTokenEncrypted = protector.Protect("1//valid_refresh_token"),
            AccessTokenExpiresAt = DateTimeOffset.UtcNow.AddMinutes(30),
            Scopes = "https://www.googleapis.com/auth/adwords",
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        });
        await dbContext.SaveChangesAsync();

        // Simulate a pending state
        var testState = _stateStore.Create(TestUserId, "mock_verifier");

        // Act
        var result = await service.HandleCallbackAsync(new GoogleOAuthCallbackRequest(
            Code: "some_auth_code",
            State: testState,
            Error: null,
            BrowserState: null));

        // Assert - rejected with already_connected
        Assert.False(result.Success);
        Assert.Equal(GoogleOAuthErrorCodes.AlreadyConnected, result.ErrorCode);
    }

    [Fact]
    public async Task HandleCallback_FailedExchange_MapsSafeErrorCodeAndDoesNotExposeSecrets()
    {
        // Arrange
        var tokenHandler = new Mock<HttpMessageHandler>();
        tokenHandler.Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>())
            .ReturnsAsync(new HttpResponseMessage(HttpStatusCode.BadRequest)
            {
                Content = JsonContent.Create(new GoogleTokenErrorResponse
                {
                    Error = "invalid_grant"
                })
            });

        var (service, _, _) = CreateService(tokenHandler.Object);
        var start = await service.StartAuthorization(TestUserId);

        // Act
        var result = await service.HandleCallbackAsync(new GoogleOAuthCallbackRequest(
            Code: "expired_or_invalid_code",
            State: start.State,
            Error: null,
            BrowserState: null));

        // Assert
        Assert.False(result.Success);
        Assert.Equal(GoogleOAuthErrorCodes.InvalidGrant, result.ErrorCode);

        // Verify logs NEVER contain the client secret, code, or tokens
        foreach (var msg in _loggedMessages)
        {
            Assert.DoesNotContain(TestClientSecret, msg);
            Assert.DoesNotContain("expired_or_invalid_code", msg);
        }
    }

    [Fact]
    public async Task DisconnectAsync_WhenUserHasConnection_RevokesTokenAndRemovesConnectionFromDatabase()
    {
        // Arrange
        var revokeHandler = new Mock<HttpMessageHandler>();
        revokeHandler.Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.Is<HttpRequestMessage>(req =>
                    req.RequestUri != null &&
                    req.RequestUri.AbsoluteUri == "https://oauth2.googleapis.com/revoke" &&
                    req.Method == HttpMethod.Post),
                ItExpr.IsAny<CancellationToken>())
            .ReturnsAsync(new HttpResponseMessage(HttpStatusCode.OK));

        var (service, dbContext, _) = CreateService(revokeHandler.Object);

        var protector = _dataProtectionProvider.CreateProtector("Dashboard.GoogleOAuth.Tokens.v1");
        await dbContext.GoogleAdsConnections.AddAsync(new GoogleAdsConnection
        {
            UserId = TestUserId,
            AccessTokenEncrypted = protector.Protect("ya29.access_to_revoke"),
            RefreshTokenEncrypted = protector.Protect("1//refresh_to_revoke"),
            AccessTokenExpiresAt = DateTimeOffset.UtcNow.AddHours(1),
            Scopes = "https://www.googleapis.com/auth/adwords",
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        });
        await dbContext.SaveChangesAsync();

        // Act
        var disconnected = await service.DisconnectAsync(TestUserId);

        // Assert
        Assert.True(disconnected);

        var remaining = await dbContext.GoogleAdsConnections.FirstOrDefaultAsync(c => c.UserId == TestUserId);
        Assert.Null(remaining);

        revokeHandler.Protected().Verify(
            "SendAsync",
            Times.Once(),
            ItExpr.Is<HttpRequestMessage>(req =>
                req.RequestUri != null &&
                req.RequestUri.AbsoluteUri == "https://oauth2.googleapis.com/revoke"),
            ItExpr.IsAny<CancellationToken>());
    }

    [Fact]
    public async Task DisconnectAsync_WhenUserHasNoConnection_ReturnsFalse()
    {
        // Arrange
        var handler = new Mock<HttpMessageHandler>();
        var (service, _, _) = CreateService(handler.Object);

        // Act
        var disconnected = await service.DisconnectAsync(TestUserId);

        // Assert
        Assert.False(disconnected);
    }

    [Fact]
    public async Task DisconnectController_WhenAuthenticatedAndConnected_ReturnsOkAndDisconnectsUser()
    {
        // Arrange
        var revokeHandler = new Mock<HttpMessageHandler>();
        revokeHandler.Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>())
            .ReturnsAsync(new HttpResponseMessage(HttpStatusCode.OK));

        var (service, dbContext, _) = CreateService(revokeHandler.Object);

        var protector = _dataProtectionProvider.CreateProtector("Dashboard.GoogleOAuth.Tokens.v1");
        await dbContext.GoogleAdsConnections.AddAsync(new GoogleAdsConnection
        {
            UserId = TestUserId,
            AccessTokenEncrypted = protector.Protect("ya29.access_token"),
            RefreshTokenEncrypted = protector.Protect("1//refresh_token"),
            AccessTokenExpiresAt = DateTimeOffset.UtcNow.AddHours(1),
            Scopes = "https://www.googleapis.com/auth/adwords",
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        });
        await dbContext.SaveChangesAsync();

        var controller = new GoogleAdsController(service)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity(new[]
                    {
                        new Claim(ClaimTypes.NameIdentifier, TestUserId)
                    }, "TestAuth"))
                }
            }
        };

        // Act
        var actionResult = await controller.Disconnect();

        // Assert
        Assert.IsType<OkObjectResult>(actionResult);
        Assert.Null(await dbContext.GoogleAdsConnections.FirstOrDefaultAsync(c => c.UserId == TestUserId));
    }

    [Fact]
    public async Task DisconnectController_WhenAuthenticatedButNotConnected_ReturnsNotFound()
    {
        // Arrange
        var handler = new Mock<HttpMessageHandler>();
        var (service, _, _) = CreateService(handler.Object);

        var controller = new GoogleAdsController(service)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity(new[]
                    {
                        new Claim(ClaimTypes.NameIdentifier, TestUserId)
                    }, "TestAuth"))
                }
            }
        };

        // Act
        var actionResult = await controller.Disconnect();

        // Assert
        Assert.IsType<NotFoundObjectResult>(actionResult);
    }

    [Fact]
    public async Task DisconnectController_WhenUnauthenticated_ReturnsUnauthorized()
    {
        // Arrange
        var handler = new Mock<HttpMessageHandler>();
        var (service, _, _) = CreateService(handler.Object);

        var controller = new GoogleAdsController(service)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext()
            }
        };

        // Act
        var actionResult = await controller.Disconnect();

        // Assert
        Assert.IsType<UnauthorizedObjectResult>(actionResult);
    }

    [Fact]
    public async Task CallbackController_RedirectsToClientsPageWithMessageOnSuccessAndError()
    {
        // Arrange
        var tokenHandler = new Mock<HttpMessageHandler>();
        tokenHandler.Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>())
            .ReturnsAsync(new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = JsonContent.Create(new GoogleTokenResponse
                {
                    AccessToken = "ya29.access_token",
                    RefreshToken = "1//refresh_token",
                    ExpiresIn = 3600,
                    Scope = "https://www.googleapis.com/auth/adwords"
                })
            });

        var (service, _, _) = CreateService(tokenHandler.Object);
        var start = await service.StartAuthorization(TestUserId);

        var controller = new GoogleAdsController(service)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext()
            }
        };

        // Act 1: Success callback
        var successAction = await controller.Callback("valid_code", start.State, null, CancellationToken.None);

        // Assert 1: Redirects to http://localhost:3000/clients with googleAuth=success and message
        var successRedirect = Assert.IsType<RedirectResult>(successAction);
        Assert.StartsWith("http://localhost:3000/clients?", successRedirect.Url);
        Assert.Contains("googleAuth=success", successRedirect.Url);
        Assert.Contains("message=", successRedirect.Url);

        // Act 2: Failed callback (invalid state)
        var failAction = await controller.Callback("code", "invalid_state", null, CancellationToken.None);

        // Assert 2: Redirects to http://localhost:3000/clients with googleAuth=error and message
        var failRedirect = Assert.IsType<RedirectResult>(failAction);
        Assert.StartsWith("http://localhost:3000/clients?", failRedirect.Url);
        Assert.Contains("googleAuth=error", failRedirect.Url);
        Assert.Contains("message=", failRedirect.Url);
    }
}
