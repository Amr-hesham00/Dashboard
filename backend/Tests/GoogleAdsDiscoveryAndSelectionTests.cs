using Dashboard.API.Controllers;
using Dashboard.Application.DTOs;
using Dashboard.Application.Interfaces;
using Dashboard.Application.Interfaces.Services;
using Dashboard.Application.Services;
using Dashboard.Domain.Entities;
using Dashboard.Domain.Enums;
using Dashboard.Infrastructure;
using Dashboard.Infrastructure.Repositories;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Time.Testing;
using Moq;
using Moq.Protected;
using System.IO;
using System.Net;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text.Json;
using Xunit;

namespace Dashboard.Tests;

public class GoogleAdsDiscoveryAndSelectionTests
{
    private const string TestClientId = "243100354746-ts5ocku0ekqb382ccgvmktd4dtlijmvs.apps.googleusercontent.com";
    private const string TestClientSecret = "mock_super_secret_client_key_12345";
    private const string TestRedirectUri = "https://localhost:3000/api/google-ads/callback";
    private const string UserA = "user-manager-a";
    private const string UserB = "user-manager-b";

    private readonly FakeTimeProvider _timeProvider;
    private readonly IConfiguration _configuration;
    private readonly IDataProtectionProvider _dataProtectionProvider;
    private readonly GoogleOAuthStateStore _stateStore;

    public GoogleAdsDiscoveryAndSelectionTests()
    {
        _timeProvider = new FakeTimeProvider(new DateTimeOffset(2026, 10, 31, 12, 0, 0, TimeSpan.Zero));

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
    }

    private sealed class TestableGoogleAdsService : GoogleAdsService
    {
        private readonly Func<string, string?, IReadOnlyList<string>> _listAccessibleFunc;
        private readonly Func<string, IReadOnlyList<GoogleAdsCustomerAccountDto>> _queryDirectAccountsFunc;

        public List<string> QueriedAccessibleCustomerIds { get; } = new();

        public TestableGoogleAdsService(
            IGoogleOAuthService googleOAuthService,
            IUnitOfWork unitOfWork,
            IConfiguration configuration,
            TimeProvider timeProvider,
            ILogger<GoogleAdsService> logger,
            Func<string, string?, IReadOnlyList<string>> listAccessibleFunc,
            Func<string, IReadOnlyList<GoogleAdsCustomerAccountDto>> queryDirectAccountsFunc)
            : base(googleOAuthService, unitOfWork, configuration, timeProvider, logger)
        {
            _listAccessibleFunc = listAccessibleFunc;
            _queryDirectAccountsFunc = queryDirectAccountsFunc;
        }

        protected override Task<IReadOnlyList<string>> ListAccessibleCustomerResourceNamesAsync(
            string refreshToken,
            string? accessToken,
            CancellationToken cancellationToken)
        {
            return Task.FromResult(_listAccessibleFunc(refreshToken, accessToken));
        }

        protected override Task<IReadOnlyList<GoogleAdsCustomerAccountDto>> QueryDirectAdvertiserAccountsAsync(
            string refreshToken,
            string? accessToken,
            string accessibleCustomerId,
            CancellationToken cancellationToken)
        {
            QueriedAccessibleCustomerIds.Add(accessibleCustomerId);
            return Task.FromResult(_queryDirectAccountsFunc(accessibleCustomerId));
        }
    }

    private (
        GoogleOAuthService OAuthService,
        TestableGoogleAdsService AdsService,
        AppDbContext DbContext,
        UnitOfWork UnitOfWork)
        CreateTestHarness(
            Func<string, string?, IReadOnlyList<string>>? listAccessibleFunc = null,
            Func<string, IReadOnlyList<GoogleAdsCustomerAccountDto>>? queryDirectAccountsFunc = null,
            HttpMessageHandler? httpHandler = null)
    {
        var dbOptions = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        var dbContext = new AppDbContext(dbOptions);

        var clientRepo = new ClientRepo(dbContext);
        var platformRepo = new PlatformRepo(dbContext);
        var connRepo = new OAuthConnectionRepo(dbContext);

        var uow = new UnitOfWork(
            dbContext,
            Mock.Of<Dashboard.Application.Interfaces.Repositories.IAdRepo>(),
            Mock.Of<Dashboard.Application.Interfaces.Repositories.IAdSetRepo>(),
            Mock.Of<Dashboard.Application.Interfaces.Repositories.IAssignmentRepo>(),
            Mock.Of<Dashboard.Application.Interfaces.Repositories.IAssociateProfileRepo>(),
            Mock.Of<Dashboard.Application.Interfaces.Repositories.IAssociateTeamRepo>(),
            Mock.Of<Dashboard.Application.Interfaces.Repositories.ICampaignRepo>(),
            clientRepo,
            platformRepo,
            Mock.Of<Dashboard.Application.Interfaces.Repositories.IUserRepo>(),
            Mock.Of<Dashboard.Application.Interfaces.Repositories.IRefreshTokenRepo>(),
            Mock.Of<Dashboard.Application.Interfaces.Repositories.IClientTargetRepo>(),
            Mock.Of<Dashboard.Application.Interfaces.Repositories.IAdDailyMetricsRepo>(),
            Mock.Of<Dashboard.Application.Interfaces.Repositories.ISearchTermRepo>(),
            Mock.Of<Dashboard.Application.Interfaces.Repositories.IExchangeRateRepo>(),
            connRepo);

        var handler = httpHandler ?? new Mock<HttpMessageHandler>().Object;
        var httpClient = new HttpClient(handler);

        var oauthService = new GoogleOAuthService(
            httpClient,
            uow,
            _dataProtectionProvider,
            _stateStore,
            _configuration,
            _timeProvider,
            Mock.Of<ILogger<GoogleOAuthService>>());

        var defaultListFunc = listAccessibleFunc ?? ((_, _) => new[]
        {
            "customers/3674643588", // Scenario 2: Accessible MCC Manager account
            "customers/4501355105", // Scenario 2: Second accessible MCC Manager account
            "customers/1112223334"  // Scenario 1: Directly accessible standalone advertiser account
        });

        var defaultQueryFunc = queryDirectAccountsFunc ?? (accessibleCustomerId =>
        {
            return accessibleCustomerId switch
            {
                "3674643588" => new List<GoogleAdsCustomerAccountDto>
                {
                    // Even if an MCC row were returned, service filters it out so MCC is never selectable
                    new()
                    {
                        CustomerId = "3674643588",
                        FormattedCustomerId = "367-464-3588",
                        DescriptiveName = "Google Ads Manager (367-464-3588)",
                        IsManager = true,
                        CurrencyCode = "EGP",
                        ManagerCustomerId = "3674643588",
                        Level = 0
                    },
                    new()
                    {
                        CustomerId = "1757564917",
                        FormattedCustomerId = "175-756-4917",
                        DescriptiveName = "Alshiaka test client acc",
                        IsManager = false,
                        CurrencyCode = "EGP",
                        ManagerCustomerId = "3674643588",
                        Level = 1
                    },
                    new()
                    {
                        CustomerId = "9750530064",
                        FormattedCustomerId = "975-053-0064",
                        DescriptiveName = "Elzero Test client acc",
                        IsManager = false,
                        CurrencyCode = "EGP",
                        ManagerCustomerId = "3674643588",
                        Level = 1
                    }
                },
                "4501355105" => new List<GoogleAdsCustomerAccountDto>
                {
                    // Duplicate reference to 1757564917 to verify deduplication
                    new()
                    {
                        CustomerId = "1757564917",
                        FormattedCustomerId = "175-756-4917",
                        DescriptiveName = "Alshiaka test client acc",
                        IsManager = false,
                        CurrencyCode = "EGP",
                        ManagerCustomerId = "3674643588",
                        Level = 1
                    }
                },
                "1112223334" => new List<GoogleAdsCustomerAccountDto>
                {
                    new()
                    {
                        CustomerId = "1112223334",
                        FormattedCustomerId = "111-222-3334",
                        DescriptiveName = "Direct Advertiser Account",
                        IsManager = false,
                        CurrencyCode = "USD",
                        ManagerCustomerId = null,
                        Level = 0
                    }
                },
                _ => Array.Empty<GoogleAdsCustomerAccountDto>()
            };
        });

        var adsService = new TestableGoogleAdsService(
            oauthService,
            uow,
            _configuration,
            _timeProvider,
            Mock.Of<ILogger<GoogleAdsService>>(),
            defaultListFunc,
            defaultQueryFunc);

        return (oauthService, adsService, dbContext, uow);
    }

    private async Task<OAuthConnection> SeedConnectedUserAsync(
        AppDbContext db,
        string userId,
        string accessToken = "ya29.valid_access_token",
        string refreshToken = "1//valid_refresh_token",
        DateTimeOffset? expiresAt = null)
    {
        var protector = _dataProtectionProvider.CreateProtector("Dashboard.GoogleOAuth.Tokens.v1");
        var conn = new OAuthConnection
        {
            UserId = userId,
            PlatformType = PlatformType.GoogleAds,
            AccessTokenEncrypted = protector.Protect(accessToken),
            RefreshTokenEncrypted = protector.Protect(refreshToken),
            AccessTokenExpiresAt = expiresAt ?? _timeProvider.GetUtcNow().AddHours(1),
            Scopes = "https://www.googleapis.com/auth/adwords",
            CreatedAt = _timeProvider.GetUtcNow(),
            UpdatedAt = _timeProvider.GetUtcNow()
        };
        db.OAuthConnections.Add(conn);
        await db.SaveChangesAsync();
        return conn;
    }

    private static async Task<Client> SeedClientAsync(
        AppDbContext db,
        string managerUserId,
        string companyName = "Alshiaka Store",
        bool withExistingGooglePlatform = true)
    {
        var client = new Client
        {
            CompanyName = companyName,
            Website = "https://example.com",
            Email = "contact@example.com",
            Phone = "+201000000000",
            Country = "Egypt",
            ManagerId = managerUserId,
            BusinessModel = (BusinessModel)0,
            Status = ClientStatus.Active,
            UnitCurrency = Currency.USD,
            CreatedAt = DateTimeOffset.UtcNow
        };
        db.client.Add(client);
        await db.SaveChangesAsync();

        if (withExistingGooglePlatform)
        {
            db.platform.Add(new Platform
            {
                ClientId = client.Id,
                PlatformType = PlatformType.GoogleAds,
                Status = PlatformStatus.NotConnected,
                Currency = Currency.USD,
                CreatedAt = DateTimeOffset.UtcNow
            });
            await db.SaveChangesAsync();
        }

        return client;
    }

    // ─── Scenario 1 (Direct Access) & Scenario 2 (MCC Access), Deduplication & No MCC Returned ───

    [Fact]
    public async Task DiscoverAccessibleAccounts_SupportsDirectAndMccAccess_DeduplicatesAndNeverReturnsMccManagers()
    {
        // Arrange
        var (_, adsService, db, _) = CreateTestHarness();
        await SeedConnectedUserAsync(db, UserA);

        // Act
        var result = await adsService.DiscoverAccessibleAccountsAsync(UserA);

        // Assert
        Assert.True(result.Success);
        Assert.True(result.Connected);
        Assert.Null(result.ErrorCode);

        // Only the 3 unique advertiser accounts should be returned; MCC accounts (3674643588, 4501355105) must NEVER be returned
        Assert.Equal(3, result.Accounts.Count);
        Assert.Equal(result.Accounts.Count, result.Accounts.Select(a => a.CustomerId).Distinct().Count());
        Assert.All(result.Accounts, a =>
        {
            Assert.False(a.IsManager);
            Assert.True(a.CanSelect);
        });
        Assert.DoesNotContain(result.Accounts, a => a.CustomerId == "3674643588");
        Assert.DoesNotContain(result.Accounts, a => a.CustomerId == "4501355105");

        // Scenario 1: Direct standalone advertiser account (Level = 0, ManagerCustomerId = null)
        var directAdv = Assert.Single(result.Accounts, a => a.CustomerId == "1112223334");
        Assert.Equal("111-222-3334", directAdv.FormattedCustomerId);
        Assert.Equal(0, directAdv.Level);
        Assert.Null(directAdv.ManagerCustomerId);

        // Scenario 2: Advertiser accounts linked directly under MCC 3674643588 (Level = 1, ManagerCustomerId = 3674643588)
        var alshiakaAdv = Assert.Single(result.Accounts, a => a.CustomerId == "1757564917");
        Assert.Equal("175-756-4917", alshiakaAdv.FormattedCustomerId);
        Assert.Equal("Alshiaka test client acc", alshiakaAdv.DescriptiveName);
        Assert.Equal("3674643588", alshiakaAdv.ManagerCustomerId);

        var elzeroAdv = Assert.Single(result.Accounts, a => a.CustomerId == "9750530064");
        Assert.Equal("975-053-0064", elzeroAdv.FormattedCustomerId);
        Assert.Equal("Elzero Test client acc", elzeroAdv.DescriptiveName);
        Assert.Equal("3674643588", elzeroAdv.ManagerCustomerId);
    }

    [Fact]
    public async Task DiscoverAccessibleAccounts_DoesNotTraverseChildMccOrIncludeNestedAccounts()
    {
        // Arrange: Root MCC 1000000001 has a direct child MCC 2000000002 (Level = 1, IsManager = true)
        // and a direct child Advertiser 1111111111 (Level = 1, IsManager = false).
        // Verify that 2000000002 is NEVER queried and never returned, and any level > 1 row is ignored.
        var (_, adsService, db, _) = CreateTestHarness(
            listAccessibleFunc: (_, _) => new[] { "customers/1000000001" },
            queryDirectAccountsFunc: accessibleCustomerId => accessibleCustomerId switch
            {
                "1000000001" => new List<GoogleAdsCustomerAccountDto>
                {
                    new() { CustomerId = "1000000001", DescriptiveName = "Root MCC", IsManager = true, Level = 0 },
                    new() { CustomerId = "2000000002", DescriptiveName = "Child Sub-MCC", IsManager = true, Level = 1 },
                    new() { CustomerId = "1111111111", DescriptiveName = "Direct MCC Advertiser", IsManager = false, ManagerCustomerId = "1000000001", Level = 1 },
                    new() { CustomerId = "3000000003", DescriptiveName = "Nested Level 2 Advertiser", IsManager = false, ManagerCustomerId = "1000000001", Level = 2 }
                },
                _ => throw new InvalidOperationException($"Should not traverse child manager {accessibleCustomerId}")
            });

        await SeedConnectedUserAsync(db, UserA);

        // Act
        var result = await adsService.DiscoverAccessibleAccountsAsync(UserA);

        // Assert
        Assert.True(result.Success);
        var single = Assert.Single(result.Accounts);
        Assert.Equal("1111111111", single.CustomerId);
        Assert.Single(adsService.QueriedAccessibleCustomerIds);
        Assert.Equal("1000000001", adsService.QueriedAccessibleCustomerIds[0]);
    }

    // ─── Automatic Refresh of Expired Access Token ───

    [Fact]
    public async Task GetValidCredentials_WhenAccessTokenExpired_AutomaticallyRefreshesAndPersistsNewEncryptedToken()
    {
        // Arrange: Mock Google token endpoint for refresh_token grant
        var mockHttp = new Mock<HttpMessageHandler>();
        mockHttp.Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.Is<HttpRequestMessage>(req =>
                    req.Method == HttpMethod.Post &&
                    req.RequestUri!.ToString() == "https://oauth2.googleapis.com/token"),
                ItExpr.IsAny<CancellationToken>())
            .ReturnsAsync(new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = JsonContent.Create(new GoogleTokenResponse
                {
                    AccessToken = "ya29.refreshed_fresh_token_999",
                    ExpiresIn = 3600,
                    Scope = "https://www.googleapis.com/auth/adwords"
                })
            });

        var (_, adsService, db, _) = CreateTestHarness(httpHandler: mockHttp.Object);

        await SeedConnectedUserAsync(
            db,
            UserA,
            accessToken: "ya29.expired_old_token",
            refreshToken: "1//stored_refresh_token",
            expiresAt: _timeProvider.GetUtcNow().AddMinutes(-30));

        // Act
        var discovery = await adsService.DiscoverAccessibleAccountsAsync(UserA);

        // Assert
        Assert.True(discovery.Success);
        var updatedConn = await db.OAuthConnections.SingleAsync(c => c.UserId == UserA);
        var protector = _dataProtectionProvider.CreateProtector("Dashboard.GoogleOAuth.Tokens.v1");
        Assert.Equal("ya29.refreshed_fresh_token_999", protector.Unprotect(updatedConn.AccessTokenEncrypted));
        Assert.Equal(_timeProvider.GetUtcNow().AddSeconds(3600), updatedConn.AccessTokenExpiresAt);
    }

    // ─── Account Selection & Association Persistence ───

    [Fact]
    public async Task AssociateAccountWithClient_ValidAdvertiserAccount_PersistsPlatformAssociationAndConnectionLink()
    {
        // Arrange
        var (_, adsService, db, _) = CreateTestHarness();
        var conn = await SeedConnectedUserAsync(db, UserA);
        var client = await SeedClientAsync(db, UserA, "Alshiaka Store");

        // Act: Select child advertiser 175-756-4917
        var result = await adsService.AssociateAccountWithClientAsync(
            UserA,
            new SelectGoogleAdsAccountRequestDto
            {
                ClientId = client.Id,
                CustomerId = "175-756-4917"
            });

        // Assert
        Assert.True(result.Success);
        Assert.NotNull(result.Association);
        Assert.Equal(client.Id, result.Association!.ClientId);
        Assert.Equal("1757564917", result.Association.CustomerId);
        Assert.Equal("175-756-4917", result.Association.FormattedCustomerId);
        Assert.Equal("Alshiaka test client acc", result.Association.AccountName);
        Assert.Equal("3674643588", result.Association.LoginCustomerId);
        Assert.Equal("EGP", result.Association.Currency);
        Assert.Equal(conn.Id, result.Association.GoogleAdsConnectionId);

        var googlePlatforms = await db.platform
            .Where(p => p.ClientId == client.Id && p.PlatformType == PlatformType.GoogleAds)
            .ToListAsync();
        var persistedPlatform = Assert.Single(googlePlatforms);
        Assert.Equal(PlatformStatus.Connected, persistedPlatform.Status);
        Assert.Equal("1757564917", persistedPlatform.ExternalAccountId);
        Assert.Equal("Alshiaka test client acc", persistedPlatform.AccountName);
        Assert.Equal("3674643588", persistedPlatform.ManagerAccountId);
        Assert.Equal(conn.Id, persistedPlatform.OAuthConnectionId);
        Assert.Equal(Currency.EGP, persistedPlatform.Currency);
    }

    [Fact]
    public async Task DisconnectClientAccount_OneUserConnectedToTwoClients_DisconnectsOnlyTargetClientAndPreservesUserOAuthAndOtherClient()
    {
        // Arrange: Single Dashboard user (UserA) with 1 GoogleAdsConnection and 2 Dashboard Clients
        var (_, adsService, db, _) = CreateTestHarness();
        var conn = await SeedConnectedUserAsync(db, UserA);
        var clientA = await SeedClientAsync(db, UserA, "Alshiaka Store");
        var clientB = await SeedClientAsync(db, UserA, "Elzero Academy");

        // Associate Client A with 1757564917 and Client B with 9750530064 using the same user OAuth connection
        var assocA = await adsService.AssociateAccountWithClientAsync(
            UserA,
            new SelectGoogleAdsAccountRequestDto { ClientId = clientA.Id, CustomerId = "1757564917" });
        var assocB = await adsService.AssociateAccountWithClientAsync(
            UserA,
            new SelectGoogleAdsAccountRequestDto { ClientId = clientB.Id, CustomerId = "9750530064" });

        Assert.True(assocA.Success);
        Assert.True(assocB.Success);

        // Act: Disconnect Google Ads from Client A ONLY
        var disconnectResult = await adsService.DisconnectClientAccountAsync(
            UserA,
            clientA.Id);

        // Assert:
        // 1. Client A's Google Ads association is deactivated/cleared
        Assert.True(disconnectResult.Success);
        var platformA = await db.platform.SingleAsync(p => p.ClientId == clientA.Id && p.PlatformType == PlatformType.GoogleAds);
        Assert.Equal(PlatformStatus.NotConnected, platformA.Status);
        Assert.Null(platformA.ExternalAccountId);
        Assert.Null(platformA.AccountName);
        Assert.Null(platformA.ManagerAccountId);
        Assert.Null(platformA.OAuthConnectionId);

        // 2. UserA's Google OAuth connection and stored tokens remain intact
        var storedConn = await db.OAuthConnections.SingleOrDefaultAsync(c => c.UserId == UserA);
        Assert.NotNull(storedConn);
        Assert.Equal(conn.Id, storedConn!.Id);
        Assert.NotEmpty(storedConn.RefreshTokenEncrypted);
        Assert.NotEmpty(storedConn.AccessTokenEncrypted);

        // 3. Client B's Google Ads association remains completely connected and untouched
        var platformB = await db.platform.SingleAsync(p => p.ClientId == clientB.Id && p.PlatformType == PlatformType.GoogleAds);
        Assert.Equal(PlatformStatus.Connected, platformB.Status);
        Assert.Equal("9750530064", platformB.ExternalAccountId);
        Assert.Equal("Elzero Test client acc", platformB.AccountName);
        Assert.Equal("3674643588", platformB.ManagerAccountId);
        Assert.Equal(conn.Id, platformB.OAuthConnectionId);

        // 4. Connection status still shows Connected = true and lists only Client B as linked
        var status = await adsService.GetConnectionStatusAsync(UserA);
        Assert.True(status.Connected);
        var remainingLinked = Assert.Single(status.LinkedAccounts);
        Assert.Equal(clientB.Id, remainingLinked.ClientId);
        Assert.Equal("9750530064", remainingLinked.CustomerId);
    }

    [Fact]
    public async Task AssociateAccountWithClient_MccManagerAccountSubmitted_IsRejected()
    {
        // Arrange
        var (_, adsService, db, _) = CreateTestHarness();
        await SeedConnectedUserAsync(db, UserA);
        var client = await SeedClientAsync(db, UserA);

        // Act: Attempt to select MCC Manager account 3674643588
        var result = await adsService.AssociateAccountWithClientAsync(
            UserA,
            new SelectGoogleAdsAccountRequestDto
            {
                ClientId = client.Id,
                CustomerId = "3674643588"
            });

        // Assert
        Assert.False(result.Success);
        Assert.Equal(GoogleOAuthErrorCodes.UnauthorizedCustomerAccount, result.ErrorCode);

        var platform = await db.platform.SingleAsync(p => p.ClientId == client.Id && p.PlatformType == PlatformType.GoogleAds);
        Assert.Equal(PlatformStatus.NotConnected, platform.Status);
        Assert.Null(platform.ExternalAccountId);
    }

    [Fact]
    public async Task AssociateAccountWithClient_InaccessibleOrTamperedCustomerId_IsRejected()
    {
        // Arrange
        var (_, adsService, db, _) = CreateTestHarness();
        await SeedConnectedUserAsync(db, UserA);
        var client = await SeedClientAsync(db, UserA);

        // Act
        var result = await adsService.AssociateAccountWithClientAsync(
            UserA,
            new SelectGoogleAdsAccountRequestDto
            {
                ClientId = client.Id,
                CustomerId = "999-888-7776"
            });

        // Assert
        Assert.False(result.Success);
        Assert.Equal(GoogleOAuthErrorCodes.UnauthorizedCustomerAccount, result.ErrorCode);

        var platform = await db.platform.SingleAsync(p => p.ClientId == client.Id && p.PlatformType == PlatformType.GoogleAds);
        Assert.Null(platform.ExternalAccountId);
        Assert.Equal(PlatformStatus.NotConnected, platform.Status);
    }

    // ─── Cross-User Isolation ───

    [Fact]
    public async Task CrossUserIsolation_DifferentUserCannotAccessConnectionOrAssociateWithAnotherUsersClient()
    {
        // Arrange
        var (_, adsService, db, _) = CreateTestHarness();
        await SeedConnectedUserAsync(db, UserA);
        var clientOwnedByA = await SeedClientAsync(db, UserA, "User A Client");
        var clientOwnedByB = await SeedClientAsync(db, UserB, "User B Client");

        var userBDiscovery = await adsService.DiscoverAccessibleAccountsAsync(UserB);
        Assert.False(userBDiscovery.Success);
        Assert.False(userBDiscovery.Connected);
        Assert.Equal(GoogleOAuthErrorCodes.NotConnected, userBDiscovery.ErrorCode);
        Assert.Empty(userBDiscovery.Accounts);

        var userBAttemptOnOwnClient = await adsService.AssociateAccountWithClientAsync(
            UserB,
            new SelectGoogleAdsAccountRequestDto
            {
                ClientId = clientOwnedByB.Id,
                CustomerId = "1757564917"
            });
        Assert.False(userBAttemptOnOwnClient.Success);
        Assert.Equal(GoogleOAuthErrorCodes.NotConnected, userBAttemptOnOwnClient.ErrorCode);

        await SeedConnectedUserAsync(db, UserB);
        var userBAttemptOnUserAClient = await adsService.AssociateAccountWithClientAsync(
            UserB,
            new SelectGoogleAdsAccountRequestDto
            {
                ClientId = clientOwnedByA.Id,
                CustomerId = "1757564917"
            });
        Assert.False(userBAttemptOnUserAClient.Success);
        Assert.Equal(GoogleOAuthErrorCodes.UnauthorizedClient, userBAttemptOnUserAClient.ErrorCode);

        var userAAttemptOnUserBClient = await adsService.AssociateAccountWithClientAsync(
            UserA,
            new SelectGoogleAdsAccountRequestDto
            {
                ClientId = clientOwnedByB.Id,
                CustomerId = "1757564917"
            });
        Assert.False(userAAttemptOnUserBClient.Success);
        Assert.Equal(GoogleOAuthErrorCodes.UnauthorizedClient, userAAttemptOnUserBClient.ErrorCode);
    }

    [Fact]
    public async Task ControllerEndpoints_ReturnSafeDtosAndNeverExposeTokensOrSecrets()
    {
        // Arrange
        var (oauthService, adsService, db, _) = CreateTestHarness();
        await SeedConnectedUserAsync(
            db,
            UserA,
            accessToken: "ya29.super_sensitive_access_token",
            refreshToken: "1//super_sensitive_refresh_token");
        var client = await SeedClientAsync(db, UserA, "Acme Client");

        var controller = new GoogleAdsController(oauthService, adsService)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity(new[]
                    {
                        new Claim(ClaimTypes.NameIdentifier, UserA),
                        new Claim(ClaimTypes.Role, Roles.Manager.ToString())
                    }, "TestAuth"))
                }
            }
        };

        // Act 1: GET /api/google-ads/accounts
        var accountsActionResult = await controller.GetAccessibleAccounts(CancellationToken.None);
        var okAccounts = Assert.IsType<OkObjectResult>(accountsActionResult);
        var accountsJson = JsonSerializer.Serialize(okAccounts.Value);

        Assert.DoesNotContain("ya29.super_sensitive_access_token", accountsJson);
        Assert.DoesNotContain("1//super_sensitive_refresh_token", accountsJson);
        Assert.DoesNotContain(TestClientSecret, accountsJson);
        Assert.Contains("175-756-4917", accountsJson);

        // Act 2: POST /api/google-ads/accounts/select
        var selectActionResult = await controller.SelectAccount(
            new SelectGoogleAdsAccountRequestDto
            {
                ClientId = client.Id,
                CustomerId = "1757564917"
            },
            CancellationToken.None);
        var okSelect = Assert.IsType<OkObjectResult>(selectActionResult);
        var selectJson = JsonSerializer.Serialize(okSelect.Value);

        Assert.DoesNotContain("ya29.super_sensitive_access_token", selectJson);
        Assert.DoesNotContain("1//super_sensitive_refresh_token", selectJson);
        Assert.Contains("Alshiaka test client acc", selectJson);
    }

    [Fact]
    public async Task LiveGoogleAdsTestAccounts_DiscoversOnlySelectableAdvertiserAccountsAndValidatesSelection()
    {
        var apiDir = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "API"));
        var appSettingsPath = Path.Combine(apiDir, "appsettings.json");
        if (!File.Exists(appSettingsPath))
            return;

        var config = new ConfigurationBuilder()
            .SetBasePath(apiDir)
            .AddJsonFile("appsettings.json", optional: false)
            .AddJsonFile("appsettings.Development.json", optional: true)
            .Build();

        var connectionString = config.GetConnectionString("DefaultConnection");
        if (string.IsNullOrWhiteSpace(connectionString))
            return;

        var dbOptions = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlServer(connectionString)
            .Options;

        await using var db = new AppDbContext(dbOptions);
        var activeConnection = await db.OAuthConnections.AsNoTracking().FirstOrDefaultAsync();
        if (activeConnection is null || string.IsNullOrWhiteSpace(config["GoogleOAuth:ClientId"]) || string.IsNullOrWhiteSpace(config["GoogleOAuth:ClientSecret"]))
            return;

        var appDiscriminator = apiDir.EndsWith(Path.DirectorySeparatorChar)
            ? apiDir
            : apiDir + Path.DirectorySeparatorChar;

        var services = new ServiceCollection();
        services.AddDataProtection().SetApplicationName(appDiscriminator);
        await using var sp = services.BuildServiceProvider();
        var dpProvider = sp.GetRequiredService<IDataProtectionProvider>();

        var uow = new UnitOfWork(
            db,
            new AdRepo(db),
            new AdSetRepo(db),
            new AssignmentRepo(db),
            new AssociateProfileRepo(db),
            new AssociateTeamRepo(db),
            new CampaignRepo(db),
            new ClientRepo(db),
            new PlatformRepo(db),
            new UserRepo(db),
            new RefreshTokenRepo(db),
            new ClientTargetRepo(db),
            new AdDailyMetricsRepo(db),
            new SearchTermRepo(db),
            new ExchangeRateRepo(db),
            new OAuthConnectionRepo(db));

        using var httpClient = new HttpClient();
        var oauthService = new GoogleOAuthService(
            httpClient,
            uow,
            dpProvider,
            new GoogleOAuthStateStore(TimeProvider.System),
            config,
            TimeProvider.System,
            Mock.Of<ILogger<GoogleOAuthService>>());

        var liveAdsService = new GoogleAdsService(
            oauthService,
            uow,
            config,
            TimeProvider.System,
            Mock.Of<ILogger<GoogleAdsService>>());

        // 1. Live Discovery against Google Ads API
        var discovery = await liveAdsService.DiscoverAccessibleAccountsAsync(activeConnection.UserId);
        Assert.True(discovery.Success, $"Live discovery failed: {discovery.ErrorCode} - {discovery.Message}");
        Assert.True(discovery.Connected);
        Assert.NotEmpty(discovery.Accounts);

        // Verify no duplicate Customer IDs and NO MCC Manager accounts returned
        Assert.Equal(
            discovery.Accounts.Count,
            discovery.Accounts.Select(a => a.CustomerId).Distinct().Count());
        Assert.All(discovery.Accounts, a =>
        {
            Assert.False(a.IsManager);
            Assert.True(a.CanSelect);
        });
        Assert.DoesNotContain(discovery.Accounts, a => a.CustomerId == "3674643588");
        Assert.DoesNotContain(discovery.Accounts, a => a.CustomerId == "1847251370");
        Assert.DoesNotContain(discovery.Accounts, a => a.CustomerId == "4501355105");

        // Verify child test advertiser accounts directly under MCC 3674643588 are returned
        var alshiakaAdvertiser = Assert.Single(discovery.Accounts, a => a.CustomerId == "1757564917");
        Assert.Equal("Alshiaka test client acc", alshiakaAdvertiser.DescriptiveName);
        Assert.Equal("3674643588", alshiakaAdvertiser.ManagerCustomerId);

        var elzeroAdvertiser = Assert.Single(discovery.Accounts, a => a.CustomerId == "9750530064");
        Assert.Equal("Elzero Test client acc", elzeroAdvertiser.DescriptiveName);
        Assert.Equal("3674643588", elzeroAdvertiser.ManagerCustomerId);

        // 2. Verify live account selection, multi-client association, and isolated client disconnection inside a rolled-back DB transaction
        var ownedClients = await db.client
            .Where(c => c.ManagerId == activeConnection.UserId)
            .OrderBy(c => c.Id)
            .Take(2)
            .ToListAsync();

        if (ownedClients.Count >= 2)
        {
            var client1 = ownedClients[0];
            var client2 = ownedClients[1];

            await using var tx = await db.Database.BeginTransactionAsync();

            // Clear any pre-existing test links inside the transaction
            var existingPlatforms = await db.platform
                .Where(p => p.PlatformType == PlatformType.GoogleAds && p.OAuthConnectionId == activeConnection.Id)
                .ToListAsync();
            foreach (var p in existingPlatforms)
            {
                p.Status = PlatformStatus.NotConnected;
                p.ExternalAccountId = null;
                p.AccountName = null;
                p.ManagerAccountId = null;
                p.OAuthConnectionId = null;
            }
            await db.SaveChangesAsync();

            // MCC Manager account ID must be rejected
            var managerReject = await liveAdsService.AssociateAccountWithClientAsync(
                activeConnection.UserId,
                new SelectGoogleAdsAccountRequestDto
                {
                    ClientId = client1.Id,
                    CustomerId = "3674643588"
                });
            Assert.False(managerReject.Success);
            Assert.Equal(GoogleOAuthErrorCodes.UnauthorizedCustomerAccount, managerReject.ErrorCode);

            // Associate Client 1 with 1757564917 and Client 2 with 9750530064 using the same user's OAuth connection
            var selectClient1 = await liveAdsService.AssociateAccountWithClientAsync(
                activeConnection.UserId,
                new SelectGoogleAdsAccountRequestDto
                {
                    ClientId = client1.Id,
                    CustomerId = "1757564917"
                });
            Assert.True(selectClient1.Success);
            Assert.Equal("1757564917", selectClient1.Association!.CustomerId);

            var selectClient2 = await liveAdsService.AssociateAccountWithClientAsync(
                activeConnection.UserId,
                new SelectGoogleAdsAccountRequestDto
                {
                    ClientId = client2.Id,
                    CustomerId = "9750530064"
                });
            Assert.True(selectClient2.Success);
            Assert.Equal("9750530064", selectClient2.Association!.CustomerId);

            // Disconnect Client 1 ONLY -> verify Client 2 and user OAuth connection remain untouched
            var disconnectClient1 = await liveAdsService.DisconnectClientAccountAsync(
                activeConnection.UserId,
                client1.Id);
            Assert.True(disconnectClient1.Success);

            var statusAfterDisconnect = await liveAdsService.GetConnectionStatusAsync(activeConnection.UserId);
            Assert.True(statusAfterDisconnect.Connected);
            var stillLinked = Assert.Single(statusAfterDisconnect.LinkedAccounts);
            Assert.Equal(client2.Id, stillLinked.ClientId);
            Assert.Equal("9750530064", stillLinked.CustomerId);

            await tx.RollbackAsync();
        }
    }
}
