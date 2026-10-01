using Dashboard.Application.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;

namespace Dashboard.API.Controllers;

[Route("api/[controller]")]
[ApiController]
//[Authorize]
public class AdSetController : ControllerBase
{
    private readonly IAdSetService _adSetService;

    public AdSetController(IAdSetService adSetService)
    {
        _adSetService = adSetService;
    }

    /// <summary>
    /// Get all ad sets belonging to a specific campaign.
    /// </summary>
    /// <param name="campId">The campaign ID.</param>
    [HttpGet("Campaigns/{campId:int}")]

    public async Task<IActionResult> GetByClient(int clientId)
    {
        if (clientId <= 0)
        {
            return BadRequest(new { message = "Client ID must be a positive integer." });
        }

        var adSets = await _adSetService.GetAdSetsByClientIdAsync(clientId);
        if (adSets == null)
        {
            return NotFound(new { message = $"Client with ID '{clientId}' not found." });
        }

        return Ok(adSets);
    }

    /// <summary>
    /// Get ad set details by AdSet ID.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var adSet = await _adSetService.GetByIdAsync(id);
        if (adSet == null)
        {
            return NotFound(new { message = $"AdSet with ID '{id}' not found." });
        }

        return Ok(adSet);
    }

    /// <summary>
    /// Delete an ad set by AdSet ID.
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var (success, message) = await _adSetService.DeleteAdSetAsync(id);
        if (!success)
        {
            return BadRequest(new { message });
        }

        return Ok(new { message });
    }

    // done
    /// <summary>
    /// Get all ad sets belonging to a specific client.
    /// </summary>
    /// <param name="clientId">The client ID.</param>
    [HttpGet("Clients/{clientId:int}")]
    public async Task<IActionResult> GetByCampaign(int campId, DateOnly startDate, DateOnly endDate)
    {
        if (campId <= 0)
        {
            return BadRequest(new { message = "Campaign ID must be a positive integer." });
        }

        var adSets = await _adSetService.GetByCampaignIdAsync(campId, startDate, endDate);
        if (adSets == null)
        {
            return NotFound(new { message = $"Campaign with ID '{campId}' not found." });
        }

        return Ok(adSets);
    }
}
