using Dashboard.Application.DTOs;

namespace Dashboard.Application.Interfaces.Services;
public interface IAssociateTeamService
{
    Task<IEnumerable<AssociateTeamDTO>> GetAllAssociateTeamsAsync();
    Task<AssociateTeamDTO?> GetAssociateTeamByIdAsync(int id);
    Task<(bool Success, string Message, AssociateTeamDTO? Team)> CreateAssociateTeamAsync(CreateAssociateTeamDTO dto);
    Task<(bool Success, string Message)> UpdateAssociateTeamAsync(int id, UpdateAssociateTeamDTO dto);
    Task<(bool Success, string Message)> DeleteAssociateTeamAsync(int id);
}
