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

    //done
    /// <summary>
    /// Get campaigns belonging to a specific Client within a specific Platform.
    /// </summary>
    [HttpGet("Clients/{clientId:int}/{platformid:int}")]
    public async Task<IActionResult> GetByClientPlatform([FromRoute] int clientId, [FromRoute] int platformid, [FromQuery] DateOnly startDate, [FromQuery] DateOnly endDate)
    {
        if (clientId <= 0)
            return BadRequest(new { message = "Client ID must be a positive integer." });


        if (startDate == default && endDate == default)
        {
            endDate = DateOnly.FromDateTime(DateTime.UtcNow);
            startDate = endDate.AddDays(-30);
        }
        else if (startDate > endDate)
        {
            return BadRequest(new { message = "startDate must not be greater than endDate." });
        }

        var campaigns = await _campaignService.GetCampaignsByPlatformAsync(clientId, platformid, startDate, endDate);

        if (campaigns == null)
            return NotFound(new { message = $"Client or platform data for client ID '{clientId}' not found." });

        return Ok(campaigns);
    }

    /// <summary>
    /// Get all campaigns belonging to a specific client (overview tab).
    /// All monetary values are converted to the client's reporting currency.
    /// </summary>
    /// <param name="clientId">The client ID.</param>
    [HttpGet("Clients/{clientId:int}")]
    public async Task<IActionResult> GetByClientOverview(int clientId, [FromQuery] DateOnly startDate, [FromQuery] DateOnly endDate)
    {
        if (clientId <= 0)
            return BadRequest(new { message = "Client ID must be a positive integer." });

        if (startDate == default && endDate == default)
        {
            endDate = DateOnly.FromDateTime(DateTime.UtcNow);
            startDate = endDate.AddDays(-30);
        }
        else if (startDate > endDate)
        {
            return BadRequest(new { message = "startDate must not be greater than endDate." });
        }

        var overview = await _campaignService.GetForOverviewAsync(clientId, startDate, endDate);

        if (overview == null)
            return NotFound(new { message = $"Client with ID '{clientId}' not found." });


        return Ok(overview);
    }

}
