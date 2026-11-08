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
        {
            // Fallback for Performance Max Asset Groups if navigated via adset URL
            return await GetByAssetGroupIdAsync(adSetId, start, end);
        }

        var ads = (await _unitOfWork.Ad
            .GetByAdSetIdAsync(adSetId, start, end));

        var metrics = ads.SelectMany(ad => ad.DailyMetrics);

        var searchTerms = await _unitOfWork.SearchTerm
            .GetByAdSetIdAsync(adSetId, start, end);

        return MapToDTO(adSet, ads, metrics, searchTerms, start, end);
    }

    public async Task<AdSetPageDTO?> GetByAssetGroupIdAsync(
        int assetGroupId,
        DateOnly start,
        DateOnly end)
    {
        var assetGroup = await _unitOfWork.AssetGroup.GetByIdWithMetricsAsync(assetGroupId, start, end);
        if (assetGroup is null)
            return null;

        return MapAssetGroupToDTO(assetGroup, start, end);
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
         AdSet adSet,
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
                Impressions = dailyImpressions,
                Clicks = dailyClicks,
                Conversions = dailyConversions,
                ROAS = dailySpend > 0 ? dailyRevenue / dailySpend : 0,
                CPA = dailyConversions > 0 ? dailySpend / dailyConversions : 0,
                CPC = dailyClicks > 0 ? dailySpend / dailyClicks : 0,
                CPM = dailyImpressions > 0 ? (dailySpend / dailyImpressions) * 1000 : 0,
                ConversionRate = dailyClicks > 0 ? (double)dailyConversions / dailyClicks * 100 : 0,
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
                Id = ad.Id,
                Name = ad.Name,
                Status = ad.Status,
                Spend = adSpend,
                Revenue = adRevenue,
                Impressions = adMetrics.Sum(m => m.Impressions),
                Clicks = adMetrics.Sum(m => m.Clicks),
                Conversions = adConversions,
                CPA = adConversions > 0 ? adSpend / adConversions : 0,
                ROAS = adSpend > 0 ? adRevenue / adSpend : 0,
                CTR = adMetrics.Sum(m => m.Impressions) > 0 ? (double)adMetrics.Sum(m => m.Clicks) / adMetrics.Sum(m => m.Impressions) * 100 : 0,
                CPC = adMetrics.Sum(m => m.Clicks) > 0 ? adSpend / adMetrics.Sum(m => m.Clicks) : 0,
                CPM = adMetrics.Sum(m => m.Impressions) > 0 ? (adSpend / adMetrics.Sum(m => m.Impressions)) * 1000 : 0,
                ConversionRate = adMetrics.Sum(m => m.Clicks) > 0 ? (double)adConversions / adMetrics.Sum(m => m.Clicks) * 100 : 0
            };
        }).ToList();

        var searchTermRows = MapSearchTermRows(searchTerms);

        return new AdSetPageDTO
        {
            AdSetId = adSet.Id,
            AdSetName = adSet.Name,
            AdSetStatus = adSet.Status.ToString(),
            AudienceType = adSet.AudienceType,
            AgeRange = adSet.AgeRange,
            Gender = adSet.Gender.ToString(),
            Location = adSet.Location,
            CampaignId = adSet.CampaignId,
            CampaignName = adSet.Campaign?.Name ?? string.Empty,
            ClientId = adSet.Campaign?.Platform?.ClientId ?? 0,
            ClientName = adSet.Campaign?.Platform?.Client?.CompanyName ?? string.Empty,
            PlatformType = adSet.Campaign?.Platform?.PlatformType.ToString(),
            Currency = adSet.Campaign?.Currency.ToString(),
            ChannelType = adSet.Campaign?.ChannelType ?? "SEARCH",
            IsPerformanceMax = false,
            IsAssetGroup = false,
            StartDate = DateOnly.FromDateTime(adSet.StartDate.DateTime),
            EndDate = adSet.EndDate.HasValue ? DateOnly.FromDateTime(adSet.EndDate.Value.DateTime) : null,

            Spend = spend,
            Revenue = revenue,
            Conversions = conversions,
            Impressions = impressions,
            Clicks = clicks,
            ROAS = spend > 0 ? revenue / spend : 0,
            CPA = conversions > 0 ? spend / conversions : 0,
            CTR = impressions > 0
                ? (double)clicks / impressions * 100
                : 0,
            CPC = clicks > 0
                ? spend / clicks
                : 0,
            CPM = impressions > 0
                ? (spend / impressions) * 1000
                : 0,
            ConversionRate = clicks > 0
                ? (double)conversions / clicks * 100
                : 0,

            Points = points,
            AdRow = adRows,

            SearchTermRows = searchTermRows,
        };
    }

    private static AdSetPageDTO MapAssetGroupToDTO(
        AssetGroup assetGroup,
        DateOnly start,
        DateOnly end)
    {
        var metrics = assetGroup.DailyMetrics?.ToList() ?? new List<DailyAssetGroupMetrics>();

        var totalSpend = metrics.Sum(m => m.Spend);
        var totalRevenue = metrics.Sum(m => m.Revenue);
        var totalImpressions = metrics.Sum(m => m.Impressions);
        var totalClicks = metrics.Sum(m => m.Clicks);
        var totalConversions = metrics.Sum(m => m.Conversions);

        var byDate = metrics.ToDictionary(m => m.Date, m => m);
        var points = new List<ChartPoint>();

        for (var date = start; date <= end; date = date.AddDays(1))
        {
            byDate.TryGetValue(date, out var daily);
            var dailySpend = daily?.Spend ?? 0.0;
            var dailyRevenue = daily?.Revenue ?? 0.0;
            var dailyImpressions = daily?.Impressions ?? 0;
            var dailyClicks = daily?.Clicks ?? 0;
            var dailyConversions = daily?.Conversions ?? 0;

            points.Add(new ChartPoint
            {
                Date = date,
                Spend = dailySpend,
                Revenue = dailyRevenue,
                Impressions = dailyImpressions,
                Clicks = dailyClicks,
                Conversions = dailyConversions,
                ROAS = dailySpend > 0 ? dailyRevenue / dailySpend : 0,
                CPA = dailyConversions > 0 ? dailySpend / dailyConversions : 0,
                CPC = dailyClicks > 0 ? dailySpend / dailyClicks : 0,
                CPM = dailyImpressions > 0 ? (dailySpend / dailyImpressions) * 1000 : 0,
                ConversionRate = dailyClicks > 0 ? (double)dailyConversions / dailyClicks * 100 : 0,
                CTR = dailyImpressions > 0 ? (double)dailyClicks / dailyImpressions * 100 : 0
            });
        }

        var channelType = assetGroup.Campaign?.ChannelType ?? "PERFORMANCE_MAX";

        return new AdSetPageDTO
        {
            AdSetId = assetGroup.Id,
            AdSetName = assetGroup.Name,
            AdSetStatus = assetGroup.Status.ToString(),
            CampaignId = assetGroup.CampaignId,
            CampaignName = assetGroup.Campaign?.Name ?? string.Empty,
            ClientId = assetGroup.Campaign?.Platform?.ClientId ?? 0,
            ClientName = assetGroup.Campaign?.Platform?.Client?.CompanyName ?? string.Empty,
            PlatformType = assetGroup.Campaign?.Platform?.PlatformType.ToString() ?? "GoogleAds",
            Currency = (assetGroup.Campaign?.Platform?.Currency ?? assetGroup.Campaign?.Currency).ToString(),
            StartDate = DateOnly.FromDateTime(assetGroup.StartDate.DateTime),
            EndDate = assetGroup.EndDate.HasValue ? DateOnly.FromDateTime(assetGroup.EndDate.Value.DateTime) : null,
            ChannelType = channelType,
            IsPerformanceMax = true,
            IsAssetGroup = true,

            Spend = totalSpend,
            Revenue = totalRevenue,
            Impressions = totalImpressions,
            Clicks = totalClicks,
            Conversions = totalConversions,
            CTR = totalImpressions > 0 ? (double)totalClicks / totalImpressions * 100 : 0,
            CPA = totalConversions > 0 ? totalSpend / totalConversions : 0,
            ROAS = totalSpend > 0 ? totalRevenue / totalSpend : 0,
            CPC = totalClicks > 0 ? totalSpend / totalClicks : 0,
            CPM = totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0,
            ConversionRate = totalClicks > 0 ? (double)totalConversions / totalClicks * 100 : 0,

            Points = points,
            AdRow = Array.Empty<TableRow>(),
            SearchTermRows = Array.Empty<SearchTermRow>()
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



