using Dashboard.Application.Interfaces.Repositories;
using Dashboard.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Dashboard.Infrastructure.Repositories;

public class DailyAssetGroupMetricsRepo : GenericRepo<DailyAssetGroupMetrics>, IDailyAssetGroupMetricsRepo
{
    public DailyAssetGroupMetricsRepo(AppDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<DailyAssetGroupMetrics>> GetByAssetGroupIdAndDateRangeAsync(int assetGroupId, DateOnly startDate, DateOnly endDate)
    {
        return await dbset.AsNoTracking()
            .Where(x => x.AssetGroupId == assetGroupId && x.Date >= startDate && x.Date <= endDate)
            .OrderBy(x => x.Date)
            .ToListAsync();
    }

    public async Task<DailyAssetGroupMetrics?> GetByAssetGroupIdAndDateAsync(int assetGroupId, DateOnly date)
    {
        return await dbset.FirstOrDefaultAsync(x => x.AssetGroupId == assetGroupId && x.Date == date);
    }

    public async Task<List<DailyAssetGroupMetrics>> GetTrackedByPlatformAndDateRangeAsync(int platformId, DateOnly startDate, DateOnly endDate)
    {
        return await dbset
            .Where(x => x.AssetGroup.Campaign.PlatformId == platformId && x.Date >= startDate && x.Date <= endDate)
            .ToListAsync();
    }
}

