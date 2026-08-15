using Dashboard.Application.DTOs;
using Dashboard.Application.Interfaces.Services;
using Dashboard.Domain.Enums;
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
    /// Get list of all ads.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var ads = await _adService.GetAllAdsAsync();
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
        {
            return NotFound(new { message = $"Ad with ID '{id}' not found." });
        }

        return Ok(ad);
    }

    /// <summary>
    /// Create a new ad.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateAdDTO dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var (success, message, ad) = await _adService.CreateAdAsync(dto);
        if (!success)
        {
            return BadRequest(new { message });
        }

        return CreatedAtAction(nameof(GetById), new { id = ad!.Id }, ad);
    }

    /// <summary>
    /// Update an existing ad's information.
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateAdDTO dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var (success, message) = await _adService.UpdateAdAsync(id, dto);
        if (!success)
        {
            return BadRequest(new { message });
        }

        return Ok(new { message });
    }

    /// <summary>
    /// Delete an ad by Ad ID.
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var (success, message) = await _adService.DeleteAdAsync(id);
        if (!success)
        {
            return BadRequest(new { message });
        }

        return Ok(new { message });
    }

    /// <summary>
    /// Get available ad status values.
    /// </summary>
    [HttpGet("statuses")]
    public IActionResult GetStatuses()
    {
        var statuses = Enum.GetNames(typeof(AdStatus));
        return Ok(statuses);
    }

    /// <summary>
    /// Get available media type values.
    /// </summary>
    [HttpGet("media-types")]
    public IActionResult GetMediaTypes()
    {
        var types = Enum.GetNames(typeof(MediaType));
        return Ok(types);
    }
}
