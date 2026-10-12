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
    /// <param name="clientId">The client ID.</param>
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

    /// <summary>
    /// Get ad details by Ad ID.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var ad = await _adService.GetAdByIdAsync(id);

        if (ad == null)
            return NotFound(new { message = $"Ad with ID '{id}' not found." });

        return Ok(ad);
    }


    // under process
    /// <summary>
    /// Get all ads belonging to a specific ad set.
    /// </summary>
    /// <param name="adSetId">The ad set ID.</param>
    [HttpGet("AdSets/{adSetId:int}")]
    public async Task<IActionResult> GetByAdSet(int adSetId, DateOnly start, DateOnly end)
    {
        if (end < start)
            throw new ArgumentException(
                "End date must be on or after start date.",
                nameof(end));

        if (adSetId <= 0)
        {
            return BadRequest(new { message = "AdSet ID must be a positive integer." });
        }

        var ads = await _adService.GetByAdSetIdAsync(adSetId, start, end);
        if (ads == null)
        {
            return NotFound(new { message = $"AdSet with ID '{adSetId}' not found." });
        }
        return Ok(ads);
    }


}
