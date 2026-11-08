using Dashboard.Application.DTOs;
using Dashboard.Application.Interfaces;
using Dashboard.Application.Interfaces.Services;
using Dashboard.Application.Services;
using Dashboard.Domain.Entities;
using Dashboard.Domain.Enums;
using Dashboard.Infrastructure;
using Dashboard.Infrastructure.Repositories;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Time.Testing;
using Moq;
using Moq.Protected;
using System.Net;
using System.Net.Http.Json;
using Xunit;

namespace Dashboard.Tests;

public class GoogleAdsPerformanceMaxTests
{
    private const string TestClientId = "243100354746-ts5ocku0ekqb382ccgvmktd4dtlijmvs.apps.googleusercontent.com";
    private const string TestClientSecret = "mock_super_secret_client_key_12345";
    private const string TestRedirectUri = "https://localhost:3000/api/google-ads/callback";
    private const string UserManager = "user-manager-pmax";

    private readonly FakeTimeProvider _timeProvider;
    private readonly IConfiguration _configuration;
    private readonly IDataProtectionProvider _dataProtectionProvider;
    private readonly GoogleOAuthStateStore _stateStore;

    public GoogleAdsPerformanceMaxTests()
    {
        _timeProvider = new FakeTimeProvider(new DateTimeOffset(2026, 11, 1, 10, 0, 0, TimeSpan.Zero));

        var inMemorySettings = new Dictionary<string, string?>
        {
            ["GoogleOAuth:ClientId"] = TestClientId,
            ["GoogleOAuth:ClientSecret"] = TestClientSecret,
            ["GoogleOAuth:RedirectUri"] = TestRedirectUri,
            ["GoogleAds:DeveloperToken"] = "test-dev-token-pmax"
        };

        _configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(inMemorySettings)
            .Build();

        _dataProtectionProvider = new EphemeralDataProtectionProvider();
        _stateStore = new GoogleOAuthStateStore(_timeProvider);
    }

    private sealed class PMaxTestableGoogleAdsService : GoogleAdsService
    {
        public Func<string, GoogleAdsAccountDetailsDto?> QueryAccountDetailsFunc { get; set; } =
            customerId => new GoogleAdsAccountDetailsDto
            {
                CustomerId = customerId,
                DescriptiveName = "Test Google Ads Account",
                CurrencyCode = "USD",
                TimeZone = "America/New_York"
            };

        public Func<string, IReadOnlyList<GoogleAdsCampaignRecordDto>> QueryCampaignsFunc { get; set; } =
            _ => Array.Empty<GoogleAdsCampaignRecordDto>();

        public Func<string, IReadOnlyList<GoogleAdsAdGroupRecordDto>> QueryAdGroupsFunc { get; set; } =
            _ => Array.Empty<GoogleAdsAdGroupRecordDto>();

        public Func<string, IReadOnlyList<GoogleAdsAdRecordDto>> QueryAdsFunc { get; set; } =
            _ => Array.Empty<GoogleAdsAdRecordDto>();

        public Func<string, IReadOnlyList<GoogleAdsAssetGroupRecordDto>> QueryAssetGroupsFunc { get; set; } =
            _ => Array.Empty<GoogleAdsAssetGroupRecordDto>();

        public Func<string, DateOnly, DateOnly, Task<IReadOnlyList<GoogleAdsDailyMetricRecordDto>>> QueryDailyMetricsFunc { get; set; } =
            (_, _, _) => Task.FromResult<IReadOnlyList<GoogleAdsDailyMetricRecordDto>>(Array.Empty<GoogleAdsDailyMetricRecordDto>());

        public Func<string, DateOnly, DateOnly, Task<IReadOnlyList<GoogleAdsDailyAssetGroupMetricRecordDto>>> QueryDailyAssetGroupMetricsFunc { get; set; } =
            (_, _, _) => Task.FromResult<IReadOnlyList<GoogleAdsDailyAssetGroupMetricRecordDto>>(Array.Empty<GoogleAdsDailyAssetGroupMetricRecordDto>());

        public PMaxTestableGoogleAdsService(
            IGoogleOAuthService googleOAuthService,
            IUnitOfWork unitOfWork,
            IConfiguration configuration,
            TimeProvider timeProvider,
            ILogger<GoogleAdsService> logger)
            : base(googleOAuthService, unitOfWork, configuration, timeProvider, logger)
        {
        }

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

        protected override Task<IReadOnlyList<GoogleAdsAssetGroupRecordDto>> QueryAssetGroupsAsync(
            string refreshToken,
            string? accessToken,
            string customerId,
            string? loginCustomerId,
            CancellationToken cancellationToken) =>
            Task.FromResult(QueryAssetGroupsFunc(customerId));

        protected override async Task<IReadOnlyList<GoogleAdsDailyMetricRecordDto>> QueryDailyMetricsAsync(
            string refreshToken,
            string? accessToken,
            string customerId,
            string? loginCustomerId,
            DateOnly startDate,
            DateOnly endDate,
            CancellationToken cancellationToken)
        {
            return await QueryDailyMetricsFunc(customerId, startDate, endDate);
        }

        protected override async Task<IReadOnlyList<GoogleAdsDailyAssetGroupMetricRecordDto>> QueryDailyAssetGroupMetricsAsync(
            string refreshToken,
            string? accessToken,
            string customerId,
            string? loginCustomerId,
            DateOnly startDate,
            DateOnly endDate,
            CancellationToken cancellationToken)
        {
            return await QueryDailyAssetGroupMetricsFunc(customerId, startDate, endDate);
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
                    AccessToken = "test-refreshed-access-token",
                    ExpiresIn = 3600,
                    TokenType = "Bearer"
                })
            });
        return mockHttp.Object;
    }

    private (AppDbContext Db, IUnitOfWork Uow, GoogleOAuthService OAuthService) CreateTestContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        var db = new AppDbContext(options);

        var adRepo = new AdRepo(db);
        var adSetRepo = new AdSetRepo(db);
        var assignmentRepo = new AssignmentRepo(db);
        var associateProfileRepo = new AssociateProfileRepo(db);
        var associateTeamRepo = new AssociateTeamRepo(db);
        var campaignRepo = new CampaignRepo(db);
        var clientRepo = new ClientRepo(db);
        var platformRepo = new PlatformRepo(db);
        var userRepo = new UserRepo(db);
        var refreshTokenRepo = new RefreshTokenRepo(db);
        var clientTargetRepo = new ClientTargetRepo(db);
        var adDailyMetricsRepo = new AdDailyMetricsRepo(db);
        var searchTermRepo = new SearchTermRepo(db);
        var exchangeRateRepo = new ExchangeRateRepo(db);
        var oauthConnectionRepo = new OAuthConnectionRepo(db);
        var assetGroupRepo = new AssetGroupRepo(db);
        var dailyAssetGroupMetricsRepo = new DailyAssetGroupMetricsRepo(db);

        var uow = new UnitOfWork(
            db,
            adRepo,
            adSetRepo,
            assignmentRepo,
            associateProfileRepo,
            associateTeamRepo,
            campaignRepo,
            clientRepo,
            platformRepo,
            userRepo,
            refreshTokenRepo,
            clientTargetRepo,
            adDailyMetricsRepo,
            searchTermRepo,
            exchangeRateRepo,
            oauthConnectionRepo,
            assetGroupRepo,
            dailyAssetGroupMetricsRepo);

        var httpClient = new HttpClient(CreateDefaultRefreshTokenHandler());
        var oauthLogger = new Mock<ILogger<GoogleOAuthService>>().Object;

        var oauthService = new GoogleOAuthService(
            httpClient,
            uow,
            _dataProtectionProvider,
            _stateStore,
            _configuration,
            _timeProvider,
            oauthLogger);

        return (db, uow, oauthService);
    }

    private async Task<(Client Client, Platform Platform)> SeedConnectedClientAndPlatformAsync(
        AppDbContext db,
        string customerId = "1234567890",
        string userId = UserManager)
    {
        var client = new Client
        {
            CompanyName = "PMax Test Client",
            ManagerId = userId,
            UnitCurrency = Currency.USD,
            Website = "https://example.com",
            Email = "client@example.com",
            Phone = "+1234567890",
            Country = "US",
            BusinessModel = BusinessModel.Ecommerce,
            Status = ClientStatus.Active,
            CreatedAt = _timeProvider.GetUtcNow()
        };
        db.client.Add(client);
        await db.SaveChangesAsync();

        var protector = _dataProtectionProvider.CreateProtector("Dashboard.GoogleOAuth.Tokens.v1");
        var oauthConn = new OAuthConnection
        {
            UserId = userId,
            PlatformType = PlatformType.GoogleAds,
            RefreshTokenEncrypted = protector.Protect("1//valid_refresh_token"),
            AccessTokenEncrypted = protector.Protect("ya29.valid_access_token"),
            AccessTokenExpiresAt = _timeProvider.GetUtcNow().AddHours(1),
            Scopes = "https://www.googleapis.com/auth/adwords",
            CreatedAt = _timeProvider.GetUtcNow(),
            UpdatedAt = _timeProvider.GetUtcNow()
        };
        db.OAuthConnections.Add(oauthConn);
        await db.SaveChangesAsync();

        var platform = new Platform
        {
            ClientId = client.Id,
            PlatformType = PlatformType.GoogleAds,
            Status = PlatformStatus.Connected,
            ExternalAccountId = customerId,
            AccountName = "PMax Test Account",
            Currency = Currency.USD,
            TimeZone = "America/New_York",
            OAuthConnectionId = oauthConn.Id,
            CreatedAt = _timeProvider.GetUtcNow()
        };
        db.platform.Add(platform);
        await db.SaveChangesAsync();

        return (client, platform);
    }

    [Fact]
    public async Task SynchronizePlatform_SynchronizesBothSearchAndPMaxCampaigns_WithMutuallyExclusiveHierarchies()
    {
        // Arrange
        var (db, uow, oauthService) = CreateTestContext();
        var (client, platform) = await SeedConnectedClientAndPlatformAsync(db, "1112223333");

        var service = new PMaxTestableGoogleAdsService(
            oauthService,
            uow,
            _configuration,
            _timeProvider,
            new Mock<ILogger<GoogleAdsService>>().Object);

        // One Search Campaign and One Performance Max Campaign
        service.QueryCampaignsFunc = _ => new List<GoogleAdsCampaignRecordDto>
        {
            new()
            {
                ExternalId = "101",
                Name = "Search Campaign - Brand",
                Status = CampaignStatus.Active,
                Objective = CampaignObjective.Traffic,
                ChannelType = "SEARCH"
            },
            new()
            {
                ExternalId = "202",
                Name = "Performance Max - All Products",
                Status = CampaignStatus.Active,
                Objective = CampaignObjective.Sales,
                ChannelType = "PERFORMANCE_MAX"
            }
        };

        // AdGroup and Ad belonging to Search Campaign
        service.QueryAdGroupsFunc = _ => new List<GoogleAdsAdGroupRecordDto>
        {
            new()
            {
                ExternalId = "1001",
                CampaignExternalId = "101",
                Name = "Brand Exact Match",
                Status = AdSetStatus.Active,
                AudienceType = "Search"
            },
            // Malformed attempt: an AdGroup trying to link to PMax campaign should be ignored
            new()
            {
                ExternalId = "9999",
                CampaignExternalId = "202",
                Name = "Invalid AdGroup under PMax",
                Status = AdSetStatus.Active,
                AudienceType = "Search"
            }
        };

        service.QueryAdsFunc = _ => new List<GoogleAdsAdRecordDto>
        {
            new()
            {
                ExternalId = "5001",
                AdGroupExternalId = "1001",
                CampaignExternalId = "101",
                Name = "Brand Ad #1",
                Headline = "Best Store in Town",
                Status = AdStatus.Active
            }
        };

        // AssetGroup belonging to PMax Campaign
        service.QueryAssetGroupsFunc = _ => new List<GoogleAdsAssetGroupRecordDto>
        {
            new()
            {
                ExternalId = "2001",
                CampaignExternalId = "202",
                Name = "Summer Apparel Asset Group",
                Status = AdSetStatus.Active
            },
            // Malformed attempt: an AssetGroup trying to link to Search campaign should be ignored
            new()
            {
                ExternalId = "8888",
                CampaignExternalId = "101",
                Name = "Invalid AssetGroup under Search",
                Status = AdSetStatus.Active
            }
        };

        var today = DateOnly.FromDateTime(_timeProvider.GetUtcNow().UtcDateTime);
        var yesterday = today.AddDays(-1);

        service.QueryDailyMetricsFunc = (_, _, _) => Task.FromResult<IReadOnlyList<GoogleAdsDailyMetricRecordDto>>(new List<GoogleAdsDailyMetricRecordDto>
        {
            new()
            {
                AdExternalId = "5001",
                AdGroupExternalId = "1001",
                CampaignExternalId = "101",
                Date = yesterday,
                Impressions = 1000,
                Clicks = 50,
                CostMicros = 25_000_000, // $25.00
                Conversions = 2,
                ConversionsValue = 100.0
            }
        });

        service.QueryDailyAssetGroupMetricsFunc = (_, _, _) => Task.FromResult<IReadOnlyList<GoogleAdsDailyAssetGroupMetricRecordDto>>(new List<GoogleAdsDailyAssetGroupMetricRecordDto>
        {
            new()
            {
                AssetGroupExternalId = "2001",
                CampaignExternalId = "202",
                Date = yesterday,
                Impressions = 3000,
                Clicks = 120,
                CostMicros = 60_000_000, // $60.00
                Conversions = 5,
                ConversionsValue = 300.0
            }
        });

        // Act
        var result = await service.SynchronizePlatformAsync(client.Id, platform.Id);

        // Assert
        Assert.True(result.Success);
        Assert.Equal(2, result.CampaignsSynced);
        Assert.Equal(1, result.AdSetsSynced);
        Assert.Equal(1, result.AdsSynced);
        Assert.Equal(1, result.AssetGroupsSynced);
        Assert.Equal(2, result.DailyMetricsUpserted); // 1 search ad metric + 1 pmax asset group metric

        // Verify Search Campaign structure
        var searchCamp = await db.campaign
            .Include(c => c.AdSets)
                .ThenInclude(s => s.Ads)
                    .ThenInclude(a => a.DailyMetrics)
            .Include(c => c.AssetGroups)
            .FirstOrDefaultAsync(c => c.ExternalId == "101");

        Assert.NotNull(searchCamp);
        Assert.Equal("SEARCH", searchCamp.ChannelType);
        Assert.Single(searchCamp.AdSets);
        Assert.Equal("1001", searchCamp.AdSets.First().ExternalId);
        Assert.Single(searchCamp.AdSets.First().Ads);
        Assert.Equal("5001", searchCamp.AdSets.First().Ads.First().ExternalId);
        Assert.Single(searchCamp.AdSets.First().Ads.First().DailyMetrics);
        Assert.Equal(25.0, searchCamp.AdSets.First().Ads.First().DailyMetrics.First().Spend);
        // Mutual exclusivity: Search campaign must NOT have any AssetGroups
        Assert.Empty(searchCamp.AssetGroups);

        // Verify Performance Max Campaign structure
        var pmaxCamp = await db.campaign
            .Include(c => c.AdSets)
            .Include(c => c.AssetGroups)
                .ThenInclude(ag => ag.DailyMetrics)
            .FirstOrDefaultAsync(c => c.ExternalId == "202");

        Assert.NotNull(pmaxCamp);
        Assert.Equal("PERFORMANCE_MAX", pmaxCamp.ChannelType);
        Assert.Single(pmaxCamp.AssetGroups);
        var ag = pmaxCamp.AssetGroups.First();
        Assert.Equal("2001", ag.ExternalId);
        Assert.Equal("Summer Apparel Asset Group", ag.Name);
        Assert.Single(ag.DailyMetrics);
        var agMetric = ag.DailyMetrics.First();
        Assert.Equal(yesterday, agMetric.Date);
        Assert.Equal(3000, agMetric.Impressions);
        Assert.Equal(120, agMetric.Clicks);
        Assert.Equal(60.0, agMetric.Spend);
        Assert.Equal(5, agMetric.Conversions);
        Assert.Equal(300.0, agMetric.Revenue);
        // Mutual exclusivity: PMax campaign must NOT have any AdSets
        Assert.Empty(pmaxCamp.AdSets);
    }

    [Fact]
    public async Task RepeatedSynchronization_DoesNotDuplicateCampaignsAssetGroupsOrMetrics()
    {
        // Arrange
        var (db, uow, oauthService) = CreateTestContext();
        var (client, platform) = await SeedConnectedClientAndPlatformAsync(db, "2223334444");

        var service = new PMaxTestableGoogleAdsService(
            oauthService,
            uow,
            _configuration,
            _timeProvider,
            new Mock<ILogger<GoogleAdsService>>().Object);

        service.QueryCampaignsFunc = _ => new List<GoogleAdsCampaignRecordDto>
        {
            new() { ExternalId = "301", Name = "PMax Campaign", Status = CampaignStatus.Active, ChannelType = "PERFORMANCE_MAX" }
        };

        service.QueryAssetGroupsFunc = _ => new List<GoogleAdsAssetGroupRecordDto>
        {
            new() { ExternalId = "3001", CampaignExternalId = "301", Name = "Main Assets", Status = AdSetStatus.Active }
        };

        var date = DateOnly.FromDateTime(_timeProvider.GetUtcNow().UtcDateTime).AddDays(-2);

        service.QueryDailyAssetGroupMetricsFunc = (_, start, end) =>
        {
            var list = new List<GoogleAdsDailyAssetGroupMetricRecordDto>();
            if (date >= start && date <= end)
            {
                list.Add(new GoogleAdsDailyAssetGroupMetricRecordDto
                {
                    AssetGroupExternalId = "3001",
                    CampaignExternalId = "301",
                    Date = date,
                    Impressions = 500,
                    Clicks = 25,
                    CostMicros = 10_000_000, // $10.00
                    Conversions = 1,
                    ConversionsValue = 50.0
                });
            }
            return Task.FromResult<IReadOnlyList<GoogleAdsDailyAssetGroupMetricRecordDto>>(list);
        };

        // Act 1: Initial Sync
        var result1 = await service.SynchronizePlatformAsync(client.Id, platform.Id);
        Assert.True(result1.Success);

        // Act 2: Second sync (simulate platform refresh)
        // Advance time by 15 minutes to pass concurrency lock
        _timeProvider.Advance(TimeSpan.FromMinutes(15));
        var result2 = await service.SynchronizePlatformAsync(client.Id, platform.Id);
        Assert.True(result2.Success);

        // Assert: no duplicates in database
        var camps = await db.campaign.Where(c => c.PlatformId == platform.Id).ToListAsync();
        Assert.Single(camps);

        var assetGroups = await db.AssetGroups.Where(a => a.CampaignId == camps[0].Id).ToListAsync();
        Assert.Single(assetGroups);

        var metrics = await db.DailyAssetGroupMetrics.Where(m => m.AssetGroupId == assetGroups[0].Id).ToListAsync();
        Assert.Single(metrics);
        Assert.Equal(10.0, metrics[0].Spend);
    }

    [Fact]
    public async Task Backfill_UpdatesExistingDailyAssetGroupMetricsCorrectly()
    {
        // Arrange
        var (db, uow, oauthService) = CreateTestContext();
        var (client, platform) = await SeedConnectedClientAndPlatformAsync(db, "3334445555");

        var service = new PMaxTestableGoogleAdsService(
            oauthService,
            uow,
            _configuration,
            _timeProvider,
            new Mock<ILogger<GoogleAdsService>>().Object);

        service.QueryCampaignsFunc = _ => new List<GoogleAdsCampaignRecordDto>
        {
            new() { ExternalId = "401", Name = "PMax Campaign", Status = CampaignStatus.Active, ChannelType = "PERFORMANCE_MAX" }
        };

        service.QueryAssetGroupsFunc = _ => new List<GoogleAdsAssetGroupRecordDto>
        {
            new() { ExternalId = "4001", CampaignExternalId = "401", Name = "Asset Group 4001", Status = AdSetStatus.Active }
        };

        var date = DateOnly.FromDateTime(_timeProvider.GetUtcNow().UtcDateTime).AddDays(-5);

        // First pass: partial conversions (e.g. 1 conversion, $30 revenue)
        service.QueryDailyAssetGroupMetricsFunc = (_, _, _) => Task.FromResult<IReadOnlyList<GoogleAdsDailyAssetGroupMetricRecordDto>>(new List<GoogleAdsDailyAssetGroupMetricRecordDto>
        {
            new()
            {
                AssetGroupExternalId = "4001",
                Date = date,
                Impressions = 1000,
                Clicks = 50,
                CostMicros = 20_000_000,
                Conversions = 1,
                ConversionsValue = 30.0
            }
        });

        await service.SynchronizePlatformAsync(client.Id, platform.Id);

        // Advance 8 days so backfill is due
        _timeProvider.Advance(TimeSpan.FromDays(8));

        // Backfill: updated conversion tracking (Google Ads adjusted conversion attribution to 3 conversions, $120 revenue)
        service.QueryDailyAssetGroupMetricsFunc = (_, _, _) => Task.FromResult<IReadOnlyList<GoogleAdsDailyAssetGroupMetricRecordDto>>(new List<GoogleAdsDailyAssetGroupMetricRecordDto>
        {
            new()
            {
                AssetGroupExternalId = "4001",
                Date = date,
                Impressions = 1050,
                Clicks = 52,
                CostMicros = 20_500_000,
                Conversions = 3,
                ConversionsValue = 120.0
            }
        });

        // Act
        var result = await service.SynchronizePlatformAsync(client.Id, platform.Id);

        // Assert
        Assert.True(result.Success);
        Assert.True(result.BackfillExecuted);

        var ag = await db.AssetGroups.Include(a => a.DailyMetrics).FirstOrDefaultAsync(a => a.ExternalId == "4001");
        Assert.NotNull(ag);
        Assert.Single(ag.DailyMetrics); // Must NOT duplicate record
        var updatedMetric = ag.DailyMetrics.First();
        Assert.Equal(3, updatedMetric.Conversions);
        Assert.Equal(120.0, updatedMetric.Revenue);
        Assert.Equal(20.5, updatedMetric.Spend);
    }

    [Fact]
    public async Task Reporting_CalculatesBothCampaignTypes_WithoutDoubleCounting()
    {
        // Arrange
        var (db, uow, _) = CreateTestContext();
        var (client, platform) = await SeedConnectedClientAndPlatformAsync(db, "4445556666");

        var today = DateOnly.FromDateTime(_timeProvider.GetUtcNow().UtcDateTime);
        var startDate = today.AddDays(-10);
        var endDate = today;

        // 1. Create Search Campaign with AdSet -> Ad -> DailyMetrics
        var searchCamp = new Campaign
        {
            PlatformId = platform.Id,
            ExternalId = "S1",
            Name = "Search Campaign",
            ChannelType = "SEARCH",
            Objective = CampaignObjective.Traffic,
            Currency = Currency.USD,
            Status = CampaignStatus.Active,
            CreatedAt = _timeProvider.GetUtcNow()
        };
        db.campaign.Add(searchCamp);
        await db.SaveChangesAsync();

        var adSet = new AdSet
        {
            CampaignId = searchCamp.Id,
            ExternalId = "AS1",
            Name = "AdSet 1",
            AudienceType = "Search",
            AgeRange = "All",
            Gender = AdSetGender.All,
            Status = AdSetStatus.Active
        };
        db.adset.Add(adSet);
        await db.SaveChangesAsync();

        var ad = new Ad
        {
            AdSetId = adSet.Id,
            ExternalId = "A1",
            Name = "Ad 1",
            Headline = "Headline 1",
            Status = AdStatus.Active
        };
        db.ad.Add(ad);
        await db.SaveChangesAsync();

        var adMetric = new AdDailyMetrics
        {
            AdId = ad.Id,
            Date = today.AddDays(-2),
            Impressions = 1000,
            Clicks = 100,
            Spend = 50.0,
            Conversions = 5,
            Revenue = 200.0
        };
        db.AdDailyMetrics.Add(adMetric);

        // 2. Create PMax Campaign with AssetGroup -> DailyAssetGroupMetrics
        var pmaxCamp = new Campaign
        {
            PlatformId = platform.Id,
            ExternalId = "P1",
            Name = "PMax Campaign",
            ChannelType = "PERFORMANCE_MAX",
            Objective = CampaignObjective.Sales,
            Currency = Currency.USD,
            Status = CampaignStatus.Active,
            CreatedAt = _timeProvider.GetUtcNow()
        };
        db.campaign.Add(pmaxCamp);
        await db.SaveChangesAsync();

        var assetGroup = new AssetGroup
        {
            CampaignId = pmaxCamp.Id,
            ExternalId = "AG1",
            Name = "AssetGroup 1",
            Status = AdSetStatus.Active
        };
        db.AssetGroups.Add(assetGroup);
        await db.SaveChangesAsync();

        var agMetric = new DailyAssetGroupMetrics
        {
            AssetGroupId = assetGroup.Id,
            Date = today.AddDays(-2),
            Impressions = 4000,
            Clicks = 200,
            Spend = 100.0,
            Conversions = 10,
            Revenue = 500.0
        };
        db.DailyAssetGroupMetrics.Add(agMetric);
        await db.SaveChangesAsync();

        // Mock ExchangeRateService (1:1 USD to USD)
        var mockExchangeService = new Mock<IExchangeRateService>();
        mockExchangeService.Setup(x => x.GetCrossRateLookupAsync(It.IsAny<Currency>(), It.IsAny<Currency>(), It.IsAny<DateOnly>(), It.IsAny<DateOnly>()))
            .ReturnsAsync(new Dictionary<DateOnly, double>());

        var campaignService = new CampaignService(uow, mockExchangeService.Object);
        var adSetService = new AdSetService(uow);
        var clientService = new ClientService(uow, mockExchangeService.Object);

        // Act 1: Overview report
        var overview = await campaignService.GetForOverviewAsync(client.Id, startDate, endDate);
        Assert.NotNull(overview);
        // Total Spend = 50 (Search) + 100 (PMax) = 150
        Assert.Equal(150.0, overview.Spend);
        // Total Revenue = 200 (Search) + 500 (PMax) = 700
        Assert.Equal(700.0, overview.Revenue);
        // Total Impressions = 1000 + 4000 = 5000
        Assert.Equal(5000, overview.Impressions);
        // Total Clicks = 100 + 200 = 300
        Assert.Equal(300, overview.Clicks);
        // Total Conversions = 5 + 10 = 15
        Assert.Equal(15, overview.Conversions);
        // Verify Campaigns table rows
        Assert.NotNull(overview.CampRow);
        Assert.Equal(2, overview.CampRow.Count());

        // Act 2: Platform page report
        var platformPage = await campaignService.GetCampaignsByPlatformAsync(client.Id, platform.Id, startDate, endDate);
        Assert.NotNull(platformPage);
        Assert.Equal(150.0, platformPage.Spend);
        Assert.Equal(700.0, platformPage.Revenue);
        Assert.Equal(5000, platformPage.Impressions);
        Assert.Equal(300, platformPage.Clicks);
        Assert.Equal(15, platformPage.Conversions);

        // Act 3: Campaign Detail Page for Performance Max
        var pmaxDetail = await adSetService.GetByCampaignIdAsync(pmaxCamp.Id, startDate, endDate);
        Assert.NotNull(pmaxDetail);
        Assert.True(pmaxDetail.IsPerformanceMax);
        Assert.Equal("PERFORMANCE_MAX", pmaxDetail.ChannelType);
        Assert.Equal(100.0, pmaxDetail.Spend);
        Assert.Equal(500.0, pmaxDetail.Revenue);
        Assert.Equal(4000, pmaxDetail.Impressions);
        Assert.Equal(200, pmaxDetail.Clicks);
        Assert.Equal(10, pmaxDetail.Conversions);
        Assert.NotNull(pmaxDetail.AdsetRows);
        Assert.Single(pmaxDetail.AdsetRows);
        Assert.Equal("AssetGroup 1", pmaxDetail.AdsetRows.First().Name);

        // Act 4: Campaign Detail Page for Search
        var searchDetail = await adSetService.GetByCampaignIdAsync(searchCamp.Id, startDate, endDate);
        Assert.NotNull(searchDetail);
        Assert.False(searchDetail.IsPerformanceMax);
        Assert.Equal("SEARCH", searchDetail.ChannelType);
        Assert.Equal(50.0, searchDetail.Spend);
        Assert.Equal(200.0, searchDetail.Revenue);
        Assert.Equal(1000, searchDetail.Impressions);
        Assert.Equal(100, searchDetail.Clicks);
        Assert.Equal(5, searchDetail.Conversions);
        Assert.NotNull(searchDetail.AdsetRows);
        Assert.Single(searchDetail.AdsetRows);
        Assert.Equal("AdSet 1", searchDetail.AdsetRows.First().Name);

        // Act 5: Client-level metrics in ClientService
        var clientCard = await clientService.GetClientByIdAsync(client.Id);
        Assert.NotNull(clientCard);
        // ClientSpend = 150, ClientRevenue = 700
        Assert.Equal(150.0, clientCard.Spend);
        Assert.Equal(700.0, clientCard.Revenue);
        Assert.Equal(5000, clientCard.Impressions);
        Assert.Equal(300, clientCard.Clicks);
    }

    [Fact]
    public async Task ExistingSearchReporting_ResultsRemainUnchanged_WhenNoPMaxExists()
    {
        // Arrange
        var (db, uow, _) = CreateTestContext();
        var (client, platform) = await SeedConnectedClientAndPlatformAsync(db, "5556667777");

        var today = DateOnly.FromDateTime(_timeProvider.GetUtcNow().UtcDateTime);
        var startDate = today.AddDays(-10);
        var endDate = today;

        var searchCamp = new Campaign
        {
            PlatformId = platform.Id,
            ExternalId = "SearchOnly1",
            Name = "Search Campaign Only",
            ChannelType = "SEARCH",
            Objective = CampaignObjective.Traffic,
            Currency = Currency.USD,
            Status = CampaignStatus.Active,
            CreatedAt = _timeProvider.GetUtcNow()
        };
        db.campaign.Add(searchCamp);
        await db.SaveChangesAsync();

        var adSet = new AdSet
        {
            CampaignId = searchCamp.Id,
            ExternalId = "AS_Only",
            Name = "AdSet Only",
            AudienceType = "Search",
            AgeRange = "All",
            Gender = AdSetGender.All,
            Status = AdSetStatus.Active
        };
        db.adset.Add(adSet);
        await db.SaveChangesAsync();

        var ad = new Ad
        {
            AdSetId = adSet.Id,
            ExternalId = "Ad_Only",
            Name = "Ad Only",
            Headline = "Search Ad Headline",
            Status = AdStatus.Active
        };
        db.ad.Add(ad);
        await db.SaveChangesAsync();

        db.AdDailyMetrics.Add(new AdDailyMetrics
        {
            AdId = ad.Id,
            Date = today.AddDays(-1),
            Impressions = 500,
            Clicks = 40,
            Spend = 20.0,
            Conversions = 2,
            Revenue = 80.0
        });
        await db.SaveChangesAsync();

        var mockExchangeService = new Mock<IExchangeRateService>();
        mockExchangeService.Setup(x => x.GetCrossRateLookupAsync(It.IsAny<Currency>(), It.IsAny<Currency>(), It.IsAny<DateOnly>(), It.IsAny<DateOnly>()))
            .ReturnsAsync(new Dictionary<DateOnly, double>());

        var campaignService = new CampaignService(uow, mockExchangeService.Object);

        // Act
        var overview = await campaignService.GetForOverviewAsync(client.Id, startDate, endDate);

        // Assert: standard search calculations are fully preserved
        Assert.NotNull(overview);
        Assert.Equal(20.0, overview.Spend);
        Assert.Equal(80.0, overview.Revenue);
        Assert.Equal(500, overview.Impressions);
        Assert.Equal(40, overview.Clicks);
        Assert.Equal(2, overview.Conversions);
        Assert.Equal(4.0, overview.ROAS); // 80 / 20 = 4.0
        Assert.Equal(8.0, overview.CTR);  // (40 / 500) * 100 = 8.0%
        Assert.Equal(0.5, overview.CPC);  // 20 / 40 = 0.5
        Assert.Equal(10.0, overview.CPA); // 20 / 2 = 10.0
    }

    [Fact]
    public async Task AssetGroupDetailPage_ReturnsAccurateMetricsAndZeroAds_ForPerformanceMaxAssetGroup()
    {
        // Arrange
        var (db, uow, _) = CreateTestContext();
        var (client, platform) = await SeedConnectedClientAndPlatformAsync(db, "9988776655");

        var today = DateOnly.FromDateTime(_timeProvider.GetUtcNow().UtcDateTime);
        var startDate = today.AddDays(-7);
        var endDate = today;

        var pmaxCamp = new Campaign
        {
            PlatformId = platform.Id,
            ExternalId = "PMaxCampDetail1",
            Name = "PMax Detail Test Campaign",
            ChannelType = "PERFORMANCE_MAX",
            Currency = Currency.USD,
            Status = CampaignStatus.Active,
            CreatedAt = _timeProvider.GetUtcNow()
        };
        db.campaign.Add(pmaxCamp);
        await db.SaveChangesAsync();

        var assetGroup = new AssetGroup
        {
            CampaignId = pmaxCamp.Id,
            ExternalId = "AG_Detail_1",
            Name = "Summer Sale Assets",
            Status = AdSetStatus.Active,
            StartDate = _timeProvider.GetUtcNow().AddDays(-10)
        };
        db.AssetGroups.Add(assetGroup);
        await db.SaveChangesAsync();

        // Add daily metrics for 2 days
        db.DailyAssetGroupMetrics.Add(new DailyAssetGroupMetrics
        {
            AssetGroupId = assetGroup.Id,
            Date = today.AddDays(-2),
            Impressions = 2000,
            Clicks = 100,
            Spend = 50.0,
            Conversions = 5,
            Revenue = 250.0
        });

        db.DailyAssetGroupMetrics.Add(new DailyAssetGroupMetrics
        {
            AssetGroupId = assetGroup.Id,
            Date = today.AddDays(-1),
            Impressions = 3000,
            Clicks = 150,
            Spend = 75.0,
            Conversions = 10,
            Revenue = 500.0
        });
        await db.SaveChangesAsync();

        var adService = new AdService(uow);

        // Act 1: Call dedicated GetByAssetGroupIdAsync
        var agDetail = await adService.GetByAssetGroupIdAsync(assetGroup.Id, startDate, endDate);

        // Assert 1: Data, analytics and numbers are populated accurately
        Assert.NotNull(agDetail);
        Assert.True(agDetail.IsPerformanceMax);
        Assert.True(agDetail.IsAssetGroup);
        Assert.Equal("Summer Sale Assets", agDetail.AdSetName);
        Assert.Equal("PERFORMANCE_MAX", agDetail.ChannelType);
        Assert.Equal(125.0, agDetail.Spend); // 50 + 75 = 125
        Assert.Equal(750.0, agDetail.Revenue); // 250 + 500 = 750
        Assert.Equal(5000, agDetail.Impressions); // 2000 + 3000 = 5000
        Assert.Equal(250, agDetail.Clicks); // 100 + 150 = 250
        Assert.Equal(15, agDetail.Conversions); // 5 + 10 = 15
        Assert.Equal(6.0, agDetail.ROAS); // 750 / 125 = 6.0
        Assert.Equal(5.0, agDetail.CTR); // (250 / 5000) * 100 = 5.0%

        // Assert 2: No creative ads and no search terms
        Assert.Empty(agDetail.AdRow);
        Assert.Empty(agDetail.SearchTermRows);

        // Assert 3: Points are populated for chart and daily analytics table
        Assert.NotNull(agDetail.Points);
        var pointsList = agDetail.Points.ToList();
        Assert.Equal(8, pointsList.Count); // 7-day range + 1 = 8 days
        var dayMinus1 = pointsList.First(p => p.Date == today.AddDays(-1));
        Assert.Equal(75.0, dayMinus1.Spend);
        Assert.Equal(500.0, dayMinus1.Revenue);
        Assert.Equal(3000, dayMinus1.Impressions);

        // Act 2: Test fallback resolution via GetByAdSetIdAsync
        var fallbackDetail = await adService.GetByAdSetIdAsync(assetGroup.Id, startDate, endDate);
        Assert.NotNull(fallbackDetail);
        Assert.True(fallbackDetail.IsPerformanceMax);
        Assert.Equal(125.0, fallbackDetail.Spend);
    }
}
