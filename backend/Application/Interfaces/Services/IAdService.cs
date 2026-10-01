using Dashboard.Application.DTOs;

namespace Dashboard.Application.Interfaces.Services;
public interface IAdService
{
    Task<IEnumerable<AdDTO>> GetAllAdsAsync();

    Task<AdDTO?> GetAdByIdAsync(int id);
    Task<(bool Success, string Message)> UpdateAdAsync(int id, UpdateAdDTO dto);
    Task<IEnumerable<AdDTO>?> GetByClientIdAsync(int clientId);
    Task<AdSetPageDTO?> GetByAdSetIdAsync(int adSetId, DateOnly start, DateOnly end);
}
