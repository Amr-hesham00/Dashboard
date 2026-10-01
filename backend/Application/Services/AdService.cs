using Dashboard.Application.DTOs;
using Dashboard.Application.Interfaces;
using Dashboard.Application.Interfaces.Services;
using Dashboard.Domain.Entities;

namespace Dashboard.Application.Services;
public class AdService : IAdService
{
    private readonly IUnitOfWork _unitOfWork;

    public AdService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<AdDTO>> GetAllAdsAsync()
    {
        var ads = await _unitOfWork.Ad.GetAll(new Ad());
        return new List<AdDTO> { };
    }

    public async Task<(bool Success, string Message)> UpdateAdAsync(int id, UpdateAdDTO dto)
    {
        var ad = await _unitOfWork.Ad.GetById(id);
        if (ad == null)
        {
            return (false, "Ad not found.");
        }

        ad.ExternalId = dto.ExternalId;
        ad.Name = dto.Name;
        ad.Headline = dto.Headline;
        ad.Description = dto.Description;
        ad.CTA = dto.CTA;
        ad.MediaURL = dto.MediaURL;
        ad.MediaType = dto.MediaType;
        ad.Status = dto.Status;
        ad.AdSetId = dto.AdSetId;

        _unitOfWork.Ad.Update(ad);
        await _unitOfWork.Complete();

        return (true, "Ad updated successfully.");
    }

    public async Task<IEnumerable<AdDTO>?> GetByClientIdAsync(int clientId)
    {
        var client = await _unitOfWork.Client.GetById(clientId);
        if (client == null)
        {
            return null;
        }

        var ads = await _unitOfWork.Ad.GetByClientIdAsync(clientId);
        return new List<AdDTO> { };
    }

    // Done
    public async Task<AdSetPageDTO?> GetByAdSetIdAsync(
    int adSetId,
    DateOnly start,
    DateOnly end)
    {
        var adSet = await _unitOfWork.AdSet.GetById(adSetId);

        if (adSet is null)
            return null;

        var ads = (await _unitOfWork.Ad
            .GetByAdSetIdAsync(adSetId, start, end));

        var metrics = ads.SelectMany(ad => ad.DailyMetrics);

        var searchTerms = await _unitOfWork.SearchTerm
            .GetByAdSetIdAsync(adSetId, start, end);

        return MapToDTO(ads, metrics, searchTerms, start, end);
    }

    public async Task<AdDTO?> GetAdByIdAsync(int id)
    {
        Ad? ad = await _unitOfWork.Ad.GetById(id);

        if (ad == null)
            return null;

        IEnumerable<AdDailyMetrics> metrics = await _unitOfWork.AdDailyMetrics.GetByAdIdAsync(id);

        return MapToDTO(ad, metrics);
    }

    //methods
    private AdDTO MapToDTO(Ad ad, IEnumerable<AdDailyMetrics> metrics)
    {
        var totalImpressions = metrics.Sum(m => m.Impressions);
        var totalClicks = metrics.Sum(m => m.Clicks);
        var totalConversions = metrics.Sum(m => m.Conversions);
        var totalSpend = metrics.Sum(m => m.Spend);
        var totalRevenue = metrics.Sum(m => m.Revenue);

        double ctr = totalImpressions > 0 ? (double)totalClicks / totalImpressions : 0;
        double cpc = totalClicks > 0 ? totalSpend / totalClicks : 0;
        double cpa = totalConversions > 0 ? totalSpend / totalConversions : 0;
        double roas = totalSpend > 0 ? totalRevenue / totalSpend : 0;

        return new AdDTO
        {

            AdSetId = ad.AdSetId,
            Id = ad.Id,
            ExternalId = ad.ExternalId,
            Name = ad.Name,
            Headline = ad.Headline,
            Description = ad.Description,
            CTA = ad.CTA,
            MediaURL = ad.MediaURL,
            MediaType = ad.MediaType,
            Status = ad.Status,
            CreatedAt = ad.CreatedAt,

            // metrics
            Impressions = totalImpressions,
            Clicks = totalClicks,
            Conversions = totalConversions,
            Spend = totalSpend,
            Revenue = totalRevenue,
            CTR = ctr,
            CPC = cpc,
            CPA = cpa,
            ROAS = roas
        };
    }

    private AdSetPageDTO MapToDTO(
         IEnumerable<Ad> ads,
    IEnumerable<AdDailyMetrics> metrics,
    IEnumerable<SearchTerm> searchTerms,
    DateOnly start,
    DateOnly end)
    {
        var metricList = metrics.ToList();

        // for KPIs
        var spend = metricList.Sum(m => m.Spend);
        var revenue = metricList.Sum(m => m.Revenue);
        var impressions = metricList.Sum(m => m.Impressions);
        var clicks = metricList.Sum(m => m.Clicks);
        var conversions = metricList.Sum(m => m.Conversions);

        // Group once for the chart and once for the ads table
        var metricsByDate = metricList
            .GroupBy(m => m.Date)
            .ToDictionary(g => g.Key, g => g.ToList()); // Key = date; Value = list of complete AdDailyMetrics records for that date.

        var metricsByAd = metricList
            .GroupBy(m => m.AdId)
            .ToDictionary(g => g.Key, g => g.ToList());// Key = AdId; Value = list of complete AdDailyMetrics records for that ad.

        var points = new List<ChartPoint>();

        // for chart metrics
        for (var date = start; date <= end; date = date.AddDays(1))
        {
            /*
             Find this date's records and store them in 'daily'.
             If the date is missing, 'daily' is null. The true/false result is ignored.
            */
            metricsByDate.TryGetValue(date, out var daily); // daily = List<AdDailymetrics> (value of dictionary)
            daily ??= new List<AdDailyMetrics>();

            var dailySpend = daily.Sum(m => m.Spend);
            var dailyRevenue = daily.Sum(m => m.Revenue);
            var dailyImpressions = daily.Sum(m => m.Impressions);
            var dailyClicks = daily.Sum(m => m.Clicks);
            var dailyConversions = daily.Sum(m => m.Conversions);

            points.Add(new ChartPoint
            {
                Date = date,
                Spend = dailySpend,
                Revenue = dailyRevenue,
                Conversions = dailyConversions,
                ROAS = dailySpend > 0 ? dailyRevenue / dailySpend : 0,
                CPA = dailyConversions > 0 ? dailySpend / dailyConversions : 0,
                CTR = dailyImpressions > 0
                    ? (double)dailyClicks / dailyImpressions * 100
                    : 0
            });
        }

        // for ads table
        // once for each ad, Each run returns one TableRow
        var adRows = ads.Select(ad =>
        {
            metricsByAd.TryGetValue(ad.Id, out var adMetrics); // adMetrics = List<AdDailyMetrics> (value of "metricsByAd" dictionary)
            adMetrics ??= new List<AdDailyMetrics>();

            var adSpend = adMetrics.Sum(m => m.Spend);
            var adRevenue = adMetrics.Sum(m => m.Revenue);
            var adConversions = adMetrics.Sum(m => m.Conversions);

            return new TableRow
            {
                Name = ad.Name,
                Status = ad.Status,
                Spend = adSpend,
                Revenue = adRevenue,
                Impressions = adMetrics.Sum(m => m.Impressions),
                Clicks = adMetrics.Sum(m => m.Clicks),
                Conversions = adConversions,
                CPA = adConversions > 0 ? adSpend / adConversions : 0,
                ROAS = adSpend > 0 ? adRevenue / adSpend : 0
            };
        }).ToList();

        var searchTermRows = MapSearchTermRows(searchTerms);

        return new AdSetPageDTO
        {
            Spend = spend,
            Revenue = revenue,
            Conversions = conversions,
            ROAS = spend > 0 ? revenue / spend : 0,
            CPA = conversions > 0 ? spend / conversions : 0,
            CTR = impressions > 0
                ? (double)clicks / impressions * 100
                : 0,

            Points = points,
            AdRow = adRows,

            SearchTermRows = searchTermRows,
        };
    }
    private static List<SearchTermRow> MapSearchTermRows(
    IEnumerable<SearchTerm> searchTerms)
    {
        return searchTerms
            .GroupBy(term => new
            {
                term.Term,
                term.Keyword,
                term.MatchType
            })
            .Select(group =>
            {
                var spend = group.Sum(term => term.Spend);
                var conversions = group.Sum(term => term.Conversions);

                var firstDate = group.Min(term => term.Date);
                var lastDate = group.Max(term => term.Date);

                return new SearchTermRow
                {
                    Term = group.Key.Term,
                    Keyword = group.Key.Keyword,
                    MatchType = group.Key.MatchType.ToString(),

                    Impressions = group.Sum(term => term.Impressions),
                    Clicks = group.Sum(term => term.Clicks),
                    Spend = spend,
                    Conversions = conversions,

                    CPA = conversions > 0
                        ? spend / conversions
                        : (double?)null
                };
            })
            .OrderByDescending(row => row.Spend)
            .ThenBy(row => row.Term)
            .ThenBy(row => row.Keyword)
            .ThenBy(row => row.MatchType)
            .ToList();
    }
}


