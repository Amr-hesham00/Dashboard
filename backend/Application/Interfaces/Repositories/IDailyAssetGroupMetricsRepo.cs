using Dashboard.Domain.Entities;

namespace Dashboard.Application.Interfaces.Repositories;

public interface IDailyAssetGroupMetricsRepo : IGenericRepo<DailyAssetGroupMetrics>
{
    Task<IEnumerable<DailyAssetGroupMetrics>> GetByAssetGroupIdAndDateRangeAsync(int assetGroupId, DateOnly startDate, DateOnly endDate);
    Task<DailyAssetGroupMetrics?> GetByAssetGroupIdAndDateAsync(int assetGroupId, DateOnly date);
    Task<List<DailyAssetGroupMetrics>> GetTrackedByPlatformAndDateRangeAsync(int platformId, DateOnly startDate, DateOnly endDate);
}

