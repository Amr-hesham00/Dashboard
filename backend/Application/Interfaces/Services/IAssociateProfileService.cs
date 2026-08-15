using Dashboard.Application.DTOs;

namespace Dashboard.Application.Interfaces.Services;
public interface IAssociateProfileService
{
    Task<IEnumerable<AssociateProfileDTO>> GetAllAssociateProfilesAsync();
    Task<AssociateProfileDTO?> GetAssociateProfileByIdAsync(string id);
    Task<(bool Success, string Message, AssociateProfileDTO? Profile)> CreateAssociateProfileAsync(CreateAssociateProfileDTO dto);
    Task<(bool Success, string Message)> UpdateAssociateProfileAsync(string id, UpdateAssociateProfileDTO dto);
    Task<(bool Success, string Message)> DeleteAssociateProfileAsync(string id);
}
