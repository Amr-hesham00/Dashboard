using Dashboard.Application.DTOs;
using Dashboard.Application.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;

namespace Dashboard.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AdDailyMetricsController : ControllerBase
{
    private readonly IAdDailyMetricsService _metricsService;

    public AdDailyMetricsController(IAdDailyMetricsService metricsService)
    {
        _metricsService = metricsService;
    }

    /// <summary>
    /// Get all daily metrics.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var metrics = await _metricsService.GetAllAsync();
        return Ok(metrics);
    }

    /// <summary>
    /// Get daily metric record by ID.
    /// </summary>
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        if (id <= 0)
        {
            return BadRequest(new { message = "ID must be a positive integer." });
        }

        var metric = await _metricsService.GetByIdAsync(id);
        if (metric == null)
        {
            return NotFound(new { message = $"Daily metric with ID '{id}' not found." });
        }

        return Ok(metric);
    }

    /// <summary>
    /// Get all daily metrics for a specific ad.
    /// </summary>
    [HttpGet("Ad/{adId:int}")]
    public async Task<IActionResult> GetByAdId(int adId)
    {
        if (adId <= 0)
        {
            return BadRequest(new { message = "Ad ID must be a positive integer." });
        }

        var metrics = await _metricsService.GetByAdIdAsync(adId);
        return Ok(metrics);
    }

    /// <summary>
    /// Get daily metrics for an ad within a date range (inclusive).
    /// </summary>
    [HttpGet("Ad/{adId:int}/range")]
    public async Task<IActionResult> GetByAdIdAndDateRange(int adId, [FromQuery] DateOnly startDate, [FromQuery] DateOnly endDate)
    {
        if (adId <= 0)
        {
            return BadRequest(new { message = "Ad ID must be a positive integer." });
        }

        if (startDate > endDate)
        {
            return BadRequest(new { message = "startDate must not be greater than endDate." });
        }

        var metrics = await _metricsService.GetByAdIdAndDateRangeAsync(adId, startDate, endDate);
        return Ok(metrics);
    }

    /// <summary>
    /// Create or update daily metrics for an ad on a specific date (enforcing UNIQUE(AdId, Date)).
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateOrUpdate([FromBody] CreateAdDailyMetricsDTO dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var (success, message, result) = await _metricsService.CreateOrUpdateAsync(dto);
        if (!success)
        {
            return BadRequest(new { message });
        }

        return Ok(result);
    }

    /// <summary>
    /// Bulk create or update daily metrics.
    /// </summary>
    [HttpPost("bulk")]
    public async Task<IActionResult> BulkUpsert([FromBody] IEnumerable<CreateAdDailyMetricsDTO> dtos)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var (success, message, count) = await _metricsService.BulkUpsertAsync(dtos);
        if (!success)
        {
            return BadRequest(new { message });
        }

        return Ok(new { message, processedCount = count });
    }

    /// <summary>
    /// Update an existing daily metric record by ID.
    /// </summary>
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateAdDailyMetricsDTO dto)
    {
        if (id <= 0)
        {
            return BadRequest(new { message = "ID must be a positive integer." });
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var (success, message) = await _metricsService.UpdateAsync(id, dto);
        if (!success)
        {
            return BadRequest(new { message });
        }

        return Ok(new { message });
    }

    /// <summary>
    /// Delete a daily metric record by ID.
    /// </summary>
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        if (id <= 0)
        {
            return BadRequest(new { message = "ID must be a positive integer." });
        }

        var (success, message) = await _metricsService.DeleteAsync(id);
        if (!success)
        {
            return BadRequest(new { message });
        }

        return Ok(new { message });
    }
}
