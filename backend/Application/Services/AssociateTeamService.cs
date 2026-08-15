using Dashboard.Application.DTOs;
using Dashboard.Application.Interfaces;
using Dashboard.Application.Interfaces.Services;
using Dashboard.Domain.Entities;

namespace Dashboard.Application.Services;
public class AssociateTeamService : IAssociateTeamService
{
    private readonly IUnitOfWork _unitOfWork;

    public AssociateTeamService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<AssociateTeamDTO>> GetAllAssociateTeamsAsync()
    {
        var teams = await _unitOfWork.AssociateTeam.GetAll(new AssociateTeam());
        return teams.Select(MapToDTO);
    }

    public async Task<AssociateTeamDTO?> GetAssociateTeamByIdAsync(int id)
    {
        var team = await _unitOfWork.AssociateTeam.GetById(id);
        return team == null ? null : MapToDTO(team);
    }

    public async Task<(bool Success, string Message, AssociateTeamDTO? Team)> CreateAssociateTeamAsync(CreateAssociateTeamDTO dto)
    {
        var team = new AssociateTeam
        {
            Name = dto.Name,
            Description = dto.Description,
            Status = dto.Status,
            ManagerId = dto.ManagerId,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.AssociateTeam.Create(team);
        await _unitOfWork.Complete();

        return (true, "Associate team created successfully.", MapToDTO(team));
    }

    public async Task<(bool Success, string Message)> UpdateAssociateTeamAsync(int id, UpdateAssociateTeamDTO dto)
    {
        var team = await _unitOfWork.AssociateTeam.GetById(id);
        if (team == null)
        {
            return (false, "Associate team not found.");
        }

        team.Name = dto.Name;
        team.Description = dto.Description;
        team.Status = dto.Status;
        team.ManagerId = dto.ManagerId;

        _unitOfWork.AssociateTeam.Update(team);
        await _unitOfWork.Complete();

        return (true, "Associate team updated successfully.");
    }

    public async Task<(bool Success, string Message)> DeleteAssociateTeamAsync(int id)
    {
        var team = await _unitOfWork.AssociateTeam.GetById(id);
        if (team == null)
        {
            return (false, "Associate team not found.");
        }

        _unitOfWork.AssociateTeam.Delete(team);
        await _unitOfWork.Complete();

        return (true, "Associate team deleted successfully.");
    }

    private static AssociateTeamDTO MapToDTO(AssociateTeam team)
    {
        return new AssociateTeamDTO
        {
            Id = team.Id,
            Name = team.Name,
            Description = team.Description,
            CreatedAt = team.CreatedAt,
            Status = team.Status,
            ManagerId = team.ManagerId
        };
    }
}
