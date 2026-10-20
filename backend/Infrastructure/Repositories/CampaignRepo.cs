using Dashboard.Application.Interfaces.Repositories;
using Dashboard.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Dashboard.Infrastructure.Repositories;
public class CampaignRepo : GenericRepo<Campaign>, ICampaignRepo
{
    public CampaignRepo(AppDbContext context) : base(context)
    {
    }

    public override async Task<Campaign?> GetById(int id)
    {
        return await dbset
            .AsNoTracking()
            .Include(x => x.Platform)
                .ThenInclude(p => p.Client)
            .FirstOrDefaultAsync(x => x.Id == id);
    }

    // done 
    public async Task<IEnumerable<Campaign>> GetByPlatformAsync(int clientId, int platformid, DateOnly startDate, DateOnly endDate)
    {
        return await dbset.AsNoTracking()
            .Include(x => x.Platform)
            .Include(x => x.AdSets)
                .ThenInclude(x => x.Ads)
                .ThenInclude(x => x.DailyMetrics.Where(metric => metric.Date >= startDate && metric.Date <= endDate))
            .Where(x => x.Platform.ClientId == clientId && x.Platform.Id == platformid)
            .ToListAsync();
    }
    //under process
    public async Task<IEnumerable<Campaign>> GetByClientIdAsync(int clientId, DateOnly startDate, DateOnly endDate)
    {
        return await dbset.AsNoTracking()
            .Include(x => x.Platform)
            .Include(x => x.AdSets)
                .ThenInclude(x => x.Ads)
                .ThenInclude(x => x.DailyMetrics.Where(metric => metric.Date >= startDate && metric.Date <= endDate))
            .Where(x => x.Platform.ClientId == clientId)
            .ToListAsync();
    }


}
