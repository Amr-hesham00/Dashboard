using Dashboard.Domain.Entities;

namespace Dashboard.Application.Interfaces.Repositories;

public interface IAdDailyMetricsRepo : IGenericRepo<AdDailyMetrics>
{
    Task<IEnumerable<AdDailyMetrics>> GetByAdIdAsync(int Id);
    Task<IEnumerable<AdDailyMetrics>> GetByAdIdAndDateRangeAsync(int adId, DateOnly startDate, DateOnly endDate);
    Task<IEnumerable<AdDailyMetrics>> GetByDateRangeAsync(DateOnly startDate, DateOnly endDate);
    /// <returns>returns all metric records of the specified AdSet within the date range</returns>
    Task<IEnumerable<AdDailyMetrics>> GetByAdSetIdAsync(int adSetId, DateOnly startDate, DateOnly endDate);
    Task<AdDailyMetrics?> GetByAdIdAndDateAsync(int adId, DateOnly date);


}
