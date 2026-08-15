using Dashboard.Application.DTOs;
using Dashboard.Application.Interfaces;
using Dashboard.Application.Interfaces.Services;
using Dashboard.Domain.Entities;

namespace Dashboard.Application.Services;
public class AdSetService : IAdSetService
{
    private readonly IUnitOfWork _unitOfWork;

    public AdSetService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<AdSetDTO>> GetAllAdSetsAsync()
    {
        var adSets = await _unitOfWork.AdSet.GetAll(new AdSet());
        return adSets.Select(MapToDTO);
    }

    public async Task<AdSetDTO?> GetAdSetByIdAsync(int id)
    {
        var adSet = await _unitOfWork.AdSet.GetById(id);
        return adSet == null ? null : MapToDTO(adSet);
    }

    public async Task<(bool Success, string Message, AdSetDTO? AdSet)> CreateAdSetAsync(CreateAdSetDTO dto)
    {
        var adSet = new AdSet
        {
            Name = dto.Name,
            AudienceType = dto.AudienceType,
            AgeRange = dto.AgeRange,
            Gender = dto.Gender,
            Location = dto.Location,
            Status = dto.Status,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            CampaignId = dto.CampaignId,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.AdSet.Create(adSet);
        await _unitOfWork.Complete();

        return (true, "Ad set created successfully.", MapToDTO(adSet));
    }

    public async Task<(bool Success, string Message)> UpdateAdSetAsync(int id, UpdateAdSetDTO dto)
    {
        var adSet = await _unitOfWork.AdSet.GetById(id);
        if (adSet == null)
        {
            return (false, "Ad set not found.");
        }

        adSet.Name = dto.Name;
        adSet.AudienceType = dto.AudienceType;
        adSet.AgeRange = dto.AgeRange;
        adSet.Gender = dto.Gender;
        adSet.Location = dto.Location;
        adSet.Status = dto.Status;
        adSet.StartDate = dto.StartDate;
        adSet.EndDate = dto.EndDate;
        adSet.CampaignId = dto.CampaignId;

        _unitOfWork.AdSet.Update(adSet);
        await _unitOfWork.Complete();

        return (true, "Ad set updated successfully.");
    }

    public async Task<(bool Success, string Message)> DeleteAdSetAsync(int id)
    {
        var adSet = await _unitOfWork.AdSet.GetById(id);
        if (adSet == null)
        {
            return (false, "Ad set not found.");
        }

        _unitOfWork.AdSet.Delete(adSet);
        await _unitOfWork.Complete();

        return (true, "Ad set deleted successfully.");
    }

    private static AdSetDTO MapToDTO(AdSet adSet)
    {
        return new AdSetDTO
        {
            Id = adSet.Id,
            Name = adSet.Name,
            AudienceType = adSet.AudienceType,
            AgeRange = adSet.AgeRange,
            Gender = adSet.Gender,
            Location = adSet.Location,
            Status = adSet.Status,
            CreatedAt = adSet.CreatedAt,
            StartDate = adSet.StartDate,
            EndDate = adSet.EndDate,
            CampaignId = adSet.CampaignId
        };
    }
}
