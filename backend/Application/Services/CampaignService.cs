using Dashboard.Application.DTOs;
using Dashboard.Application.Interfaces;
using Dashboard.Application.Interfaces.Services;
using Dashboard.Domain.Entities;
using Dashboard.Domain.Enums;

namespace Dashboard.Application.Services;

public class CampaignService : ICampaignService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IExchangeRateService _exchangeRateService;

    public CampaignService(IUnitOfWork unitOfWork, IExchangeRateService exchangeRateService)
    {
        _unitOfWork = unitOfWork;
        _exchangeRateService = exchangeRateService;
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

    public async Task<ClientPageDTO?> GetForOverviewAsync(
        int clientId,
        DateOnly startDate,
        DateOnly endDate)
    {
        var client = await _unitOfWork.Client.GetById(clientId);

        if (client is null)
            return null;

        var campaigns = await _unitOfWork.Campaign.GetByClientIdAsync(clientId, startDate, endDate);

        return await MapToOverviewDTO(client, campaigns, startDate, endDate);
    }

    // methods
    private async Task<ClientPageDTO?> MapToOverviewDTO(
        Client client,
        IEnumerable<Campaign> campaigns,
        DateOnly startDate,
        DateOnly endDate)
    {
        var campaignList = campaigns as IList<Campaign> ?? campaigns.ToList();

        // 1 & 2: Client reporting currency (default USD)
        Currency reportingCurrency = client.UnitCurrency;

        // collect currencies of this client platforms
        var sourceCurrencies = campaignList
            .Where(c => c.Platform != null)
            .Select(c => c.Platform.Currency)
            .Distinct()
            .ToList();

        // Pre-load cross-rate lookups for all platform currencies -> reportingCurrency
        var crossRateLookups = new Dictionary<Currency, Dictionary<DateOnly, double>>();

        foreach (var srcCurrency in sourceCurrencies)
        {
            crossRateLookups[srcCurrency] = await _exchangeRateService
                .GetCrossRateLookupAsync(srcCurrency, reportingCurrency, startDate, endDate);
        }

        // ── Aggregations ──
        int totalImpressions = 0;
        int totalClicks = 0;
        int totalConversions = 0;
        double totalSpend = 0;
        double totalRevenue = 0;

        var dailyBuckets = new Dictionary<DateOnly, (double Spend, double Revenue, int Impressions, int Clicks, int Conversions)>();
        var platformBuckets = new Dictionary<int, (double Spend, double Revenue, int Impressions, int Clicks, int Conversions, Platform Platform)>();
        var campRows = new List<CampsTable>();

        foreach (var campaign in campaignList)
        {
            Currency platformCurrency = campaign.Platform?.Currency ?? reportingCurrency;
            Dictionary<DateOnly, double>? rates = crossRateLookups.GetValueOrDefault(platformCurrency);

            double campSpend = 0;
            double campRevenue = 0;

            var metrics = campaign.AdSets
                .SelectMany(adSet => adSet.Ads)
                .SelectMany(ad => ad.DailyMetrics);

            foreach (var metric in metrics)
            {
                // Resolve cross rate with nearest fallback (rule 3)
                double crossRate = 1.0;
                if (rates != null && platformCurrency != reportingCurrency)
                {
                    if (!rates.TryGetValue(metric.Date, out crossRate) || crossRate <= 0)
                    {
                        crossRate = rates.Values.LastOrDefault(1.0); // set to latest conv. rate, or 1.0 if no rates available.
                    }
                }

                double convertedSpend = metric.Spend * crossRate;
                double convertedRevenue = metric.Revenue * crossRate;

                campSpend += convertedSpend;
                campRevenue += convertedRevenue;

                totalImpressions += metric.Impressions;
                totalClicks += metric.Clicks;
                totalConversions += metric.Conversions;
                totalSpend += convertedSpend;
                totalRevenue += convertedRevenue;

                // accumulate values of ads within one date fo chart points
                var d = dailyBuckets.GetValueOrDefault(metric.Date);
                dailyBuckets[metric.Date] = (
                    d.Spend + convertedSpend,
                    d.Revenue + convertedRevenue,
                    d.Impressions + metric.Impressions,
                    d.Clicks + metric.Clicks,
                    d.Conversions + metric.Conversions
                );

                // Platform bucket for comparison table
                int pid = campaign.PlatformId != 0 ? campaign.PlatformId : (campaign.Platform?.Id ?? 0);
                if (pid != 0)
                {
                    var p = platformBuckets.GetValueOrDefault(pid);
                    platformBuckets[pid] = (
                        p.Spend + convertedSpend,
                        p.Revenue + convertedRevenue,
                        p.Impressions + metric.Impressions,
                        p.Clicks + metric.Clicks,
                        p.Conversions + metric.Conversions,
                        p.Platform ?? campaign.Platform!
                    );
                }
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

        // ── Chart Points (every day in range) ──
        var points = new List<ChartPoint>();
        int dayCount = endDate.DayNumber - startDate.DayNumber + 1;

        for (int i = 0; i < dayCount; i++)
        {
            var date = startDate.AddDays(i);
            dailyBuckets.TryGetValue(date, out var daily);

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

        // ── Platform Comparison Table ──
        var platformRows = new List<PlatformsTable>();
        if (client.Platforms != null && client.Platforms.Count > 0)
        {
            foreach (var platform in client.Platforms)
            {
                if (platformBuckets.TryGetValue(platform.Id, out var bucket))
                {
                    platformRows.Add(new PlatformsTable
                    {
                        PlatformId = platform.Id,
                        PlatformName = platform.PlatformType,
                        Currency = reportingCurrency,
                        Spend = bucket.Spend,
                        Revenue = bucket.Revenue,
                        Impressions = bucket.Impressions,
                        Clicks = bucket.Clicks,
                        Conversions = bucket.Conversions,
                        ROAS = Divide(bucket.Revenue, bucket.Spend),
                        CTR = Divide(bucket.Clicks, bucket.Impressions) * 100,
                        CPA = Divide(bucket.Spend, bucket.Conversions)
                    });
                }
                else
                {
                    platformRows.Add(new PlatformsTable
                    {
                        PlatformId = platform.Id,
                        PlatformName = platform.PlatformType,
                        Currency = reportingCurrency,
                        Spend = 0,
                        Revenue = 0,
                        Impressions = 0,
                        Clicks = 0,
                        Conversions = 0,
                        ROAS = 0,
                        CTR = 0,
                        CPA = 0
                    });
                }
            }
        }
        else
        {
            foreach (var (pid, bucket) in platformBuckets)
            {
                platformRows.Add(new PlatformsTable
                {
                    PlatformId = pid,
                    PlatformName = bucket.Platform?.PlatformType ?? default,
                    Currency = reportingCurrency,
                    Spend = bucket.Spend,
                    Revenue = bucket.Revenue,
                    Impressions = bucket.Impressions,
                    Clicks = bucket.Clicks,
                    Conversions = bucket.Conversions,
                    ROAS = Divide(bucket.Revenue, bucket.Spend),
                    CTR = Divide(bucket.Clicks, bucket.Impressions) * 100,
                    CPA = Divide(bucket.Spend, bucket.Conversions)
                });
            }
        }

        // ── Rule 5: Target DTO converted for overview viewing, stored DB target untouched ──
        ClientTargetDTO? targetDto = null;
        if (client.Target is not null)
        {
            var storedTargetCurrency = client.Target.Currency;
            double targetCrossRate = 1.0;
            if (storedTargetCurrency != reportingCurrency)
            {
                targetCrossRate = await _exchangeRateService.ConvertAmountAsync(1.0, storedTargetCurrency, reportingCurrency);
            }

            targetDto = new ClientTargetDTO
            {
                Id = client.Target.Id,
                Currency = reportingCurrency, // Viewed in client reporting currency
                TargetROAS = client.Target.TargetROAS,
                TargetCTR = client.Target.TargetCTR,
                TargetConversions = client.Target.TargetConversions,

                // monetary values
                TargetCPA = client.Target.TargetCPA.HasValue ?
                                client.Target.TargetCPA.Value * targetCrossRate : 0,

                MonthlyBudget = client.Target.MonthlyBudget.HasValue ?
                                client.Target.MonthlyBudget.Value * targetCrossRate : 0,

                TargetRevenue = client.Target.TargetRevenue.HasValue ?
                                client.Target.TargetRevenue.Value * targetCrossRate : 0,

                TargetCPC = client.Target.TargetCPC.HasValue ?
                                client.Target.TargetCPC.Value * targetCrossRate : 0,

            };
        }

        return new ClientPageDTO
        {
            Currency = reportingCurrency,

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

            // Rule 4: Skip AOV
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

            Target = targetDto!,

            Points = points,
            PlatformRow = platformRows,
            CampRow = campRows
        };
    }

    private PlatformPageDTO? MapToPlatformPageDTO(IEnumerable<Campaign> campaigns)
    {
        var campaignList = campaigns as IList<Campaign> ?? campaigns.ToList();

        var platformCurrency = campaignList.FirstOrDefault(c => c.Platform != null)?.Platform.Currency ?? Currency.USD;

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
    }

    private static double Divide(double numerator, double denominator) =>
        denominator == 0 ? 0 : numerator / denominator;
}
