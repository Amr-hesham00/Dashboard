using Dashboard.Application.DTOs;
using Dashboard.Application.Interfaces;
using Dashboard.Application.Interfaces.Services;
using Dashboard.Domain.Entities;

namespace Dashboard.Application.Services;
public class CampaignService : ICampaignService
{
    private readonly IUnitOfWork _unitOfWork;

    public CampaignService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<CampaignDTO>> GetAllCampaignsAsync()
    {
        var campaigns = await _unitOfWork.Campaign.GetAll(new Campaign());
        return campaigns.Select(MapToDTO);
    }

    public async Task<CampaignDTO?> GetCampaignByIdAsync(int id)
    {
        var campaign = await _unitOfWork.Campaign.GetById(id);
        return campaign == null ? null : MapToDTO(campaign);
    }

    public async Task<(bool Success, string Message, CampaignDTO? Campaign)> CreateCampaignAsync(CreateCampaignDTO dto)
    {
        var campaign = new Campaign
        {
            Name = dto.Name,
            Objective = dto.Objective,
            Status = dto.Status,
            Spend = dto.Spend,
            Revenue = dto.Revenue,
            ROAS = dto.ROAS,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            PlatformId = dto.PlatformId,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Campaign.Create(campaign);
        await _unitOfWork.Complete();

        return (true, "Campaign created successfully.", MapToDTO(campaign));
    }

    public async Task<(bool Success, string Message)> UpdateCampaignAsync(int id, UpdateCampaignDTO dto)
    {
        var campaign = await _unitOfWork.Campaign.GetById(id);
        if (campaign == null)
        {
            return (false, "Campaign not found.");
        }

        campaign.Name = dto.Name;
        campaign.Objective = dto.Objective;
        campaign.Status = dto.Status;
        campaign.Spend = dto.Spend;
        campaign.Revenue = dto.Revenue;
        campaign.ROAS = dto.ROAS;
        campaign.StartDate = dto.StartDate;
        campaign.EndDate = dto.EndDate;
        campaign.PlatformId = dto.PlatformId;

        _unitOfWork.Campaign.Update(campaign);
        await _unitOfWork.Complete();

        return (true, "Campaign updated successfully.");
    }

    public async Task<(bool Success, string Message)> DeleteCampaignAsync(int id)
    {
        var campaign = await _unitOfWork.Campaign.GetById(id);
        if (campaign == null)
        {
            return (false, "Campaign not found.");
        }

        _unitOfWork.Campaign.Delete(campaign);
        await _unitOfWork.Complete();

        return (true, "Campaign deleted successfully.");
    }

    private static CampaignDTO MapToDTO(Campaign campaign)
    {
        return new CampaignDTO
        {
            Id = campaign.Id,
            Name = campaign.Name,
            Objective = campaign.Objective,
            Status = campaign.Status,
            Spend = campaign.Spend,
            Revenue = campaign.Revenue,
            ROAS = campaign.ROAS,
            StartDate = campaign.StartDate,
            EndDate = campaign.EndDate,
            CreatedAt = campaign.CreatedAt,
            PlatformId = campaign.PlatformId
        };
    }
}
