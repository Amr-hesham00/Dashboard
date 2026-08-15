using Dashboard.Application.DTOs;

namespace Dashboard.Application.Interfaces.Services;
public interface IAdSetService
{
    Task<IEnumerable<AdSetDTO>> GetAllAdSetsAsync();
    Task<AdSetDTO?> GetAdSetByIdAsync(int id);
    Task<(bool Success, string Message, AdSetDTO? AdSet)> CreateAdSetAsync(CreateAdSetDTO dto);
    Task<(bool Success, string Message)> UpdateAdSetAsync(int id, UpdateAdSetDTO dto);
    Task<(bool Success, string Message)> DeleteAdSetAsync(int id);
}
