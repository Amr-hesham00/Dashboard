using Dashboard.Application.DTOs;
using Dashboard.Application.Interfaces;
using Dashboard.Application.Interfaces.Services;
using Dashboard.Domain.Entities;

namespace Dashboard.Application.Services;
public class AssociateProfileService : IAssociateProfileService
{
    private readonly IUnitOfWork _unitOfWork;

    public AssociateProfileService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<AssociateProfileDTO>> GetAllAssociateProfilesAsync()
    {
        var profiles = await _unitOfWork.AssociateProfile.GetAll(new AssociateProfile());
        return profiles.Select(MapToDTO);
    }

    public async Task<AssociateProfileDTO?> GetAssociateProfileByIdAsync(string id)
    {
        var profile = await _unitOfWork.AssociateProfile.GetByStringId(id);
        return profile == null ? null : MapToDTO(profile);
    }

    public async Task<(bool Success, string Message, AssociateProfileDTO? Profile)> CreateAssociateProfileAsync(CreateAssociateProfileDTO dto)
    {
        var existing = await _unitOfWork.AssociateProfile.GetByStringId(dto.Id);
        if (existing != null)
        {
            return (false, "An associate profile with this ID already exists.", null);
        }

        var profile = new AssociateProfile
        {
            Id = dto.Id,
            Status = dto.Status,
            TeamId = dto.TeamId,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.AssociateProfile.Create(profile);
        await _unitOfWork.Complete();

        return (true, "Associate profile created successfully.", MapToDTO(profile));
    }

    public async Task<(bool Success, string Message)> UpdateAssociateProfileAsync(string id, UpdateAssociateProfileDTO dto)
    {
        var profile = await _unitOfWork.AssociateProfile.GetByStringId(id);
        if (profile == null)
        {
            return (false, "Associate profile not found.");
        }

        profile.Status = dto.Status;
        profile.TeamId = dto.TeamId;

        _unitOfWork.AssociateProfile.Update(profile);
        await _unitOfWork.Complete();

        return (true, "Associate profile updated successfully.");
    }

    public async Task<(bool Success, string Message)> DeleteAssociateProfileAsync(string id)
    {
        var profile = await _unitOfWork.AssociateProfile.GetByStringId(id);
        if (profile == null)
        {
            return (false, "Associate profile not found.");
        }

        _unitOfWork.AssociateProfile.Delete(profile);
        await _unitOfWork.Complete();

        return (true, "Associate profile deleted successfully.");
    }

    private static AssociateProfileDTO MapToDTO(AssociateProfile profile)
    {
        return new AssociateProfileDTO
        {
            Id = profile.Id,
            Status = profile.Status,
            CreatedAt = profile.CreatedAt,
            TeamId = profile.TeamId
        };
    }
}
