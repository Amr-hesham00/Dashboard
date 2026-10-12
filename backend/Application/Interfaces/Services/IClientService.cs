using Dashboard.Application.DTOs;

namespace Dashboard.Application.Interfaces.Services;
public interface IClientService
{
    Task<ManagerClientsDTO> GetManagerClientasync(string userId);
    Task<AssociateClientsDTO> GetAssociateClientasync(string userId);
    Task<AdminClientsDTO> GetAdminClientasync(string userId);
    Task<List<ClientDTO>> GetAllClientsAsync();
    Task<ClientDTO?> GetClientByIdAsync(int id);
    Task<(bool Success, string Message, CreateClientDTO? Client)> CreateClientAsync(CreateClientDTO dto);
    Task<(bool Success, string Message)> UpdateClientAsync(int id, UpdateClientDTO dto);
    Task<(bool Success, string Message)> DeleteClientAsync(int id);
}
