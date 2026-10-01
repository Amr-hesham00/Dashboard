using Dashboard.Application.Interfaces.Repositories;
using Dashboard.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Dashboard.Infrastructure.Repositories;
public class AdSetRepo : GenericRepo<AdSet>, IAdSetRepo
{
    public AdSetRepo(AppDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<AdSet>> GetByCampaignIdAsync(int campaignId, DateOnly startDate, DateOnly endDate)
    {
        return await dbset
            .AsNoTracking()
            .Where(adSet => adSet.CampaignId == campaignId)
            .Include(adSet => adSet.Ads)
                .ThenInclude(ad => ad.DailyMetrics.Where(metric => metric.Date >= startDate && metric.Date <= endDate))
            .ToListAsync();
    }

    public async Task<IEnumerable<AdSet>> GetByClientIdAsync(int clientId)
    {
        return await dbset.AsNoTracking()
            .Where(x => x.Campaign.Platform.ClientId == clientId)
            .ToListAsync();
    }
}
