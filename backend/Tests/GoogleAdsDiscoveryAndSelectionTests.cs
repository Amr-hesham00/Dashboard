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
        var connRepo = new GoogleAdsConnectionRepo(dbContext);

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
                        IsTestAccount = true,
                        Status = "CLOSED",
                        CurrencyCode = "EGP",
                        TimeZone = "Africa/Cairo",
                        ManagerCustomerId = "3674643588",
                        Level = 0
                    },
                    new()
                    {
                        CustomerId = "1757564917",
                        FormattedCustomerId = "175-756-4917",
                        DescriptiveName = "Alshiaka test client acc",
                        IsManager = false,
                        IsTestAccount = true,
                        Status = "CLOSED",
                        CurrencyCode = "EGP",
                        TimeZone = "Africa/Cairo",
                        ManagerCustomerId = "3674643588",
                        Level = 1
                    },
                    new()
                    {
                        CustomerId = "9750530064",
                        FormattedCustomerId = "975-053-0064",
                        DescriptiveName = "Elzero Test client acc",
                        IsManager = false,
                        IsTestAccount = true,
                        Status = "CLOSED",
                        CurrencyCode = "EGP",
                        TimeZone = "Africa/Cairo",
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
                        IsTestAccount = true,
                        Status = "CLOSED",
                        CurrencyCode = "EGP",
                        TimeZone = "Africa/Cairo",
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
                        IsTestAccount = false,
                        Status = "ENABLED",
                        CurrencyCode = "USD",
                        TimeZone = "America/New_York",
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

    private async Task<GoogleAdsConnection> SeedConnectedUserAsync(
        AppDbContext db,
        string userId,
        string accessToken = "ya29.valid_access_token",
        string refreshToken = "1//valid_refresh_token",
        DateTimeOffset? expiresAt = null)
    {
        var protector = _dataProtectionProvider.CreateProtector("Dashboard.GoogleOAuth.Tokens.v1");
        var conn = new GoogleAdsConnection
        {
            UserId = userId,
            AccessTokenEncrypted = protector.Protect(accessToken),
            RefreshTokenEncrypted = protector.Protect(refreshToken),
            AccessTokenExpiresAt = expiresAt ?? _timeProvider.GetUtcNow().AddHours(1),
            Scopes = "https://www.googleapis.com/auth/adwords",
            CreatedAt = _timeProvider.GetUtcNow(),
            UpdatedAt = _timeProvider.GetUtcNow()
        };
        db.GoogleAdsConnections.Add(conn);
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
        Assert.True(alshiakaAdv.IsTestAccount);

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
        var updatedConn = await db.GoogleAdsConnections.SingleAsync(c => c.UserId == UserA);
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
            Roles.Manager.ToString(),
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
        Assert.Equal("3674643588", persistedPlatform.LoginCustomerId);
        Assert.Equal(conn.Id, persistedPlatform.GoogleAdsConnectionId);
        Assert.Equal(Currency.EGP, persistedPlatform.Currency);
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
            Roles.Manager.ToString(),
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
            Roles.Manager.ToString(),
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
            Roles.Manager.ToString(),
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
            Roles.Manager.ToString(),
            new SelectGoogleAdsAccountRequestDto
            {
                ClientId = clientOwnedByA.Id,
                CustomerId = "1757564917"
            });
        Assert.False(userBAttemptOnUserAClient.Success);
        Assert.Equal(GoogleOAuthErrorCodes.UnauthorizedClient, userBAttemptOnUserAClient.ErrorCode);

        var userAAttemptOnUserBClient = await adsService.AssociateAccountWithClientAsync(
            UserA,
            Roles.Manager.ToString(),
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
        var activeConnection = await db.GoogleAdsConnections.AsNoTracking().FirstOrDefaultAsync();
        if (activeConnection is null)
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
            new GoogleAdsConnectionRepo(db));

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

        // 2. Verify live account selection & association inside a rolled-back DB transaction
        var ownedClient = await db.client.FirstOrDefaultAsync(c => c.ManagerId == activeConnection.UserId);
        if (ownedClient is not null)
        {
            await using var tx = await db.Database.BeginTransactionAsync();

            // MCC Manager account ID must be rejected
            var managerReject = await liveAdsService.AssociateAccountWithClientAsync(
                activeConnection.UserId,
                Roles.Manager.ToString(),
                new SelectGoogleAdsAccountRequestDto
                {
                    ClientId = ownedClient.Id,
                    CustomerId = "3674643588"
                });
            Assert.False(managerReject.Success);
            Assert.Equal(GoogleOAuthErrorCodes.UnauthorizedCustomerAccount, managerReject.ErrorCode);

            // Valid Advertiser account selection must succeed and persist
            var validSelect = await liveAdsService.AssociateAccountWithClientAsync(
                activeConnection.UserId,
                Roles.Manager.ToString(),
                new SelectGoogleAdsAccountRequestDto
                {
                    ClientId = ownedClient.Id,
                    CustomerId = "1757564917"
                });
            Assert.True(validSelect.Success);
            Assert.NotNull(validSelect.Association);
            Assert.Equal("1757564917", validSelect.Association!.CustomerId);
            Assert.Equal("3674643588", validSelect.Association.LoginCustomerId);
            Assert.Equal(activeConnection.Id, validSelect.Association.GoogleAdsConnectionId);

            await tx.RollbackAsync();
        }
    }
}
