using Dashboard.Application.DTOs;
using Dashboard.Application.Interfaces;
using Dashboard.Application.Interfaces.Services;
using Dashboard.Domain.Entities;


namespace Dashboard.Application.Services;
public class CampaignService : ICampaignService
{
    private readonly IUnitOfWork _unitOfWork;

    public CampaignService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    // done 
    public async Task<PlatformPageDTO?> GetCampaignsByPlatformAsync(int clientId, int platformid, DateOnly startDate, DateOnly endDate)
    {
        var client = await _unitOfWork.Client.GetById(clientId);

        if (client is null)
            return null;

        var campaigns = await _unitOfWork.Campaign.GetByPlatformAsync(clientId, platformid, startDate, endDate);

        if (campaigns is null)
            return null;


        return MapToPlatformPageDTO(campaigns);
    }

    // under process
    public async Task<ClientPageDTO?> GetCampaignsByClientIdAsync(
    int clientId,
    DateOnly startDate,
    DateOnly endDate)
    {
        var client = await _unitOfWork.Client.GetById(clientId);

        if (client is null)
            return null;

        var campaigns = await _unitOfWork.Campaign.GetByClientIdAsync(clientId, startDate, endDate);

        return MapToClientPageDTO();
        //return MapToDTO(client, campaigns, startDate, endDate);
    }

    // methods
    private PlatformPageDTO? MapToPlatformPageDTO(IEnumerable<Campaign> campaigns)
    {

        var campaignList = campaigns as IList<Campaign> ?? campaigns.ToList();

        var platformCurrency = campaignList.FirstOrDefault(c => c.Platform != null)!.Platform.Currency;

        int totalImpressions = 0;
        int totalClicks = 0;
        int totalConversions = 0;
        double totalSpend = 0;
        double totalRevenue = 0;

        var campRows = new List<CampsTable>();

        foreach (var campaign in campaignList)
        {
            var campMetrics = (campaign.AdSets)
                .SelectMany(adSet => adSet.Ads)
                .SelectMany(ad => ad.DailyMetrics);

            double campSpend = 0;
            double campRevenue = 0;

            foreach (var metric in campMetrics)
            {
                campSpend += metric.Spend;
                campRevenue += metric.Revenue;

                totalImpressions += metric.Impressions;
                totalClicks += metric.Clicks;
                totalConversions += metric.Conversions;
                totalSpend += metric.Spend;
                totalRevenue += metric.Revenue;
            }

            campRows.Add(new CampsTable
            {
                CampaignId = campaign.Id,
                CampaignName = campaign.Name,
                PlatformId = campaign.PlatformId != 0 ? campaign.PlatformId : (campaign.Platform?.Id ?? 0),
                Platform = campaign.Platform != null ? campaign.Platform.PlatformType : default,
                Status = campaign.Status,
                Objective = campaign.Objective,
                StartDate = campaign.StartDate,
                Spend = campSpend,
                Revenue = campRevenue,
                ROAS = Divide(campRevenue, campSpend)
            });
        }

        return new PlatformPageDTO
        {
            Currency = platformCurrency,
            Impressions = totalImpressions,
            Clicks = totalClicks,
            Conversions = totalConversions,
            Spend = totalSpend,
            Revenue = totalRevenue,

            ROAS = Divide(totalRevenue, totalSpend),
            CTR = Divide(totalClicks, totalImpressions) * 100,
            CPC = Divide(totalSpend, totalClicks),
            CPM = Divide(totalSpend, totalImpressions) * 1000,
            CPA = Divide(totalSpend, totalConversions),
            ConversionRate = Divide(totalConversions, totalClicks) * 100,
            AOV = totalConversions > 0 ? Divide(totalRevenue, totalConversions) : null,

            CampRow = campRows
        };

        static double Divide(double numerator, double denominator) =>
            denominator == 0 ? 0 : numerator / denominator;
    }
    private static ClientPageDTO? MapToClientPageDTO()
    {
        return new ClientPageDTO();
    }






    private static ClientPageDTO MapToDTO(
Client client,
IEnumerable<Campaign> campaigns,
DateOnly startDate,
DateOnly endDate)
    {
        var campaignList = campaigns.ToList();

        // Monetary totals require a common currency.
        var currencies = campaignList
          .Select(campaign => campaign.Platform.Currency)
          .Distinct()
          .ToList();

        if (currencies.Count > 1)
        {
            throw new InvalidOperationException(
                "Convert campaign metrics to one reporting currency " +
                "before calculating client totals.");
        }

        // These records were already filtered by date in the repository.
        var metrics = campaignList
          .SelectMany(GetCampaignMetrics)
          .ToList();

        var total = SumMetrics(metrics);

        var byDate = metrics.ToLookup(metric => metric.Date);

        // Group by platform ID so separate accounts stay separate.
        var campaignsByPlatform = campaignList
          .ToLookup(campaign => campaign.PlatformId);

        // Chart
        var points = new List<ChartPoint>();
        int dayCount = endDate.DayNumber - startDate.DayNumber + 1;

        for (int i = 0; i < dayCount; i++)
        {
            var date = startDate.AddDays(i);
            var daily = SumMetrics(byDate[date]);

            points.Add(new ChartPoint
            {
                Date = date,
                Spend = daily.Spend,
                Revenue = daily.Revenue,
                Conversions = daily.Conversions,
                ROAS = Divide(daily.Revenue, daily.Spend),
                CPA = Divide(daily.Spend, daily.Conversions),
                CTR = Divide(daily.Clicks, daily.Impressions) * 100
            });
        }

        // Platforms comparison table
        var platformRows = new List<PlatformsTable>();

        foreach (var platform in client.Platforms)
        {
            var platformMetrics = campaignsByPlatform[platform.Id]
                .SelectMany(GetCampaignMetrics);

            var platformTotal = SumMetrics(platformMetrics);

            platformRows.Add(new PlatformsTable
            {
                PlatformId = platform.Id,
                PlatformName = platform.PlatformType,
                Currency = platform.Currency,
                Spend = platformTotal.Spend,
                Revenue = platformTotal.Revenue,
                Impressions = platformTotal.Impressions,
                Clicks = platformTotal.Clicks,
                Conversions = platformTotal.Conversions,
                ROAS = Divide(platformTotal.Revenue, platformTotal.Spend),
                CTR = Divide(platformTotal.Clicks, platformTotal.Impressions) * 100,
                CPA = Divide(platformTotal.Spend, platformTotal.Conversions)
            });
        }

        // Campaigns table
        var campaignRows = new List<CampsTable>();

        foreach (var campaign in campaignList)
        {
            var campaignTotal = SumMetrics(GetCampaignMetrics(campaign));

            campaignRows.Add(new CampsTable
            {
                CampaignId = campaign.Id,
                CampaignName = campaign.Name,
                PlatformId = campaign.PlatformId,
                Platform = campaign.Platform.PlatformType,
                Currency = campaign.Platform.Currency,
                Status = campaign.Status,
                Objective = campaign.Objective,
                StartDate = campaign.StartDate,
                Spend = campaignTotal.Spend,
                Revenue = campaignTotal.Revenue,
                ROAS = Divide(campaignTotal.Revenue, campaignTotal.Spend)
            });
        }

        return new ClientPageDTO
        {
            Impressions = total.Impressions,
            Clicks = total.Clicks,
            Conversions = total.Conversions,
            Spend = total.Spend,
            Revenue = total.Revenue,

            //Currency = currencies.Count == 1 ? currencies[0] : null,

            ROAS = Divide(total.Revenue, total.Spend),
            CTR = Divide(total.Clicks, total.Impressions) * 100,
            CPC = Divide(total.Spend, total.Clicks),
            CPM = Divide(total.Spend, total.Impressions) * 1000,
            CPA = Divide(total.Spend, total.Conversions),
            ConversionRate = Divide(total.Conversions, total.Clicks) * 100,

            // Requires a verified count of completed orders.
            AOV = null,

            Client = new ClientInfoDTO
            {
                Id = client.Id,
                CompanyName = client.CompanyName,
                Logo = client.Logo,
                Website = client.Website,
                Email = client.Email,
                Phone = client.Phone,
                Country = client.Country,
                Status = client.Status,
                BusinessModel = client.BusinessModel,
                CreatedAt = client.CreatedAt,
                Notes = client.Notes
            },

            Target = client.Target is null ? null : new ClientTargetDTO
            {
                Id = client.Target.Id,
                TargetROAS = client.Target.TargetROAS,
                TargetCPA = client.Target.TargetCPA,
                MonthlyBudget = client.Target.MonthlyBudget,
                TargetRevenue = client.Target.TargetRevenue,
                TargetConversions = client.Target.TargetConversions,
                TargetCTR = client.Target.TargetCTR,
                TargetCPC = client.Target.TargetCPC
            },

            Points = points,
            PlatformRow = platformRows,
            CampRowS = campaignRows
        };
    }

    // Collect every ad's daily metrics within one campaign.
    private static IEnumerable<AdDailyMetrics> GetCampaignMetrics(
    Campaign campaign)
    {
        return campaign.AdSets
          .SelectMany(adSet => adSet.Ads)
          .SelectMany(ad => ad.DailyMetrics);
    }
    public static (double Spend, double Revenue, int Impressions, int Clicks, int Conversions) SumMetrics(IEnumerable<AdDailyMetrics> metrics)
    {
        var total = (
          Spend: 0.0,
          Revenue: 0.0,
          Impressions: 0,
          Clicks: 0,
          Conversions: 0
        );

        foreach (var metric in metrics)
        {
            total.Spend += metric.Spend;
            total.Revenue += metric.Revenue;
            total.Impressions += metric.Impressions;
            total.Clicks += metric.Clicks;
            total.Conversions += metric.Conversions;
        }

        return total;
    }

    public static double Divide(double numerator, double denominator)
    {
        return denominator == 0 ? 0 : numerator / denominator;
    }
}

