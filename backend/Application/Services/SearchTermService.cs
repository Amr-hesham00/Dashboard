using Dashboard.Application.DTOs;
using Dashboard.Application.Interfaces;
using Dashboard.Application.Interfaces.Repositories;
using Dashboard.Application.Interfaces.Services;
using Dashboard.Domain.Entities;
using Dashboard.Domain.Enums;

namespace Dashboard.Application.Services;

public class SearchTermService : ISearchTermService
{
    private readonly ISearchTermRepo _searchTermRepo;
    private readonly IUnitOfWork _unitOfWork;

    public SearchTermService(ISearchTermRepo searchTermRepo, IUnitOfWork unitOfWork)
    {
        _searchTermRepo = searchTermRepo;
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<SearchTermDTO>?> GetSearchTermsByAdSetIdAsync(int adSetId, DateOnly startDate, DateOnly endDate)
    {
        // 1. Verify AdSet exists
        var adSet = await _unitOfWork.AdSet.GetById(adSetId);
        if (adSet == null)
        {
            return null;
        }

        // 2. Verify platform is Google Ads
        var campaign = await _unitOfWork.Campaign.GetById(adSet.CampaignId);
        if (campaign == null)
        {
            return null;
        }

        var platform = await _unitOfWork.Platform.GetById(campaign.PlatformId);
        if (platform == null || platform.PlatformType != PlatformType.GoogleAds)
        {
            // Only available for Google Ads platform
            return Enumerable.Empty<SearchTermDTO>();
        }

        // 3. Fetch search term records within date range
        var records = await _searchTermRepo.GetByAdSetIdAndDateRangeAsync(adSetId, startDate, endDate);

        // 4. Aggregate daily records for the same search term across the selected period
        var aggregated = records
            .GroupBy(x => new
            {
                Term = x.Term.Trim(),
                Keyword = (x.Keyword ?? "").Trim(),
                MatchType = x.MatchType.ToString(),
                x.Date
            })
            .Select((g, index) =>
            {
                var first = g.First();
                var impressions = g.Sum(x => x.Impressions);
                var clicks = g.Sum(x => x.Clicks);
                var spend = g.Sum(x => x.Spend);
                var conversions = g.Sum(x => x.Conversions);
                var cpa = conversions > 0 ? spend / conversions : 0.0;

                return new SearchTermDTO
                {
                    Id = first.Id,
                    Term = g.Key.Term,
                    Keyword = g.Key.Keyword,
                    MatchType = g.Key.MatchType,
                    Date = g.Key.Date,
                    Impressions = impressions,
                    Clicks = clicks,
                    Spend = Math.Round(spend, 2),
                    Conversions = conversions,
                    CPA = Math.Round(cpa, 2),
                    AdSetId = adSetId
                };
            })
            .OrderByDescending(x => x.Date)
            .ThenByDescending(x => x.Spend)
            .ToList();

        return aggregated;
    }

    public async Task<IEnumerable<SearchTermDTO>?> GetSearchTermsByCampaignIdAsync(int campaignId, DateOnly startDate, DateOnly endDate)
    {
        // 1. Verify Campaign exists
        var campaign = await _unitOfWork.Campaign.GetById(campaignId);
        if (campaign == null)
        {
            return null;
        }

        // 2. Verify platform is Google Ads
        var platform = await _unitOfWork.Platform.GetById(campaign.PlatformId);
        if (platform == null || platform.PlatformType != PlatformType.GoogleAds)
        {
            return Enumerable.Empty<SearchTermDTO>();
        }

        // 3. Fetch search term records within date range
        var records = await _searchTermRepo.GetByCampaignIdAndDateRangeAsync(campaignId, startDate, endDate);

        // 4. Aggregate daily records for the same search term across the selected period
        var aggregated = records
            .GroupBy(x => new
            {
                AdSetId = x.AdSetId,
                Term = x.Term.Trim(),
                Keyword = (x.Keyword ?? "").Trim(),
                MatchType = x.MatchType.ToString(),
                x.Date
            })
            .Select((g, index) =>
            {
                var first = g.First();
                var impressions = g.Sum(x => x.Impressions);
                var clicks = g.Sum(x => x.Clicks);
                var spend = g.Sum(x => x.Spend);
                var conversions = g.Sum(x => x.Conversions);
                var cpa = conversions > 0 ? spend / conversions : 0.0;

                return new SearchTermDTO
                {
                    Id = first.Id,
                    Term = g.Key.Term,
                    Keyword = g.Key.Keyword,
                    MatchType = g.Key.MatchType,
                    Date = g.Key.Date,
                    Impressions = impressions,
                    Clicks = clicks,
                    Spend = Math.Round(spend, 2),
                    Conversions = conversions,
                    CPA = Math.Round(cpa, 2),
                    AdSetId = g.Key.AdSetId,
                    CampaignId = first.AdSet?.CampaignId ?? campaignId,
                    CampaignName = first.AdSet?.Campaign?.Name ?? campaign.Name,
                    AdSetName = first.AdSet?.Name
                };
            })
            .OrderByDescending(x => x.Date)
            .ThenByDescending(x => x.Spend)
            .ToList();

        return aggregated;
    }

    public async Task<(bool Success, string Message, SearchTermDTO? Result)> CreateAsync(CreateSearchTermDTO dto)
    {
        var adSet = await _unitOfWork.AdSet.GetById(dto.AdSetId);
        if (adSet == null)
        {
            return (false, $"AdSet with ID '{dto.AdSetId}' not found.", null);
        }

        var entity = new SearchTerm
        {
            Term = dto.SearchTerm,
            Keyword = dto.Keyword,
            MatchType = Enum.TryParse<Dashboard.Domain.Enums.MatchType>(dto.MatchType, true, out var mt) ? mt : Dashboard.Domain.Enums.MatchType.Exact,
            Date = dto.Date,
            Impressions = dto.Impressions,
            Clicks = dto.Clicks,
            Spend = dto.Spend,
            Conversions = dto.Conversions,
            AdSetId = dto.AdSetId
        };

        await _searchTermRepo.Create(entity);
        await _searchTermRepo.Save();

        var cpa = entity.Conversions > 0 ? entity.Spend / entity.Conversions : 0.0;

        var result = new SearchTermDTO
        {
            Id = entity.Id,
            Term = entity.Term,
            Keyword = entity.Keyword ?? "",
            MatchType = entity.MatchType.ToString(),
            Date = entity.Date,
            Impressions = entity.Impressions,
            Clicks = entity.Clicks,
            Spend = Math.Round(entity.Spend, 2),
            Conversions = entity.Conversions,
            CPA = Math.Round(cpa, 2),
            AdSetId = entity.AdSetId
        };

        return (true, "Created successfully.", result);
    }
}
