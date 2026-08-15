using Dashboard.Application.DTOs;
using Dashboard.Application.Interfaces;
using Dashboard.Application.Interfaces.Services;
using Dashboard.Domain.Entities;

namespace Dashboard.Application.Services;
public class ClientService : IClientService
{
    private readonly IUnitOfWork _unitOfWork;

    public ClientService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<ClientDTO>> GetAllClientsAsync()
    {
        var clients = await _unitOfWork.Client.GetAll(new Client());
        return clients.Select(MapToDTO);
    }

    public async Task<ClientDTO?> GetClientByIdAsync(int id)
    {
        var client = await _unitOfWork.Client.GetById(id);
        return client == null ? null : MapToDTO(client);
    }

    public async Task<(bool Success, string Message, ClientDTO? Client)> CreateClientAsync(CreateClientDTO dto)
    {
        var client = new Client
        {
            CompanyName = dto.CompanyName,
            Logo = dto.Logo,
            Website = dto.Website,
            Email = dto.Email,
            Phone = dto.Phone,
            Country = dto.Country,
            Currency = dto.Currency,
            Status = dto.Status,
            Notes = dto.Notes,
            ManagerId = dto.ManagerId,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Client.Create(client);
        await _unitOfWork.Complete();

        return (true, "Client created successfully.", MapToDTO(client));
    }

    public async Task<(bool Success, string Message)> UpdateClientAsync(int id, UpdateClientDTO dto)
    {
        var client = await _unitOfWork.Client.GetById(id);
        if (client == null)
        {
            return (false, "Client not found.");
        }

        client.CompanyName = dto.CompanyName;
        client.Logo = dto.Logo;
        client.Website = dto.Website;
        client.Email = dto.Email;
        client.Phone = dto.Phone;
        client.Country = dto.Country;
        client.Currency = dto.Currency;
        client.Status = dto.Status;
        client.Notes = dto.Notes;
        client.ManagerId = dto.ManagerId;

        _unitOfWork.Client.Update(client);
        await _unitOfWork.Complete();

        return (true, "Client updated successfully.");
    }

    public async Task<(bool Success, string Message)> DeleteClientAsync(int id)
    {
        var client = await _unitOfWork.Client.GetById(id);
        if (client == null)
        {
            return (false, "Client not found.");
        }

        _unitOfWork.Client.Delete(client);
        await _unitOfWork.Complete();

        return (true, "Client deleted successfully.");
    }

    private static ClientDTO MapToDTO(Client client)
    {
        return new ClientDTO
        {
            Id = client.Id,
            CompanyName = client.CompanyName,
            Logo = client.Logo,
            Website = client.Website,
            Email = client.Email,
            Phone = client.Phone,
            Country = client.Country,
            Currency = client.Currency,
            Status = client.Status,
            CreatedAt = client.CreatedAt,
            Notes = client.Notes,
            ManagerId = client.ManagerId
        };
    }
}
