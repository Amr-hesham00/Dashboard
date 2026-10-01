using Dashboard.Application.Interfaces.Repositories;
using Dashboard.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Dashboard.Infrastructure.Repositories;

public class AdDailyMetricsRepo : GenericRepo<AdDailyMetrics>, IAdDailyMetricsRepo
{
    public AdDailyMetricsRepo(AppDbContext context) : base(context)
    {
    }


    public async Task<IEnumerable<AdDailyMetrics>> GetByAdIdAndDateRangeAsync(int adId, DateOnly startDate, DateOnly endDate)
    {
        return await dbset.AsNoTracking()
            .Where(x => x.AdId == adId && x.Date >= startDate && x.Date <= endDate)
            .OrderBy(x => x.Date)
            .ToListAsync();
    }

    public async Task<IEnumerable<AdDailyMetrics>> GetByDateRangeAsync(DateOnly startDate, DateOnly endDate)
    {
        return await dbset.AsNoTracking()
            .Where(x => x.Date >= startDate && x.Date <= endDate)
            .OrderBy(x => x.Date)
            .ToListAsync();
    }

    public async Task<AdDailyMetrics?> GetByAdIdAndDateAsync(int adId, DateOnly date)
    {
        return await dbset.FirstOrDefaultAsync(x => x.AdId == adId && x.Date == date);
    }

    // Done
    public async Task<IEnumerable<AdDailyMetrics>> GetByAdSetIdAsync(int AdSetId, DateOnly startDate, DateOnly endDate)
    {
        return await dbset.AsNoTracking()
            .Where(x => x.Ad.AdSetId == AdSetId && x.Date >= startDate && x.Date <= endDate)
            .OrderBy(x => x.Date)
            .ToListAsync();
    }
    public async Task<IEnumerable<AdDailyMetrics>> GetByAdIdAsync(int adId)
    {
        return await dbset.AsNoTracking()
            .Where(x => x.AdId == adId)
            .OrderByDescending(x => x.Date)
            .ToListAsync();
    }
}
