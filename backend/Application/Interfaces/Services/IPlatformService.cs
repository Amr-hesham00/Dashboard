using Dashboard.Application.DTOs;

namespace Dashboard.Application.Interfaces.Services;
public interface IPlatformService
{
    Task<IEnumerable<PlatformDTO>> GetAllPlatformsAsync();
    Task<PlatformDTO?> GetPlatformByIdAsync(int id);
    Task<(bool Success, string Message, PlatformDTO? Platform)> CreatePlatformAsync(CreatePlatformDTO dto);
    Task<(bool Success, string Message)> UpdatePlatformAsync(int id, UpdatePlatformDTO dto);
    Task<(bool Success, string Message)> DeletePlatformAsync(int id);
}
