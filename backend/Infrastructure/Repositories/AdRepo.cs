using Dashboard.Application.Interfaces.Repositories;
using Dashboard.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Dashboard.Infrastructure.Repositories;
public class AdRepo : GenericRepo<Ad>, IAdRepo
{
    public AdRepo(AppDbContext context) : base(context)
    {
    }
    public async Task<IEnumerable<Ad>> GetByClientIdAsync(int clientId)
    {
        return await dbset.AsNoTracking()
            .Include(x => x.DailyMetrics)
            .Where(x => x.Adset.Campaign.Platform.ClientId == clientId)
            .ToListAsync();
    }

    // done
    public async Task<IEnumerable<Ad>> GetByAdSetIdAsync(int adSetId, DateOnly start, DateOnly end)
    {
        return await dbset.AsNoTracking()
            .Include(x => x.DailyMetrics.Where(m => m.Date >= start && m.Date <= end))
            .Where(x => x.AdSetId == adSetId)
            .ToListAsync();
    }

}
