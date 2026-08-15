using Dashboard.Application.DTOs;

namespace Dashboard.Application.Interfaces.Services;
public interface IAdService
{
    Task<IEnumerable<AdDTO>> GetAllAdsAsync();
    Task<AdDTO?> GetAdByIdAsync(int id);
    Task<(bool Success, string Message, AdDTO? Ad)> CreateAdAsync(CreateAdDTO dto);
    Task<(bool Success, string Message)> UpdateAdAsync(int id, UpdateAdDTO dto);
    Task<(bool Success, string Message)> DeleteAdAsync(int id);
}
