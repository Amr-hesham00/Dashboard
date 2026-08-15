using Dashboard.Application.DTOs;
using Dashboard.Application.Interfaces;
using Dashboard.Application.Interfaces.Services;
using Dashboard.Domain.Entities;

namespace Dashboard.Application.Services;
public class PlatformService : IPlatformService
{
    private readonly IUnitOfWork _unitOfWork;

    public PlatformService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<PlatformDTO>> GetAllPlatformsAsync()
    {
        var platforms = await _unitOfWork.Platform.GetAll(new Platform());
        return platforms.Select(MapToDTO);
    }

    public async Task<PlatformDTO?> GetPlatformByIdAsync(int id)
    {
        var platform = await _unitOfWork.Platform.GetById(id);
        return platform == null ? null : MapToDTO(platform);
    }

    public async Task<(bool Success, string Message, PlatformDTO? Platform)> CreatePlatformAsync(CreatePlatformDTO dto)
    {
        var platform = new Platform
        {
            PlatformType = dto.PlatformType,
            Status = dto.Status,
            ClientId = dto.ClientId,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Platform.Create(platform);
        await _unitOfWork.Complete();

        return (true, "Platform created successfully.", MapToDTO(platform));
    }

    public async Task<(bool Success, string Message)> UpdatePlatformAsync(int id, UpdatePlatformDTO dto)
    {
        var platform = await _unitOfWork.Platform.GetById(id);
        if (platform == null)
        {
            return (false, "Platform not found.");
        }

        platform.PlatformType = dto.PlatformType;
        platform.Status = dto.Status;
        platform.ClientId = dto.ClientId;

        _unitOfWork.Platform.Update(platform);
        await _unitOfWork.Complete();

        return (true, "Platform updated successfully.");
    }

    public async Task<(bool Success, string Message)> DeletePlatformAsync(int id)
    {
        var platform = await _unitOfWork.Platform.GetById(id);
        if (platform == null)
        {
            return (false, "Platform not found.");
        }

        _unitOfWork.Platform.Delete(platform);
        await _unitOfWork.Complete();

        return (true, "Platform deleted successfully.");
    }

    private static PlatformDTO MapToDTO(Platform platform)
    {
        return new PlatformDTO
        {
            Id = platform.Id,
            PlatformType = platform.PlatformType,
            Status = platform.Status,
            CreatedAt = platform.CreatedAt,
            ClientId = platform.ClientId
        };
    }
}
