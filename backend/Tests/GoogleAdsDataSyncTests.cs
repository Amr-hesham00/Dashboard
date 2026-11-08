using Dashboard.API.Controllers;
using Dashboard.Application.DTOs;
using Dashboard.Application.Interfaces;
using Dashboard.Application.Interfaces.Services;
using Dashboard.Application.Services;
using Dashboard.Domain.Entities;
using Dashboard.Domain.Enums;
using Dashboard.Infrastructure;
using Dashboard.Infrastructure.Repositories;
using Grpc.Core;
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

public class GoogleAdsDataSyncTests
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

    public GoogleAdsDataSyncTests()
    {
        _timeProvider = new FakeTimeProvider(new DateTimeOffset(2026, 11, 1, 10, 0, 0, TimeSpan.Zero));

        var inMemorySettings = new Dictionary<string, string?>
        {
            ["GoogleOAuth:ClientId"] = TestClientId,
            ["GoogleOAuth:ClientSecret"] = TestClientSecret,
            ["GoogleOAuth:RedirectUri"] = TestRedirectUri,
            ["GoogleAds:DeveloperToken"] = "test-dev-token-123"
        };

        _configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(inMemorySettings)
            .Build();

        _dataProtectionProvider = new EphemeralDataProtectionProvider();
        _stateStore = new GoogleOAuthStateStore(_timeProvider);
    }

    private sealed class SyncTestableGoogleAdsService : GoogleAdsService
    {
        public Func<string, string?, IReadOnlyList<string>> ListAccessibleFunc { get; set; } =
            (_, _) => new[] { "customers/3674643588" };

        public Func<string, IReadOnlyList<GoogleAdsCustomerAccountDto>> QueryDirectAccountsFunc { get; set; } =
            accessibleId => new List<GoogleAdsCustomerAccountDto>
            {
                new()
                {
                    CustomerId = "1757564917",
                    FormattedCustomerId = "175-756-4917",
                    DescriptiveName = "Alshiaka SAR Account",
                    IsManager = false,
                    CurrencyCode = "SAR",
                    ManagerCustomerId = accessibleId,
                    Level = 1
                },
                new()
                {
                    CustomerId = "9750530064",
                    FormattedCustomerId = "975-053-0064",
                    DescriptiveName = "Elzero EUR Account",
                    IsManager = false,
                    CurrencyCode = "EUR",
                    ManagerCustomerId = accessibleId,
                    Level = 1
                }
            };

        public Func<string, GoogleAdsAccountDetailsDto?> QueryAccountDetailsFunc { get; set; } =
            customerId => new GoogleAdsAccountDetailsDto
            {
                CustomerId = customerId,
                DescriptiveName = customerId == "1757564917" ? "Alshiaka SAR Account" : "Elzero EUR Account",
                CurrencyCode = customerId == "1757564917" ? "SAR" : "EUR",
                TimeZone = customerId == "1757564917" ? "Asia/Riyadh" : "Europe/Berlin"
            };

        public Func<string, IReadOnlyList<GoogleAdsCampaignRecordDto>> QueryCampaignsFunc { get; set; } =
            _ => Array.Empty<GoogleAdsCampaignRecordDto>();

        public Func<string, IReadOnlyList<GoogleAdsAdGroupRecordDto>> QueryAdGroupsFunc { get; set; } =
            _ => Array.Empty<GoogleAdsAdGroupRecordDto>();

        public Func<string, IReadOnlyList<GoogleAdsAdRecordDto>> QueryAdsFunc { get; set; } =
            _ => Array.Empty<GoogleAdsAdRecordDto>();

        public Func<string, DateOnly, DateOnly, Task<IReadOnlyList<GoogleAdsDailyMetricRecordDto>>> QueryDailyMetricsFunc { get; set; } =
            (_, _, _) => Task.FromResult<IReadOnlyList<GoogleAdsDailyMetricRecordDto>>(Array.Empty<GoogleAdsDailyMetricRecordDto>());

        public List<(string CustomerId, DateOnly StartDate, DateOnly EndDate)> RecordedMetricQueries { get; } = new();

        public SyncTestableGoogleAdsService(
            IGoogleOAuthService googleOAuthService,
            IUnitOfWork unitOfWork,
            IConfiguration configuration,
            TimeProvider timeProvider,
            ILogger<GoogleAdsService> logger)
            : base(googleOAuthService, unitOfWork, configuration, timeProvider, logger)
        {
        }

        protected override Task<IReadOnlyList<string>> ListAccessibleCustomerResourceNamesAsync(
            string refreshToken,
            string? accessToken,
            CancellationToken cancellationToken) =>
            Task.FromResult(ListAccessibleFunc(refreshToken, accessToken));

        protected override Task<IReadOnlyList<GoogleAdsCustomerAccountDto>> QueryDirectAdvertiserAccountsAsync(
            string refreshToken,
            string? accessToken,
            string accessibleCustomerId,
            CancellationToken cancellationToken) =>
            Task.FromResult(QueryDirectAccountsFunc(accessibleCustomerId));

        protected override Task<GoogleAdsAccountDetailsDto?> QueryAccountDetailsAsync(
            string refreshToken,
            string? accessToken,
            string customerId,
            string? loginCustomerId,
            CancellationToken cancellationToken) =>
            Task.FromResult(QueryAccountDetailsFunc(customerId));

        protected override Task<IReadOnlyList<GoogleAdsCampaignRecordDto>> QueryCampaignsAsync(
            string refreshToken,
            string? accessToken,
            string customerId,
            string? loginCustomerId,
            CancellationToken cancellationToken) =>
            Task.FromResult(QueryCampaignsFunc(customerId));

        protected override Task<IReadOnlyList<GoogleAdsAdGroupRecordDto>> QueryAdGroupsAsync(
            string refreshToken,
            string? accessToken,
            string customerId,
            string? loginCustomerId,
            CancellationToken cancellationToken) =>
            Task.FromResult(QueryAdGroupsFunc(customerId));

        protected override Task<IReadOnlyList<GoogleAdsAdRecordDto>> QueryAdsAsync(
            string refreshToken,
            string? accessToken,
            string customerId,
            string? loginCustomerId,
            CancellationToken cancellationToken) =>
            Task.FromResult(QueryAdsFunc(customerId));

        protected override async Task<IReadOnlyList<GoogleAdsDailyMetricRecordDto>> QueryDailyMetricsAsync(
            string refreshToken,
            string? accessToken,
            string customerId,
            string? loginCustomerId,
            DateOnly startDate,
            DateOnly endDate,
            CancellationToken cancellationToken)
        {
            RecordedMetricQueries.Add((customerId, startDate, endDate));
            return await QueryDailyMetricsFunc(customerId, startDate, endDate);
        }
    }

    private static HttpMessageHandler CreateDefaultRefreshTokenHandler()
    {
        var mockHttp = new Mock<HttpMessageHandler>();
        mockHttp.Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.Is<HttpRequestMessage>(req =>
                    req.Method == HttpMethod.Post &&
                    req.RequestUri!.ToString() == "https://oauth2.googleapis.com/token"),
                ItExpr.IsAny<CancellationToken>())
            .ReturnsAsync(() => new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = JsonContent.Create(new GoogleTokenResponse
                {
                    AccessToken = "ya29.auto_refreshed_access_token",
                    ExpiresIn = 3600,
                    Scope = "https://www.googleapis.com/auth/adwords"
                })
            });
        return mockHttp.Object;
    }

    private (
        GoogleOAuthService OAuthService,
        SyncTestableGoogleAdsService AdsService,
        AppDbContext DbContext,
        UnitOfWork UnitOfWork)
        CreateHarness(HttpMessageHandler? httpHandler = null)
    {
        var dbOptions = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        var db = new AppDbContext(dbOptions);

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

        var handler = httpHandler ?? CreateDefaultRefreshTokenHandler();
        var httpClient = new HttpClient(handler);

        var oauthService = new GoogleOAuthService(
            httpClient,
            uow,
            _dataProtectionProvider,
            _stateStore,
            _configuration,
            _timeProvider,
            Mock.Of<ILogger<GoogleOAuthService>>());

        var adsService = new SyncTestableGoogleAdsService(
            oauthService,
            uow,
            _configuration,
            _timeProvider,
            Mock.Of<ILogger<GoogleAdsService>>());

        return (oauthService, adsService, db, uow);
    }

    private async Task<OAuthConnection> SeedOAuthConnectionAsync(
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
        string managerId,
        string companyName,
        Currency unitCurrency = Currency.USD)
    {
        var client = new Client
        {
            CompanyName = companyName,
            Website = "https://example.com",
            Email = "info@example.com",
            Phone = "+201000000000",
            Country = "SA",
            ManagerId = managerId,
            BusinessModel = BusinessModel.Ecommerce,
            Status = ClientStatus.Active,
            UnitCurrency = unitCurrency,
            CreatedAt = DateTimeOffset.UtcNow
        };
        db.client.Add(client);
        await db.SaveChangesAsync();
        return client;
    }

    // ─── 1, 2, 3, 4: Account, Hierarchy, Original Currency Storage & Initial 30-Day Import ───

    [Fact]
    public async Task InitialConnection_Retrieves30DaysHierarchyAndMetrics_StoresOriginalCurrencyAndRelationships()
    {
        // Arrange
        var (_, adsService, db, _) = CreateHarness();
        await SeedOAuthConnectionAsync(db, UserA);
        var client = await SeedClientAsync(db, UserA, "Alshiaka Store", unitCurrency: Currency.USD);

        var assoc = await adsService.AssociateAccountWithClientAsync(
            UserA,
            new SelectGoogleAdsAccountRequestDto
            {
                ClientId = client.Id,
                CustomerId = "175-756-4917"
            });
        Assert.True(assoc.Success);

        var today = DateOnly.FromDateTime(_timeProvider.GetUtcNow().UtcDateTime);

        adsService.QueryCampaignsFunc = _ => new List<GoogleAdsCampaignRecordDto>
        {
            new()
            {
                ExternalId = "camp-1001",
                Name = "Riyadh Winter Sale",
                Status = CampaignStatus.Active,
                Objective = CampaignObjective.Sales
            }
        };

        adsService.QueryAdGroupsFunc = _ => new List<GoogleAdsAdGroupRecordDto>
        {
            new()
            {
                ExternalId = "ag-2001",
                CampaignExternalId = "camp-1001",
                Name = "Thobe Search Keywords",
                Status = AdSetStatus.Active,
                AudienceType = "Search"
            }
        };

        adsService.QueryAdsFunc = _ => new List<GoogleAdsAdRecordDto>
        {
            new()
            {
                ExternalId = "ad-3001",
                AdGroupExternalId = "ag-2001",
                CampaignExternalId = "camp-1001",
                Name = "Winter Thobe RSA",
                Headline = "Shop Premium Thobes",
                Description = "Free shipping across KSA",
                MediaUrl = "https://alshiaka.com/winter",
                MediaType = MediaType.Image,
                Status = AdStatus.Active
            }
        };

        // 250.75 SAR in micros = 250,750,000 micros; conversion value = 1,120.50 SAR
        adsService.QueryDailyMetricsFunc = (_, _, _) => Task.FromResult<IReadOnlyList<GoogleAdsDailyMetricRecordDto>>(
            new List<GoogleAdsDailyMetricRecordDto>
            {
                new()
                {
                    AdExternalId = "ad-3001",
                    AdGroupExternalId = "ag-2001",
                    CampaignExternalId = "camp-1001",
                    Date = today.AddDays(-2),
                    Impressions = 1500,
                    Clicks = 120,
                    CostMicros = 250_750_000L,
                    Conversions = 8,
                    ConversionsValue = 1120.50
                },
                new()
                {
                    AdExternalId = "ad-3001",
                    AdGroupExternalId = "ag-2001",
                    CampaignExternalId = "camp-1001",
                    Date = today,
                    Impressions = 900,
                    Clicks = 75,
                    CostMicros = 125_000_000L,
                    Conversions = 4,
                    ConversionsValue = 640.25
                }
            });

        // Act
        var syncResult = await adsService.SynchronizePlatformAsync(assoc.Association!.PlatformId);

        // Assert
        Assert.True(syncResult.Success);
        Assert.Equal("175-756-4917", syncResult.ExternalId);
        Assert.True(syncResult.IsInitialImport);
        Assert.Equal("SAR", syncResult.Currency);
        Assert.Equal("Asia/Riyadh", syncResult.TimeZone);
        Assert.Equal(today.AddDays(-30), syncResult.SyncedFromDate);
        Assert.Equal(today, syncResult.SyncedToDate);

        var refreshedClient = await db.client.FindAsync(client.Id);
        Assert.NotNull(refreshedClient);
        Assert.Equal("175-756-4917", refreshedClient!.ExternalId);

        // Verify exact 30-day initial query window in a single request
        var singleQuery = Assert.Single(adsService.RecordedMetricQueries);
        Assert.Equal("1757564917", singleQuery.CustomerId);
        Assert.Equal(today.AddDays(-30), singleQuery.StartDate);
        Assert.Equal(today, singleQuery.EndDate);

        // Verify Client -> Platform -> Campaign -> AdSet -> Ad -> AdDailyMetrics hierarchy & SAR currency storage
        var platform = await db.platform.SingleAsync(p => p.Id == assoc.Association.PlatformId);
        Assert.Equal(Currency.SAR, platform.Currency);
        Assert.Equal("Asia/Riyadh", platform.TimeZone);
        Assert.Equal(_timeProvider.GetUtcNow(), platform.LastSyncedAt);
        Assert.Equal(_timeProvider.GetUtcNow(), platform.LastBackfillAt);

        var campaign = await db.campaign.SingleAsync(c => c.PlatformId == platform.Id);
        Assert.Equal("camp-1001", campaign.ExternalId);
        Assert.Equal("Riyadh Winter Sale", campaign.Name);
        Assert.Equal(Currency.SAR, campaign.Currency); // Stored in original SAR, NOT converted to Client's USD

        var adSet = await db.adset.SingleAsync(a => a.CampaignId == campaign.Id);
        Assert.Equal("ag-2001", adSet.ExternalId);
        Assert.Equal("Thobe Search Keywords", adSet.Name);

        var ad = await db.ad.SingleAsync(a => a.AdSetId == adSet.Id);
        Assert.Equal("ad-3001", ad.ExternalId);
        Assert.Equal("Shop Premium Thobes", ad.Headline);

        var metrics = await db.AdDailyMetrics
            .Where(m => m.AdId == ad.Id)
            .OrderBy(m => m.Date)
            .ToListAsync();
        Assert.Equal(2, metrics.Count);

        // Verify original SAR amounts (250.75 SAR and 1120.50 SAR) stored without conversion to USD
        Assert.Equal(today.AddDays(-2), metrics[0].Date);
        Assert.Equal(250.75, metrics[0].Spend);
        Assert.Equal(1120.50, metrics[0].Revenue);
        Assert.Equal(1500, metrics[0].Impressions);
        Assert.Equal(120, metrics[0].Clicks);
        Assert.Equal(8, metrics[0].Conversions);

        Assert.Equal(today, metrics[1].Date);
        Assert.Equal(125.00, metrics[1].Spend);
        Assert.Equal(640.25, metrics[1].Revenue);
    }

    // ─── 5: Reconnection From Last Successful Sync Date & Non-Deletion of Existing Records ───

    [Fact]
    public async Task Reconnection_AfterDisconnect_ResumesFromLastSyncDateAndPreservesExistingRecords()
    {
        // Arrange: Initial connection on Nov 1
        var (_, adsService, db, _) = CreateHarness();
        await SeedOAuthConnectionAsync(db, UserA);
        var client = await SeedClientAsync(db, UserA, "Alshiaka Store");

        var assoc = await adsService.AssociateAccountWithClientAsync(
            UserA,
            new SelectGoogleAdsAccountRequestDto { ClientId = client.Id, CustomerId = "1757564917" });

        adsService.QueryCampaignsFunc = _ => new List<GoogleAdsCampaignRecordDto>
        {
            new() { ExternalId = "camp-1", Name = "Legacy Campaign", Status = CampaignStatus.Active, Objective = CampaignObjective.Traffic }
        };
        adsService.QueryAdGroupsFunc = _ => new List<GoogleAdsAdGroupRecordDto>
        {
            new() { ExternalId = "ag-1", CampaignExternalId = "camp-1", Name = "AdGroup 1", Status = AdSetStatus.Active }
        };
        adsService.QueryAdsFunc = _ => new List<GoogleAdsAdRecordDto>
        {
            new() { ExternalId = "ad-1", AdGroupExternalId = "ag-1", Name = "Ad 1", Headline = "Headline 1", Status = AdStatus.Active }
        };

        var initialSync = await adsService.SynchronizePlatformAsync(assoc.Association!.PlatformId);
        Assert.True(initialSync.Success);
        var initialSyncDate = DateOnly.FromDateTime(_timeProvider.GetUtcNow().UtcDateTime);

        // Disconnect the client's Google Ads account
        var disconnect = await adsService.DisconnectClientAccountAsync(UserA, client.Id);
        Assert.True(disconnect.Success);

        // Advance time by 3 days (Nov 4 - weekly backfill is NOT due yet since < 7 days)
        _timeProvider.Advance(TimeSpan.FromDays(3));
        var reconnectDate = DateOnly.FromDateTime(_timeProvider.GetUtcNow().UtcDateTime);

        // Reconnect the Google Ads account
        var reconnectAssoc = await adsService.AssociateAccountWithClientAsync(
            UserA,
            new SelectGoogleAdsAccountRequestDto { ClientId = client.Id, CustomerId = "1757564917" });
        Assert.True(reconnectAssoc.Success);

        adsService.RecordedMetricQueries.Clear();

        // Suppose API now returns only a new campaign "camp-2" and omits "camp-1":
        // Requirement: Do not delete existing records simply because they are missing from an API response.
        adsService.QueryCampaignsFunc = _ => new List<GoogleAdsCampaignRecordDto>
        {
            new() { ExternalId = "camp-2", Name = "New Reconnected Campaign", Status = CampaignStatus.Active, Objective = CampaignObjective.Sales }
        };

        // Act: Synchronize after reconnection
        var reconnectSync = await adsService.SynchronizePlatformAsync(reconnectAssoc.Association!.PlatformId);

        // Assert: Resumed from initialSyncDate (Nov 1) to reconnectDate (Nov 4), NOT a 30-day re-import!
        Assert.True(reconnectSync.Success);
        Assert.False(reconnectSync.IsInitialImport);
        Assert.True(reconnectSync.IsReconnectionSync);
        Assert.False(reconnectSync.BackfillExecuted);
        Assert.Equal(initialSyncDate, reconnectSync.SyncedFromDate);
        Assert.Equal(reconnectDate, reconnectSync.SyncedToDate);

        var query = Assert.Single(adsService.RecordedMetricQueries);
        Assert.Equal(initialSyncDate, query.StartDate);
        Assert.Equal(reconnectDate, query.EndDate);

        // Verify both "camp-1" (preserved) and "camp-2" (newly added) exist in DB without duplicates
        var campaigns = await db.campaign.Where(c => c.PlatformId == reconnectAssoc.Association.PlatformId).ToListAsync();
        Assert.Equal(2, campaigns.Count);
        Assert.Contains(campaigns, c => c.ExternalId == "camp-1");
        Assert.Contains(campaigns, c => c.ExternalId == "camp-2");
    }

    // ─── 6 & 7: Incremental Sync With Long Gaps (> 7 Days & > 30 Days) and Weekly 30-Day Backfill ───

    [Fact]
    public async Task WeeklyBackfill_WhenDueAndCoversSyncGap_UsesSingleUnified30DayRequestAndUpdatesCorrectedMetrics()
    {
        // Arrange: Initial sync on Nov 1
        var (_, adsService, db, _) = CreateHarness();
        await SeedOAuthConnectionAsync(db, UserA);
        var client = await SeedClientAsync(db, UserA, "Alshiaka Store");
        var assoc = await adsService.AssociateAccountWithClientAsync(
            UserA,
            new SelectGoogleAdsAccountRequestDto { ClientId = client.Id, CustomerId = "1757564917" });

        var day0 = DateOnly.FromDateTime(_timeProvider.GetUtcNow().UtcDateTime);

        adsService.QueryCampaignsFunc = _ => new List<GoogleAdsCampaignRecordDto>
        {
            new() { ExternalId = "camp-1", Name = "Campaign 1", Status = CampaignStatus.Active }
        };
        adsService.QueryAdGroupsFunc = _ => new List<GoogleAdsAdGroupRecordDto>
        {
            new() { ExternalId = "ag-1", CampaignExternalId = "camp-1", Name = "AdGroup 1", Status = AdSetStatus.Active }
        };
        adsService.QueryAdsFunc = _ => new List<GoogleAdsAdRecordDto>
        {
            new() { ExternalId = "ad-1", AdGroupExternalId = "ag-1", Name = "Ad 1", Headline = "H1", Status = AdStatus.Active }
        };
        adsService.QueryDailyMetricsFunc = (_, _, _) => Task.FromResult<IReadOnlyList<GoogleAdsDailyMetricRecordDto>>(
            new List<GoogleAdsDailyMetricRecordDto>
            {
                new()
                {
                    AdExternalId = "ad-1",
                    AdGroupExternalId = "ag-1",
                    Date = day0,
                    Impressions = 500,
                    Clicks = 25,
                    CostMicros = 50_000_000L, // 50.00 SAR initially reported
                    Conversions = 2,
                    ConversionsValue = 200.0
                }
            });

        await adsService.SynchronizePlatformAsync(assoc.Association!.PlatformId);
        adsService.RecordedMetricQueries.Clear();

        // Advance 10 days (gap > 7 days AND weekly backfill is due since >= 7 days)
        _timeProvider.Advance(TimeSpan.FromDays(10));
        var day10 = DateOnly.FromDateTime(_timeProvider.GetUtcNow().UtcDateTime);

        // Google Ads reports corrected metrics for day0 (48.25 SAR, 3 conversions) + new metrics for day10
        adsService.QueryDailyMetricsFunc = (_, _, _) => Task.FromResult<IReadOnlyList<GoogleAdsDailyMetricRecordDto>>(
            new List<GoogleAdsDailyMetricRecordDto>
            {
                new()
                {
                    AdExternalId = "ad-1",
                    AdGroupExternalId = "ag-1",
                    Date = day0,
                    Impressions = 510,
                    Clicks = 26,
                    CostMicros = 48_250_000L, // Corrected to 48.25 SAR
                    Conversions = 3,
                    ConversionsValue = 310.0
                },
                new()
                {
                    AdExternalId = "ad-1",
                    AdGroupExternalId = "ag-1",
                    Date = day10,
                    Impressions = 700,
                    Clicks = 40,
                    CostMicros = 90_000_000L, // 90.00 SAR
                    Conversions = 5,
                    ConversionsValue = 500.0
                }
            });

        // Act
        var syncResult = await adsService.SynchronizePlatformAsync(assoc.Association.PlatformId);

        // Assert: Because the 30-day backfill window [day10 - 30d, day10] covers the 10-day sync gap,
        // only ONE request is made for [day10 - 30d, day10] (no duplicate request for [day0, day10])
        Assert.True(syncResult.Success);
        Assert.True(syncResult.BackfillExecuted);
        var singleQuery = Assert.Single(adsService.RecordedMetricQueries);
        Assert.Equal(day10.AddDays(-30), singleQuery.StartDate);
        Assert.Equal(day10, singleQuery.EndDate);

        // Verify day0 metric was updated in-place (no duplicate rows) and day10 metric was inserted
        var ad = await db.ad.SingleAsync();
        var metrics = await db.AdDailyMetrics.Where(m => m.AdId == ad.Id).OrderBy(m => m.Date).ToListAsync();
        Assert.Equal(2, metrics.Count);

        Assert.Equal(day0, metrics[0].Date);
        Assert.Equal(48.25, metrics[0].Spend);
        Assert.Equal(310.0, metrics[0].Revenue);
        Assert.Equal(3, metrics[0].Conversions);

        Assert.Equal(day10, metrics[1].Date);
        Assert.Equal(90.00, metrics[1].Spend);
    }

    [Fact]
    public async Task IncrementalSync_WhenGapExceeds30DayBackfillWindow_FetchesOlderGapInChunksPlusBackfillWithoutOverlap()
    {
        // Arrange: Initial sync on Nov 1
        var (_, adsService, db, _) = CreateHarness();
        await SeedOAuthConnectionAsync(db, UserA);
        var client = await SeedClientAsync(db, UserA, "Alshiaka Store");
        var assoc = await adsService.AssociateAccountWithClientAsync(
            UserA,
            new SelectGoogleAdsAccountRequestDto { ClientId = client.Id, CustomerId = "1757564917" });

        var day0 = DateOnly.FromDateTime(_timeProvider.GetUtcNow().UtcDateTime);
        await adsService.SynchronizePlatformAsync(assoc.Association!.PlatformId);
        adsService.RecordedMetricQueries.Clear();

        // Advance 75 days: missing gap is 75 days (exceeds 30-day backfill window and requires chunking)
        _timeProvider.Advance(TimeSpan.FromDays(75));
        var day75 = DateOnly.FromDateTime(_timeProvider.GetUtcNow().UtcDateTime);

        // Act
        var syncResult = await adsService.SynchronizePlatformAsync(assoc.Association.PlatformId);

        // Assert:
        // Older gap [day0, day75 - 31d] is split into chunks and followed by 30-day backfill [day75 - 30d, day75]
        // with zero overlapping dates between normal sync and backfill!
        Assert.True(syncResult.Success);
        Assert.True(syncResult.BackfillExecuted);
        Assert.Equal(day0, syncResult.SyncedFromDate);
        Assert.Equal(day75, syncResult.SyncedToDate);

        var coveredDates = new List<DateOnly>();
        foreach (var (_, start, end) in adsService.RecordedMetricQueries)
        {
            for (var d = start; d <= end; d = d.AddDays(1))
            {
                coveredDates.Add(d);
            }
        }

        // Every single day from day0 through day75 is queried exactly once (no missing dates, no duplicate dates)
        Assert.Equal(76, coveredDates.Count);
        Assert.Equal(coveredDates.Count, coveredDates.Distinct().Count());
        Assert.Equal(day0, coveredDates.First());
        Assert.Equal(day75, coveredDates.Last());
    }

    // ─── 9: Strict Single Platform & Client Ownership Verification ───────────────────────────

    [Fact]
    public async Task SynchronizePlatform_WhenClientDoesNotOwnPlatform_FailsWithUnauthorizedAndDoesNotSynchronize()
    {
        // Arrange: Client A owns Platform A; Client B attempts to sync Platform A
        var (_, adsService, db, _) = CreateHarness();
        await SeedOAuthConnectionAsync(db, UserA);
        var clientA = await SeedClientAsync(db, UserA, "Client A");
        var clientB = await SeedClientAsync(db, UserA, "Client B");

        var assocA = await adsService.AssociateAccountWithClientAsync(
            UserA,
            new SelectGoogleAdsAccountRequestDto { ClientId = clientA.Id, CustomerId = "1757564917" });
        Assert.True(assocA.Success);

        // Act: Client B requests sync for Client A's platform
        var syncResult = await adsService.SynchronizePlatformAsync(clientB.Id, assocA.Association!.PlatformId);

        // Assert: Access is forbidden and platform sync is rejected
        Assert.False(syncResult.Success);
        Assert.Equal(GoogleOAuthErrorCodes.UnauthorizedClient, syncResult.ErrorCode);

        var platformInDb = await db.platform.SingleAsync(p => p.Id == assocA.Association.PlatformId);
        Assert.Null(platformInDb.LastSyncedAt);
        Assert.Null(platformInDb.LastSyncStatus);
    }

    [Fact]
    public async Task SynchronizePlatform_WhenPlatformIsNotGoogleAds_RejectsOperation()
    {
        // Arrange: Client has a MetaAds platform record
        var (_, adsService, db, _) = CreateHarness();
        var client = await SeedClientAsync(db, UserA, "Client With Meta");

        var metaPlatform = new Platform
        {
            ClientId = client.Id,
            PlatformType = PlatformType.MetaAds,
            Status = PlatformStatus.Connected,
            Currency = Currency.USD,
            ExternalAccountId = "act_12345",
            AccountName = "Meta Ads Account",
            CreatedAt = _timeProvider.GetUtcNow()
        };
        db.platform.Add(metaPlatform);
        await db.SaveChangesAsync();

        // Act: Attempt to run Google Ads sync on a Meta platform
        var syncResult = await adsService.SynchronizePlatformAsync(client.Id, metaPlatform.Id);

        // Assert: Rejected with not connected / not supported error
        Assert.False(syncResult.Success);
        Assert.Equal(GoogleOAuthErrorCodes.PlatformNotConnected, syncResult.ErrorCode);

        var platformInDb = await db.platform.SingleAsync(p => p.Id == metaPlatform.Id);
        Assert.Null(platformInDb.LastSyncedAt);
        Assert.Null(platformInDb.LastSyncStatus);
    }

    [Fact]
    public async Task RefreshPlatform_SynchronizesOnlySelectedPlatformAndDoesNotTouchOtherPlatformsOrClients()
    {
        // Arrange: Two clients (Client A -> SAR account 1757564917, Client B -> EUR account 9750530064)
        var (_, adsService, db, _) = CreateHarness();
        await SeedOAuthConnectionAsync(db, UserA);
        var clientA = await SeedClientAsync(db, UserA, "Client A (SAR)");
        var clientB = await SeedClientAsync(db, UserA, "Client B (EUR)");

        var metaOnClientA = new Platform
        {
            ClientId = clientA.Id,
            PlatformType = PlatformType.MetaAds,
            Status = PlatformStatus.Connected,
            Currency = Currency.USD,
            ExternalAccountId = "act_meta_a",
            CreatedAt = _timeProvider.GetUtcNow()
        };
        db.platform.Add(metaOnClientA);
        await db.SaveChangesAsync();

        var assocA = await adsService.AssociateAccountWithClientAsync(
            UserA,
            new SelectGoogleAdsAccountRequestDto { ClientId = clientA.Id, CustomerId = "1757564917" });
        var assocB = await adsService.AssociateAccountWithClientAsync(
            UserA,
            new SelectGoogleAdsAccountRequestDto { ClientId = clientB.Id, CustomerId = "9750530064" });

        adsService.QueryCampaignsFunc = customerId => new List<GoogleAdsCampaignRecordDto>
        {
            new()
            {
                ExternalId = $"camp-{customerId}",
                Name = $"Campaign for {customerId}",
                Status = CampaignStatus.Active
            }
        };

        // Act: Refresh ONLY Client A's Google Ads platform
        var refreshResult = await adsService.SynchronizePlatformAsync(assocA.Association!.PlatformId);

        // Assert
        Assert.True(refreshResult.Success);
        Assert.Equal("SAR", refreshResult.Currency);

        // Meta on Client A and Google Ads on Client B must NOT have been synchronized
        var dbMetaA = await db.platform.SingleAsync(p => p.Id == metaOnClientA.Id);
        var dbGoogleB = await db.platform.SingleAsync(p => p.Id == assocB.Association!.PlatformId);
        Assert.Null(dbMetaA.LastSyncedAt);
        Assert.Null(dbGoogleB.LastSyncedAt);

        // Now synchronize Client B's Google Ads platform and verify strict client & currency isolation
        var refreshB = await adsService.SynchronizePlatformAsync(assocB.Association!.PlatformId);
        Assert.True(refreshB.Success);
        Assert.Equal("EUR", refreshB.Currency);

        var campA = await db.campaign.SingleAsync(c => c.PlatformId == assocA.Association.PlatformId);
        var campB = await db.campaign.SingleAsync(c => c.PlatformId == assocB.Association.PlatformId);

        Assert.Equal("camp-1757564917", campA.ExternalId);
        Assert.Equal(Currency.SAR, campA.Currency);

        Assert.Equal("camp-9750530064", campB.ExternalId);
        Assert.Equal(Currency.EUR, campB.Currency);
    }

    // ─── 11 & 12: Revoked Auth Failure, Transient Retry Recovery & Concurrency Protection ───

    [Fact]
    public async Task RevokedOAuthCredentials_MarksPlatformSyncFailedAndDoesNotAdvanceSyncTimestamp()
    {
        // Arrange: Mock Google token endpoint returning invalid_grant for revoked refresh token
        var mockHttp = new Mock<HttpMessageHandler>();
        mockHttp.Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>())
            .ReturnsAsync(() => new HttpResponseMessage(HttpStatusCode.BadRequest)
            {
                Content = JsonContent.Create(new GoogleTokenErrorResponse { Error = "invalid_grant" })
            });

        var (_, adsService, db, _) = CreateHarness(httpHandler: mockHttp.Object);

        // Seed valid access token initially so association succeeds
        var conn = await SeedOAuthConnectionAsync(
            db,
            UserA,
            expiresAt: _timeProvider.GetUtcNow().AddMinutes(10));
        var client = await SeedClientAsync(db, UserA, "Auth Failure Client");

        var assoc = await adsService.AssociateAccountWithClientAsync(
            UserA,
            new SelectGoogleAdsAccountRequestDto { ClientId = client.Id, CustomerId = "1757564917" });
        Assert.True(assoc.Success);

        // Advance time by 1 hour so access token expires and refresh token fails with invalid_grant
        _timeProvider.Advance(TimeSpan.FromHours(1));

        // Act
        var syncResult = await adsService.SynchronizePlatformAsync(assoc.Association!.PlatformId);

        // Assert
        Assert.False(syncResult.Success);
        Assert.Equal(GoogleOAuthErrorCodes.InvalidGrant, syncResult.ErrorCode);

        var platform = await db.platform.SingleAsync(p => p.Id == assoc.Association.PlatformId);
        Assert.Null(platform.LastSyncedAt);
        Assert.Equal("Failed", platform.LastSyncStatus);
    }

    [Fact]
    public async Task TransientApiFailure_RetriesAutomaticallyAndCompletesSynchronization()
    {
        // Arrange
        var (_, adsService, db, _) = CreateHarness();
        await SeedOAuthConnectionAsync(db, UserA);
        var client = await SeedClientAsync(db, UserA, "Retry Client");
        var assoc = await adsService.AssociateAccountWithClientAsync(
            UserA,
            new SelectGoogleAdsAccountRequestDto { ClientId = client.Id, CustomerId = "1757564917" });

        int attempts = 0;
        adsService.QueryCampaignsFunc = _ =>
        {
            attempts++;
            if (attempts < 3)
            {
                throw new RpcException(new Status(StatusCode.Unavailable, "Temporary Google Ads service unavailability."));
            }

            return new List<GoogleAdsCampaignRecordDto>
            {
                new() { ExternalId = "camp-retry-1", Name = "Recovered Campaign", Status = CampaignStatus.Active }
            };
        };

        // Act
        var result = await adsService.SynchronizePlatformAsync(assoc.Association!.PlatformId);

        // Assert
        Assert.True(result.Success);
        Assert.Equal(3, attempts);
        Assert.Equal(1, result.CampaignsSynced);
    }

    [Fact]
    public async Task ConcurrentSynchronization_SamePlatformAccount_PreventsOverlappingExecution()
    {
        // Arrange
        var (_, adsService, db, _) = CreateHarness();
        await SeedOAuthConnectionAsync(db, UserA);
        var client = await SeedClientAsync(db, UserA, "Concurrency Client");
        var assoc = await adsService.AssociateAccountWithClientAsync(
            UserA,
            new SelectGoogleAdsAccountRequestDto { ClientId = client.Id, CustomerId = "1757564917" });

        var tcsEntered = new TaskCompletionSource<bool>(TaskCreationOptions.RunContinuationsAsynchronously);
        var tcsRelease = new TaskCompletionSource<bool>(TaskCreationOptions.RunContinuationsAsynchronously);

        adsService.QueryDailyMetricsFunc = async (_, _, _) =>
        {
            tcsEntered.TrySetResult(true);
            await tcsRelease.Task;
            return Array.Empty<GoogleAdsDailyMetricRecordDto>();
        };

        // Act: Start first sync and wait until it holds the platform lock
        var firstSyncTask = adsService.SynchronizePlatformAsync(assoc.Association!.PlatformId);
        await tcsEntered.Task;

        // Attempt a second concurrent sync on the same platform account
        var secondSyncResult = await adsService.SynchronizePlatformAsync(assoc.Association.PlatformId);

        // Release first sync
        tcsRelease.SetResult(true);
        var firstSyncResult = await firstSyncTask;

        // Assert
        Assert.True(firstSyncResult.Success);
        Assert.False(secondSyncResult.Success);
        Assert.True(secondSyncResult.SkippedBecauseRunning);
        Assert.Equal(GoogleOAuthErrorCodes.SyncAlreadyInProgress, secondSyncResult.ErrorCode);
    }
}
