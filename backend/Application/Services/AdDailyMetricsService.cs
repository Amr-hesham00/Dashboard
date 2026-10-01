using Dashboard.Application.DTOs;
using Dashboard.Application.Interfaces;
using Dashboard.Application.Interfaces.Services;
using Dashboard.Domain.Entities;

namespace Dashboard.Application.Services;

public class AdDailyMetricsService : IAdDailyMetricsService
{
    private readonly IUnitOfWork _unitOfWork;

    public AdDailyMetricsService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<AdDailyMetricsDTO>> GetAllAsync()
    {
        var metrics = await _unitOfWork.AdDailyMetrics.GetAll(new AdDailyMetrics());
        return metrics.OrderByDescending(x => x.Date).Select(MapToDTO);
    }

    public async Task<AdDailyMetricsDTO?> GetByIdAsync(int id)
    {
        var metric = await _unitOfWork.AdDailyMetrics.GetById(id);
        return metric == null ? null : MapToDTO(metric);
    }

    public async Task<IEnumerable<AdDailyMetricsDTO>> GetByAdIdAsync(int adId)
    {
        var metrics = await _unitOfWork.AdDailyMetrics.GetByAdIdAsync(adId);
        return metrics.Select(MapToDTO);
    }

    public async Task<IEnumerable<AdDailyMetricsDTO>> GetByAdIdAndDateRangeAsync(int adId, DateOnly startDate, DateOnly endDate)
    {
        var metrics = await _unitOfWork.AdDailyMetrics.GetByAdIdAndDateRangeAsync(adId, startDate, endDate);
        return metrics.Select(MapToDTO);
    }

    public async Task<(bool Success, string Message, AdDailyMetricsDTO? Metrics)> CreateOrUpdateAsync(CreateAdDailyMetricsDTO dto)
    {
        // 1. Verify parent Ad exists
        var ad = await _unitOfWork.Ad.GetById(dto.AdId);
        if (ad == null)
        {
            return (false, $"Ad with ID '{dto.AdId}' not found.", null);
        }

        // 2. Check if metrics for this (AdId, Date) already exist (UNIQUE constraint enforcement / Upsert)
        var existing = await _unitOfWork.AdDailyMetrics.GetByAdIdAndDateAsync(dto.AdId, dto.Date);
        if (existing != null)
        {
            existing.Impressions = dto.Impressions;
            existing.Clicks = dto.Clicks;
            existing.Conversions = dto.Conversions;
            existing.Spend = dto.Spend;
            existing.Revenue = dto.Revenue;

            _unitOfWork.AdDailyMetrics.Update(existing);
            await _unitOfWork.Complete();

            return (true, "Daily metrics updated successfully.", MapToDTO(existing));
        }

        // 3. Create new record
        var newMetric = new AdDailyMetrics
        {
            AdId = dto.AdId,
            Date = dto.Date,
            Impressions = dto.Impressions,
            Clicks = dto.Clicks,
            Conversions = dto.Conversions,
            Spend = dto.Spend,
            Revenue = dto.Revenue
        };

        await _unitOfWork.AdDailyMetrics.Create(newMetric);
        await _unitOfWork.Complete();

        return (true, "Daily metrics created successfully.", MapToDTO(newMetric));
    }

    public async Task<(bool Success, string Message)> UpdateAsync(int id, UpdateAdDailyMetricsDTO dto)
    {
        var existing = await _unitOfWork.AdDailyMetrics.GetById(id);
        if (existing == null)
        {
            return (false, $"Daily metrics with ID '{id}' not found.");
        }

        existing.Impressions = dto.Impressions;
        existing.Clicks = dto.Clicks;
        existing.Conversions = dto.Conversions;
        existing.Spend = dto.Spend;
        existing.Revenue = dto.Revenue;

        _unitOfWork.AdDailyMetrics.Update(existing);
        await _unitOfWork.Complete();

        return (true, "Daily metrics updated successfully.");
    }

    public async Task<(bool Success, string Message)> DeleteAsync(int id)
    {
        var existing = await _unitOfWork.AdDailyMetrics.GetById(id);
        if (existing == null)
        {
            return (false, $"Daily metrics with ID '{id}' not found.");
        }

        _unitOfWork.AdDailyMetrics.Delete(existing);
        await _unitOfWork.Complete();

        return (true, "Daily metrics deleted successfully.");
    }

    public async Task<(bool Success, string Message, int ProcessedCount)> BulkUpsertAsync(IEnumerable<CreateAdDailyMetricsDTO> dtos)
    {
        var dtoList = dtos?.ToList();
        if (dtoList == null || dtoList.Count == 0)
        {
            return (false, "No metrics provided.", 0);
        }

        int count = 0;
        foreach (var dto in dtoList)
        {
            var existing = await _unitOfWork.AdDailyMetrics.GetByAdIdAndDateAsync(dto.AdId, dto.Date);
            if (existing != null)
            {
                existing.Impressions = dto.Impressions;
                existing.Clicks = dto.Clicks;
                existing.Conversions = dto.Conversions;
                existing.Spend = dto.Spend;
                existing.Revenue = dto.Revenue;
                _unitOfWork.AdDailyMetrics.Update(existing);
            }
            else
            {
                var newMetric = new AdDailyMetrics
                {
                    AdId = dto.AdId,
                    Date = dto.Date,
                    Impressions = dto.Impressions,
                    Clicks = dto.Clicks,
                    Conversions = dto.Conversions,
                    Spend = dto.Spend,
                    Revenue = dto.Revenue
                };
                await _unitOfWork.AdDailyMetrics.Create(newMetric);
            }
            count++;
        }

        await _unitOfWork.Complete();
        return (true, $"Successfully processed {count} daily metric records.", count);
    }

    private static AdDailyMetricsDTO MapToDTO(AdDailyMetrics m)
    {
        return new AdDailyMetricsDTO
        {
            Id = m.Id,
            AdId = m.AdId,
            Date = m.Date,
            Impressions = m.Impressions,
            Clicks = m.Clicks,
            Conversions = m.Conversions,
            Spend = m.Spend,
            Revenue = m.Revenue
        };
    }
}
