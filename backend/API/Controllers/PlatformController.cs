using Dashboard.Application.DTOs;
using Dashboard.Application.Interfaces.Services;
using Dashboard.Domain.Enums;
using Microsoft.AspNetCore.Mvc;

namespace Dashboard.API.Controllers;

[Route("api/[controller]")]
[ApiController]
//[Authorize]
public class PlatformController : ControllerBase
{
    private readonly IPlatformService _platformService;
    private readonly IGoogleAdsService? _googleAdsService;

    public PlatformController(
        IPlatformService platformService,
        IGoogleAdsService? googleAdsService = null)
    {
        _platformService = platformService;
        _googleAdsService = googleAdsService;
    }

    /// <summary>
    /// Refresh Platform: Synchronizes only the specified Google Ads platform for its Dashboard client.
    /// </summary>
    [HttpPost("{id:int}/refresh")]
    public async Task<IActionResult> RefreshPlatform(
        int id,
        [FromQuery] int? clientId,
        CancellationToken cancellationToken = default)
    {
        if (_googleAdsService is null)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new { message = "Synchronization service is not available." });
        }

        var result = await _googleAdsService.SynchronizePlatformAsync(clientId ?? 0, id, cancellationToken);
        if (!result.Success)
        {
            return result.ErrorCode switch
            {
                GoogleOAuthErrorCodes.PlatformNotFound => NotFound(result),
                GoogleOAuthErrorCodes.UnauthorizedClient => StatusCode(StatusCodes.Status403Forbidden, result),
                GoogleOAuthErrorCodes.SyncAlreadyInProgress => Conflict(result),
                _ => BadRequest(result)
            };
        }

        return Ok(result);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var platforms = await _platformService.GetAllPlatformsAsync();
        return Ok(platforms);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var platform = await _platformService.GetPlatformByIdAsync(id);
        if (platform == null)
        {
            return NotFound(new { message = $"Platform with ID '{id}' not found." });
        }

        return Ok(platform);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePlatformDTO dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var (success, message, platform) = await _platformService.CreatePlatformAsync(dto);
        if (!success)
        {
            return BadRequest(new { message });
        }

        return CreatedAtAction(nameof(GetById), new { id = platform!.Id }, platform);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdatePlatformDTO dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var (success, message) = await _platformService.UpdatePlatformAsync(id, dto);
        if (!success)
        {
            return BadRequest(new { message });
        }

        return Ok(new { message });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var (success, message) = await _platformService.DeletePlatformAsync(id);
        if (!success)
        {
            return BadRequest(new { message });
        }

        return Ok(new { message });
    }


    [HttpGet("types")]
    public IActionResult GetTypes()
    {
        var types = Enum.GetNames(typeof(PlatformType));
        return Ok(types);
    }

    [HttpGet("statuses")]
    public IActionResult GetStatuses()
    {
        var statuses = Enum.GetNames(typeof(PlatformStatus));
        return Ok(statuses);
    }

    [HttpGet("currencies")]
    public IActionResult GetCurrencies()
    {
        var currencies = Enum.GetNames(typeof(Currency));
        return Ok(currencies);
    }
}
