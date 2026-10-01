using Dashboard.Application.Interfaces.Repositories;
using Dashboard.Domain.Entities;
using Dashboard.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Dashboard.Infrastructure.Repositories;

public class SearchTermRepo : GenericRepo<SearchTerm>, ISearchTermRepo
{
    public SearchTermRepo(AppDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<SearchTerm>> GetByAdSetIdAndDateRangeAsync(int adSetId, DateOnly startDate, DateOnly endDate)
    {
        return await dbset.AsNoTracking()
            .Where(x => x.AdSetId == adSetId && x.Date >= startDate && x.Date <= endDate)
            .OrderBy(x => x.Date)
            .ToListAsync();
    }
    public async Task<IEnumerable<SearchTerm>> GetByAdSetIdAsync(int adSetId)
    {
        return await dbset.AsNoTracking()
            .Where(x => x.AdSetId == adSetId)
            .OrderBy(x => x.Date)
            .ToListAsync();
    }
    public async Task<IEnumerable<SearchTerm>> GetByCampaignIdAndDateRangeAsync(int campaignId, DateOnly startDate, DateOnly endDate)
    {
        return await dbset.AsNoTracking()
            .Include(x => x.AdSet)
                .ThenInclude(a => a.Campaign)
            .Where(x => x.AdSet.CampaignId == campaignId
                     && x.AdSet.Campaign.Platform.PlatformType == PlatformType.GoogleAds
                     && x.Date >= startDate
                     && x.Date <= endDate)
            .OrderBy(x => x.Date)
            .ToListAsync();
    }
    public async Task<IEnumerable<SearchTerm>> GetByPlatformAndDateRangeAsync(int clientId, int platformId, DateOnly startDate, DateOnly endDate)
    {
        return await dbset.AsNoTracking()
            .Include(x => x.AdSet)
                .ThenInclude(a => a.Campaign)
            .Where(x => x.AdSet.Campaign.PlatformId == platformId
                     && x.AdSet.Campaign.Platform.ClientId == clientId
                     && x.AdSet.Campaign.Platform.PlatformType == PlatformType.GoogleAds
                     && x.Date >= startDate
                     && x.Date <= endDate)
            .OrderBy(x => x.Date)
            .ToListAsync();
    }

    // done
    public async Task<IEnumerable<SearchTerm>> GetByAdSetIdAsync(
    int adSetId,
    DateOnly start,
    DateOnly end)
    {
        return await dbset
            .AsNoTracking()
            .Where(term =>
                term.AdSetId == adSetId &&
                term.Date >= start &&
                term.Date <= end)
            .ToListAsync();
    }
}
