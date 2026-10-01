using Dashboard.Application.DTOs;
using Dashboard.Application.Interfaces;
using Dashboard.Application.Interfaces.Services;
using Dashboard.Domain.Entities;

namespace Dashboard.Application.Services;

public class ClientTargetService : IClientTargetService
{
    private readonly IUnitOfWork _unitOfWork;

    public ClientTargetService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<ClientTargetDTO>> GetAllTargetsAsync()
    {
        var targets = await _unitOfWork.ClientTarget.GetAllWithClientAsync();
        return targets.Select(t => MapToDTO(t, null));
    }

    public async Task<ClientTargetDTO?> GetTargetByIdAsync(int id)
    {
        var target = await _unitOfWork.ClientTarget.GetById(id);
        if (target == null) return null;

        var client = await _unitOfWork.Client.GetById(target.ClientId);
        return MapToDTO(target, client?.CompanyName);
    }

    public async Task<ClientTargetDTO?> GetTargetByClientIdAsync(int clientId)
    {
        var target = await _unitOfWork.ClientTarget.GetByClientIdAsync(clientId);
        return target == null ? null : MapToDTO(target);
    }

    public async Task<(bool Success, string Message, ClientTargetDTO? Target)> CreateTargetAsync(CreateClientTargetDTO dto)
    {
        var client = await _unitOfWork.Client.GetById(dto.ClientId);
        if (client == null)
        {
            return (false, $"Client with ID '{dto.ClientId}' not found.", null);
        }

        var existing = await _unitOfWork.ClientTarget.GetByClientIdAsync(dto.ClientId);
        if (existing != null)
        {
            return (false, $"Targets already exist for client '{client.CompanyName}'. Use update or upsert instead.", null);
        }

        var target = new ClientTarget
        {
            ClientId = dto.ClientId,
            TargetROAS = dto.TargetROAS,
            TargetCPA = dto.TargetCPA,
            MonthlyBudget = dto.MonthlyBudget,
            TargetRevenue = dto.TargetRevenue,
            TargetConversions = dto.TargetConversions,
            TargetCTR = dto.TargetCTR,
            TargetCPC = dto.TargetCPC
        };

        await _unitOfWork.ClientTarget.Create(target);
        await _unitOfWork.Complete();

        return (true, "Client target created successfully.", MapToDTO(target, client.CompanyName));
    }

    public async Task<(bool Success, string Message)> UpdateTargetAsync(int id, UpdateClientTargetDTO dto)
    {
        var target = await _unitOfWork.ClientTarget.GetById(id);
        if (target == null)
        {
            return (false, $"Client target with ID '{id}' not found.");
        }

        target.TargetROAS = dto.TargetROAS;
        target.TargetCPA = dto.TargetCPA;
        target.MonthlyBudget = dto.MonthlyBudget;
        target.TargetRevenue = dto.TargetRevenue;
        target.TargetConversions = dto.TargetConversions;
        target.TargetCTR = dto.TargetCTR;
        target.TargetCPC = dto.TargetCPC;

        _unitOfWork.ClientTarget.Update(target);
        await _unitOfWork.Complete();

        return (true, "Client target updated successfully.");
    }

    public async Task<(bool Success, string Message, ClientTargetDTO? Target)> UpsertByClientIdAsync(int clientId, UpdateClientTargetDTO dto)
    {
        var client = await _unitOfWork.Client.GetById(clientId);
        if (client == null)
        {
            return (false, $"Client with ID '{clientId}' not found.", null);
        }

        var target = await _unitOfWork.ClientTarget.GetByClientIdAsync(clientId);
        if (target == null)
        {
            target = new ClientTarget
            {
                ClientId = clientId,
                TargetROAS = dto.TargetROAS,
                TargetCPA = dto.TargetCPA,
                MonthlyBudget = dto.MonthlyBudget,
                TargetRevenue = dto.TargetRevenue,
                TargetConversions = dto.TargetConversions,
                TargetCTR = dto.TargetCTR,
                TargetCPC = dto.TargetCPC
            };

            await _unitOfWork.ClientTarget.Create(target);
            await _unitOfWork.Complete();

            return (true, "Client target created successfully.", MapToDTO(target, client.CompanyName));
        }

        target.TargetROAS = dto.TargetROAS;
        target.TargetCPA = dto.TargetCPA;
        target.MonthlyBudget = dto.MonthlyBudget;
        target.TargetRevenue = dto.TargetRevenue;
        target.TargetConversions = dto.TargetConversions;
        target.TargetCTR = dto.TargetCTR;
        target.TargetCPC = dto.TargetCPC;

        _unitOfWork.ClientTarget.Update(target);
        await _unitOfWork.Complete();

        return (true, "Client target updated successfully.", MapToDTO(target, client.CompanyName));
    }

    public async Task<(bool Success, string Message)> DeleteTargetAsync(int id)
    {
        var target = await _unitOfWork.ClientTarget.GetById(id);
        if (target == null)
        {
            return (false, $"Client target with ID '{id}' not found.");
        }

        _unitOfWork.ClientTarget.Delete(target);
        await _unitOfWork.Complete();

        return (true, "Client target deleted successfully.");
    }

    private static ClientTargetDTO MapToDTO(ClientTarget target, string? clientName = null)
    {
        return new ClientTargetDTO
        {
            Id = target.Id,
            TargetROAS = target.TargetROAS,
            TargetCPA = target.TargetCPA,
            MonthlyBudget = target.MonthlyBudget,
            TargetRevenue = target.TargetRevenue,
            TargetConversions = target.TargetConversions,
            TargetCTR = target.TargetCTR,
            TargetCPC = target.TargetCPC
        };
    }
}
