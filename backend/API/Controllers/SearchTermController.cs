using Dashboard.Application.DTOs;
using Dashboard.Application.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;

namespace Dashboard.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class SearchTermController : ControllerBase
{
    private readonly ISearchTermService _searchTermService;

    public SearchTermController(ISearchTermService searchTermService)
    {
        _searchTermService = searchTermService;
    }

    /// <summary>
    /// Get aggregated Google Search Terms for a specific Ad Set within a date range.
    /// </summary>
    [HttpGet("AdSet/{adSetId:int}")]
    public async Task<IActionResult> GetByAdSet(int adSetId, [FromQuery] DateOnly startDate, [FromQuery] DateOnly endDate)
    {
        if (adSetId <= 0)
        {
            return BadRequest(new { message = "AdSet ID must be a positive integer." });
        }

        if (startDate == default && endDate == default)
        {
            endDate = DateOnly.FromDateTime(DateTime.UtcNow);
            startDate = endDate.AddDays(-30);
        }
        else if (startDate > endDate)
        {
            return BadRequest(new { message = "startDate must not be greater than endDate." });
        }

        var results = await _searchTermService.GetSearchTermsByAdSetIdAsync(adSetId, startDate, endDate);
        if (results == null)
        {
            return NotFound(new { message = $"AdSet with ID '{adSetId}' not found." });
        }

        return Ok(results);
    }

    /// <summary>
    /// Get aggregated Google Search Terms for a specific Campaign within a date range.
    /// </summary>
    [HttpGet("Campaign/{campaignId:int}")]
    public async Task<IActionResult> GetByCampaign(int campaignId, [FromQuery] DateOnly startDate, [FromQuery] DateOnly endDate)
    {
        if (campaignId <= 0)
        {
            return BadRequest(new { message = "Campaign ID must be a positive integer." });
        }

        if (startDate > endDate)
        {
            return BadRequest(new { message = "startDate must not be greater than endDate." });
        }

        var results = await _searchTermService.GetSearchTermsByCampaignIdAsync(campaignId, startDate, endDate);
        if (results == null)
        {
            return NotFound(new { message = $"Google Campaign with ID '{campaignId}' not found." });
        }

        return Ok(results);
    }

    /// <summary>
    /// Create a search term record.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateSearchTermDTO dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var (success, message, result) = await _searchTermService.CreateAsync(dto);
        if (!success)
        {
            return BadRequest(new { message });
        }

        return Ok(result);
    }
}
