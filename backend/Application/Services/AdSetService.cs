using Dashboard.Application.DTOs;
using Dashboard.Application.Interfaces;
using Dashboard.Application.Interfaces.Services;
using Dashboard.Domain.Entities;

namespace Dashboard.Application.Services;
public class AdSetService : IAdSetService

{
    private readonly IUnitOfWork _unitOfWork;

    public AdSetService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<AdSetDTO?> GetByIdAsync(int id)
    {
        //var adset = await _unitOfWork.AdSet.GetById(id);
        //if (adset == null)
        //    return null;

        //var ads = await _unitOfWork.Ad.GetByAdSetIdAsync(id);
        //var metrics = await _unitOfWork.AdDailyMetrics.GetByAdSetIdAsync(id);


        return new AdSetDTO();
    }
    public async Task<IEnumerable<AdSetDTO>?> GetAdSetsByClientIdAsync(int clientId)
    {
        var client = await _unitOfWork.Client.GetById(clientId);
        if (client == null)
            return null;

        var adSets = await _unitOfWork.AdSet.GetByClientIdAsync(clientId);
        return new List<AdSetDTO> { };
    }
    public async Task<(bool Success, string Message)> DeleteAdSetAsync(int id)
    {
        var adSet = await _unitOfWork.AdSet.GetById(id);
        if (adSet == null)
        {
            return (false, "Ad set not found.");
        }

        _unitOfWork.AdSet.Delete(adSet);
        await _unitOfWork.Complete();

        return (true, "Ad set deleted successfully.");
    }

    //under progress
    public async Task<CampPageDTO?> GetByCampaignIdAsync(
    int campaignId,
    DateOnly startDate,
    DateOnly endDate)
    {
        if (endDate < startDate)
            throw new ArgumentException(
                "End date must be on or after start date.",
                nameof(endDate));

        var campaign = await _unitOfWork.Campaign
            .GetById(campaignId);

        if (campaign is null)
            return null;

        var adSets = await _unitOfWork.AdSet
            .GetByCampaignIdAsync(campaignId, startDate, endDate);

        return MapToDTO(campaign, adSets, startDate, endDate);
    }


    //public async Task<CampPageDTO?> GetByCampaignIdAsync(int campaignId, DateOnly startDate, DateOnly endDate)
    //{
    //    var campaign = await _unitOfWork.Campaign.GetById(campaignId);
    //    if (campaign == null)
    //        return null;

    //    var adSets = await _unitOfWork.AdSet.GetByCampaignIdAsync(campaignId, startDate, endDate);

    //    return MapToDTO(adSets);

    private static CampPageDTO MapToDTO(
       Campaign campaign,
       IEnumerable<AdSet> adSets,
       DateOnly startDate,
       DateOnly endDate)
    {
        var adSetList = adSets.ToList();

        // Collect the selected period's metrics from every ad in the campaign.
        var metrics = adSetList
            .SelectMany(adSet => adSet.Ads)
            .SelectMany(ad => ad.DailyMetrics)
            .ToList();

        var total = SumMetrics(metrics);
        var byDate = metrics.ToLookup(metric => metric.Date);

        // Chart: combine all ads' metrics for each date.
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

        // Table: combine each ad set's ads into one row.
        var rows = new List<TableRow>();

        foreach (var adSet in adSetList)
        {
            var adSetMetrics = adSet.Ads
                .SelectMany(ad => ad.DailyMetrics);

            var adSetTotal = SumMetrics(adSetMetrics);

            rows.Add(new TableRow
            {
                Name = adSet.Name,
                Status = adSet.Status,
                Spend = adSetTotal.Spend,
                Revenue = adSetTotal.Revenue,
                Impressions = adSetTotal.Impressions,
                Clicks = adSetTotal.Clicks,
                Conversions = adSetTotal.Conversions,
                CPA = Divide(adSetTotal.Spend, adSetTotal.Conversions),
                ROAS = Divide(adSetTotal.Revenue, adSetTotal.Spend)
            });
        }

        return new CampPageDTO
        {
            CampName = campaign.Name,
            Status = campaign.Status.ToString(),
            CampPlatform = campaign.Platform.PlatformType.ToString(),

            Spend = total.Spend,
            Revenue = total.Revenue,
            Impressions = total.Impressions,
            Clicks = total.Clicks,
            Conversions = total.Conversions,

            CPA = Divide(total.Spend, total.Conversions),
            ROAS = Divide(total.Revenue, total.Spend),
            CPC = Divide(total.Spend, total.Clicks),
            CPM = Divide(total.Spend, total.Impressions) * 1000,
            ConversionRate = Divide(total.Conversions, total.Clicks) * 100,

            // Valid only when Conversions counts completed orders.
            AOV = Divide(total.Revenue, total.Conversions),

            Points = points,
            AdsetRows = rows
        };
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
