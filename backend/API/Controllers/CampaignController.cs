using Dashboard.Application.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;

namespace Dashboard.API.Controllers;

[Route("api/[controller]")]
[ApiController]
//[Authorize]
public class CampaignController : ControllerBase
{
    private readonly ICampaignService _campaignService;

    public CampaignController(ICampaignService campaignService)
    {
        _campaignService = campaignService;
    }

    /// <summary>
    /// Get campaign details by Campaign ID.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var campaign = await _campaignService.GetCampaignByIdAsync(id);
        if (campaign == null)
        {
            return NotFound(new { message = $"Campaign with ID '{id}' not found." });
        }

        return Ok(campaign);
    }

    /// <summary>
    /// Delete a campaign by Campaign ID.
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var (success, message) = await _campaignService.DeleteCampaignAsync(id);
        if (!success)
        {
            return BadRequest(new { message });
        }

        return Ok(new { message });
    }


    // under process
    /// <summary>
    /// Get all campaigns belonging to a specific client.
    /// </summary>
    /// <param name="clientId">The client ID.</param>
    [HttpGet("Clients/{clientId:int}")]
    public async Task<IActionResult> GetByClientOverview(int clientId, DateOnly startDate, DateOnly endDate)
    {
        if (clientId <= 0)
        {
            return BadRequest(new { message = "Client ID must be a positive integer." });
        }

        var campaigns = await _campaignService.GetCampaignsByClientIdAsync(clientId, startDate, endDate);
        if (campaigns == null)
        {
            return NotFound(new { message = $"Client with ID '{clientId}' not found." });
        }

        return Ok(campaigns);
    }

    /// <summary>
    /// Get campaigns belonging to a specific Client within a specific Platform.
    /// </summary>
    [HttpGet("Clients/{clientId:int}/{Platform:alpha}")]
    public async Task<IActionResult> GetByClientPlatform(int clientId, [FromQuery] int platformid, [FromQuery] DateOnly startDate, [FromQuery] DateOnly endDate)
    {
        if (clientId <= 0)
        {
            return BadRequest(new { message = "Client ID must be a positive integer." });
        }

        if (startDate > endDate)
        {
            return BadRequest(new { message = "startDate must not be greater than endDate." });
        }

        var campaigns = await _campaignService.GetCampaignsByPlatformAsync(clientId, platformid, startDate, endDate);
        if (campaigns == null)
        {
            return NotFound(new { message = $"Client or platform data for client ID '{clientId}' not found." });
        }

        return Ok(campaigns);
    }
}
