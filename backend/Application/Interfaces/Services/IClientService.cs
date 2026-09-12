using Dashboard.Application.DTOs;

namespace Dashboard.Application.Interfaces.Services;
public interface IClientService
{
    Task<IEnumerable<ClientDTO>> GetManagerClientasync(string userId);
    Task<IEnumerable<ClientDTO>> GetAssociateClientasync(string userId);
    Task<IEnumerable<ClientDTO>> GetAdminClientasync(string userId);
    Task<IEnumerable<ClientDTO>> GetAllClientsAsync();
    Task<ClientDTO?> GetClientByIdAsync(int id);
    Task<(bool Success, string Message, ClientDTO? Client)> CreateClientAsync(CreateClientDTO dto);
    Task<(bool Success, string Message)> UpdateClientAsync(int id, UpdateClientDTO dto);
    Task<(bool Success, string Message)> DeleteClientAsync(int id);
}
