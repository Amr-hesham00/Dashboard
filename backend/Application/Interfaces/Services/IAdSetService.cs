using Dashboard.Application.DTOs;

namespace Dashboard.Application.Interfaces.Services;
public interface IAdSetService
{
    Task<AdSetDTO?> GetByIdAsync(int id);
    Task<(bool Success, string Message)> DeleteAdSetAsync(int id);

    Task<IEnumerable<AdSetDTO>?> GetAdSetsByClientIdAsync(int clientId);
    Task<CampPageDTO?> GetByCampaignIdAsync(int campaignId, DateOnly startDate, DateOnly endDate);
}
