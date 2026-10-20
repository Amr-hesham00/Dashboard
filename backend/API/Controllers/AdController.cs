using Dashboard.Application.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;

namespace Dashboard.API.Controllers;

[Route("api/[controller]")]
[ApiController]
//[Authorize]
public class AdController : ControllerBase
{
    private readonly IAdService _adService;

    public AdController(IAdService adService)
    {
        _adService = adService;
    }

    /// <summary>
    /// Get all ads belonging to a specific client.
    /// </summary>
    [HttpGet("Clients/{clientId:int}")]
    public async Task<IActionResult> GetByClient(int clientId)
    {
        if (clientId <= 0)
        {
            return BadRequest(new { message = "Client ID must be a positive integer." });
        }

        var ads = await _adService.GetByClientIdAsync(clientId);
        if (ads == null)
        {
            return NotFound(new { message = $"Client with ID '{clientId}' not found." });
        }

        return Ok(ads);
    }


    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var ad = await _adService.GetAdByIdAsync(id);

        if (ad == null)
            return NotFound(new { message = $"Ad with ID '{id}' not found." });

        return Ok(ad);
    }


    [HttpGet("AdSets/{adSetId:int}")]
    [HttpGet("adset/{adSetId:int}")]
    public async Task<IActionResult> GetByAdSet(int adSetId, [FromQuery] DateOnly start, [FromQuery] DateOnly end)
    {
        if (adSetId <= 0)
        {
            return BadRequest(new { message = "AdSet ID must be a positive integer." });
        }

        if (start == default && end == default)
        {
            end = DateOnly.FromDateTime(DateTime.UtcNow);
            start = end.AddDays(-30);
        }
        else if (end < start)
        {
            return BadRequest(new { message = "End date must be on or after start date." });
        }

        var ads = await _adService.GetByAdSetIdAsync(adSetId, start, end);
        if (ads == null)
        {
            return NotFound(new { message = $"AdSet with ID '{adSetId}' not found." });
        }
        return Ok(ads);
    }


}
