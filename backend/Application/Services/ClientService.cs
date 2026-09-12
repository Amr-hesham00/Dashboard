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


    public async Task<IEnumerable<ClientDTO>> GetManagerClientasync(string userId)
    {
        var clients = await _unitOfWork.Client.GetClientsByUserAsync(userId, "Manager");
        return clients.Select(c => MapToDTO(c));
    }

    public async Task<IEnumerable<ClientDTO>> GetAssociateClientasync(string userId)
    {
        var clients = await _unitOfWork.Client.GetClientsByUserAsync(userId, "Associate");
        return clients.Select(c => MapToDTO(c));
    }

    public async Task<IEnumerable<ClientDTO>> GetAdminClientasync(string userId)
    {
        var clients = await _unitOfWork.Client.GetClientsByUserAsync(userId, "Admin");
        return clients.Select(c => MapToDTO(c));
    }
    public async Task<IEnumerable<ClientDTO>> GetAllClientsAsync()
    {
        var clients = await _unitOfWork.Client.GetAllWithDetailsAsync();
        return clients.Select(c => MapToDTO(c));
    }

    public async Task<ClientDTO?> GetClientByIdAsync(int id)
    {
        var client = await _unitOfWork.Client.GetByIdWithDetailsAsync(id);
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
            BusinessModel = dto.BusinessModel,
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
        client.BusinessModel = dto.BusinessModel;
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
        var campaigns = client.Platforms?
            .Where(p => p.Campaigns != null)
            .SelectMany(p => p.Campaigns)
            .ToList() ?? new List<Campaign>();

        decimal spend = (decimal)Math.Round(campaigns.Sum(c => c.Spend), 2);
        decimal revenue = (decimal)Math.Round(campaigns.Sum(c => c.Revenue), 2);
        int conversions = campaigns.Sum(c => c.Conversions);

        double targetRoas = (client.Target?.TargetROAS.HasValue == true && client.Target.TargetROAS.Value > 0)
            ? client.Target.TargetROAS.Value
            : 4.0;

        double actualRoas = spend > 0
            ? Math.Round((double)(revenue / spend), 2)
            : targetRoas;

        double achievedRoas = targetRoas > 0 // current ROAS percentage 
            ? Math.Round((actualRoas * 100.0) / targetRoas, 1)
            : 0;

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
            BusinessModel = client.BusinessModel,
            CreatedAt = client.CreatedAt,
            Notes = client.Notes,
            ManagerId = client.ManagerId,
            Target = client.Target == null ? null : new ClientTargetDTO
            {
                Id = client.Target.Id,
                ClientId = client.Target.ClientId,
                TargetROAS = client.Target.TargetROAS ?? 4.0,
                TargetCPA = client.Target.TargetCPA,
                MonthlyBudget = client.Target.MonthlyBudget,
                TargetRevenue = client.Target.TargetRevenue,
                TargetConversions = client.Target.TargetConversions,
                TargetCTR = client.Target.TargetCTR,
                TargetCPC = client.Target.TargetCPC
            },
            Platforms = client.Platforms == null ? new() : client.Platforms.Select(p => new PlatformDTO
            {
                Id = p.Id,
                PlatformType = p.PlatformType,
                Status = p.Status,
                CreatedAt = p.CreatedAt,
                ClientId = p.ClientId
            }).ToList(),
            Spend = spend,
            Revenue = revenue,
            Conversions = conversions,
            AchievedROAS = achievedRoas,
            ActualROAS = actualRoas,
            TargetROAS = targetRoas
        };
    }


}
