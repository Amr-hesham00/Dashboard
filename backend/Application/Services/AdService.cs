using Dashboard.Application.DTOs;
using Dashboard.Application.Interfaces;
using Dashboard.Application.Interfaces.Services;
using Dashboard.Domain.Entities;

namespace Dashboard.Application.Services;
public class AdService : IAdService
{
    private readonly IUnitOfWork _unitOfWork;

    public AdService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<AdDTO>> GetAllAdsAsync()
    {
        var ads = await _unitOfWork.Ad.GetAll(new Ad());
        return ads.Select(MapToDTO);
    }

    public async Task<AdDTO?> GetAdByIdAsync(int id)
    {
        var ad = await _unitOfWork.Ad.GetById(id);
        return ad == null ? null : MapToDTO(ad);
    }

    public async Task<(bool Success, string Message, AdDTO? Ad)> CreateAdAsync(CreateAdDTO dto)
    {
        var ad = new Ad
        {
            Name = dto.Name,
            Headline = dto.Headline,
            Description = dto.Description,
            CTA = dto.CTA,
            MediaURL = dto.MediaURL,
            MediaType = dto.MediaType,
            Status = dto.Status,
            Impressions = dto.Impressions,
            Clicks = dto.Clicks,
            CTR = dto.CTR,
            CPC = dto.CPC,
            Conversions = dto.Conversions,
            Spend = dto.Spend,
            Revenue = dto.Revenue,
            ROAS = dto.ROAS,
            AdSetId = dto.AdSetId,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Ad.Create(ad);
        await _unitOfWork.Complete();

        return (true, "Ad created successfully.", MapToDTO(ad));
    }

    public async Task<(bool Success, string Message)> UpdateAdAsync(int id, UpdateAdDTO dto)
    {
        var ad = await _unitOfWork.Ad.GetById(id);
        if (ad == null)
        {
            return (false, "Ad not found.");
        }

        ad.Name = dto.Name;
        ad.Headline = dto.Headline;
        ad.Description = dto.Description;
        ad.CTA = dto.CTA;
        ad.MediaURL = dto.MediaURL;
        ad.MediaType = dto.MediaType;
        ad.Status = dto.Status;
        ad.Impressions = dto.Impressions;
        ad.Clicks = dto.Clicks;
        ad.CTR = dto.CTR;
        ad.CPC = dto.CPC;
        ad.Conversions = dto.Conversions;
        ad.Spend = dto.Spend;
        ad.Revenue = dto.Revenue;
        ad.ROAS = dto.ROAS;
        ad.AdSetId = dto.AdSetId;

        _unitOfWork.Ad.Update(ad);
        await _unitOfWork.Complete();

        return (true, "Ad updated successfully.");
    }

    public async Task<(bool Success, string Message)> DeleteAdAsync(int id)
    {
        var ad = await _unitOfWork.Ad.GetById(id);
        if (ad == null)
        {
            return (false, "Ad not found.");
        }

        _unitOfWork.Ad.Delete(ad);
        await _unitOfWork.Complete();

        return (true, "Ad deleted successfully.");
    }

    private static AdDTO MapToDTO(Ad ad)
    {
        return new AdDTO
        {
            Id = ad.Id,
            Name = ad.Name,
            Headline = ad.Headline,
            Description = ad.Description,
            CTA = ad.CTA,
            MediaURL = ad.MediaURL,
            MediaType = ad.MediaType,
            Status = ad.Status,
            Impressions = ad.Impressions,
            Clicks = ad.Clicks,
            CTR = ad.CTR,
            CPC = ad.CPC,
            Conversions = ad.Conversions,
            Spend = ad.Spend,
            Revenue = ad.Revenue,
            ROAS = ad.ROAS,
            CreatedAt = ad.CreatedAt,
            AdSetId = ad.AdSetId
        };
    }
}
