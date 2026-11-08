using Dashboard.Application.Interfaces;
using Dashboard.Application.Interfaces.Repositories;
using Dashboard.Infrastructure.Repositories;

namespace Dashboard.Infrastructure;
public class UnitOfWork : IUnitOfWork
{

    private readonly AppDbContext _context;
    public IAdRepo Ad { get; private set; }
    public IAdSetRepo AdSet { get; private set; }
    public IAssignmentRepo Assignment { get; private set; }
    public IAssociateProfileRepo AssociateProfile { get; private set; }
    public IAssociateTeamRepo AssociateTeam { get; private set; }
    public ICampaignRepo Campaign { get; private set; }
    public IClientRepo Client { get; private set; }
    public IPlatformRepo Platform { get; private set; }
    public IUserRepo User { get; private set; }
    public IRefreshTokenRepo RefreshToken { get; private set; }
    public IClientTargetRepo ClientTarget { get; private set; }
    public IAdDailyMetricsRepo AdDailyMetrics { get; private set; }
    public ISearchTermRepo SearchTerm { get; private set; }
    public IExchangeRateRepo ExchangeRate { get; private set; }
    public IOAuthConnectionRepo OAuthConnection { get; private set; }
    public IAssetGroupRepo AssetGroup { get; private set; }
    public IDailyAssetGroupMetricsRepo DailyAssetGroupMetrics { get; private set; }

    public UnitOfWork(
        AppDbContext context,
        IAdRepo ad,
        IAdSetRepo adSet,
        IAssignmentRepo assignment,
        IAssociateProfileRepo associateProfile,
        IAssociateTeamRepo associateTeam,
        ICampaignRepo campaign,
        IClientRepo client,
        IPlatformRepo platform,
        IUserRepo user,
        IRefreshTokenRepo refreshToken,
        IClientTargetRepo clientTarget,
        IAdDailyMetricsRepo adDailyMetrics,
        ISearchTermRepo searchTerm,
        IExchangeRateRepo exchangeRate,
        IOAuthConnectionRepo oauthConnection)
        : this(
            context,
            ad,
            adSet,
            assignment,
            associateProfile,
            associateTeam,
            campaign,
            client,
            platform,
            user,
            refreshToken,
            clientTarget,
            adDailyMetrics,
            searchTerm,
            exchangeRate,
            oauthConnection,
            new AssetGroupRepo(context),
            new DailyAssetGroupMetricsRepo(context))
    {
    }

    public UnitOfWork(
        AppDbContext context,
        IAdRepo ad,
        IAdSetRepo adSet,
        IAssignmentRepo assignment,
        IAssociateProfileRepo associateProfile,
        IAssociateTeamRepo associateTeam,
        ICampaignRepo campaign,
        IClientRepo client,
        IPlatformRepo platform,
        IUserRepo user,
        IRefreshTokenRepo refreshToken,
        IClientTargetRepo clientTarget,
        IAdDailyMetricsRepo adDailyMetrics,
        ISearchTermRepo searchTerm,
        IExchangeRateRepo exchangeRate,
        IOAuthConnectionRepo oauthConnection,
        IAssetGroupRepo assetGroup,
        IDailyAssetGroupMetricsRepo dailyAssetGroupMetrics)
    {
        _context = context;
        Ad = ad;
        AdSet = adSet;
        Assignment = assignment;
        AssociateProfile = associateProfile;
        AssociateTeam = associateTeam;
        Campaign = campaign;
        Client = client;
        Platform = platform;
        User = user;
        RefreshToken = refreshToken;
        ClientTarget = clientTarget;
        AdDailyMetrics = adDailyMetrics;
        SearchTerm = searchTerm;
        ExchangeRate = exchangeRate;
        OAuthConnection = oauthConnection;
        AssetGroup = assetGroup;
        DailyAssetGroupMetrics = dailyAssetGroupMetrics;
    }
    public async Task Complete()
    {
        await _context.SaveChangesAsync();
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}
