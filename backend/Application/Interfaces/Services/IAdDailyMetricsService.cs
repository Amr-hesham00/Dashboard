using Dashboard.Application.DTOs;

namespace Dashboard.Application.Interfaces.Services;

public interface IAdDailyMetricsService
{
    Task<IEnumerable<AdDailyMetricsDTO>> GetAllAsync();
    Task<AdDailyMetricsDTO?> GetByIdAsync(int id);
    Task<IEnumerable<AdDailyMetricsDTO>> GetByAdIdAsync(int adId);
    Task<IEnumerable<AdDailyMetricsDTO>> GetByAdIdAndDateRangeAsync(int adId, DateOnly startDate, DateOnly endDate);
    Task<(bool Success, string Message, AdDailyMetricsDTO? Metrics)> CreateOrUpdateAsync(CreateAdDailyMetricsDTO dto);
    Task<(bool Success, string Message)> UpdateAsync(int id, UpdateAdDailyMetricsDTO dto);
    Task<(bool Success, string Message)> DeleteAsync(int id);
    Task<(bool Success, string Message, int ProcessedCount)> BulkUpsertAsync(IEnumerable<CreateAdDailyMetricsDTO> dtos);
}
