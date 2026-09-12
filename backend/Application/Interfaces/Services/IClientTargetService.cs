using Dashboard.Application.DTOs;

namespace Dashboard.Application.Interfaces.Services;

public interface IClientTargetService
{
    Task<IEnumerable<ClientTargetDTO>> GetAllTargetsAsync();
    Task<ClientTargetDTO?> GetTargetByIdAsync(int id);
    Task<ClientTargetDTO?> GetTargetByClientIdAsync(int clientId);
    Task<(bool Success, string Message, ClientTargetDTO? Target)> CreateTargetAsync(CreateClientTargetDTO dto);
    Task<(bool Success, string Message)> UpdateTargetAsync(int id, UpdateClientTargetDTO dto);
    Task<(bool Success, string Message, ClientTargetDTO? Target)> UpsertByClientIdAsync(int clientId, UpdateClientTargetDTO dto);
    Task<(bool Success, string Message)> DeleteTargetAsync(int id);
}
