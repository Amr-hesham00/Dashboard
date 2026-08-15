using Dashboard.Application.DTOs;
using Dashboard.Application.Interfaces.Services;
using Dashboard.Domain.Enums;
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
    /// Get list of all ad sets.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var adSets = await _adSetService.GetAllAdSetsAsync();
        return Ok(adSets);
    }

    /// <summary>
    /// Get ad set details by AdSet ID.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var adSet = await _adSetService.GetAdSetByIdAsync(id);
        if (adSet == null)
        {
            return NotFound(new { message = $"AdSet with ID '{id}' not found." });
        }

        return Ok(adSet);
    }

    /// <summary>
    /// Create a new ad set.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateAdSetDTO dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var (success, message, adSet) = await _adSetService.CreateAdSetAsync(dto);
        if (!success)
        {
            return BadRequest(new { message });
        }

        return CreatedAtAction(nameof(GetById), new { id = adSet!.Id }, adSet);
    }

    /// <summary>
    /// Update an existing ad set's information.
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateAdSetDTO dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var (success, message) = await _adSetService.UpdateAdSetAsync(id, dto);
        if (!success)
        {
            return BadRequest(new { message });
        }

        return Ok(new { message });
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

    /// <summary>
    /// Get available ad set status values.
    /// </summary>
    [HttpGet("statuses")]
    public IActionResult GetStatuses()
    {
        var statuses = Enum.GetNames(typeof(AdSetStatus));
        return Ok(statuses);
    }

    /// <summary>
    /// Get available ad set gender values.
    /// </summary>
    [HttpGet("genders")]
    public IActionResult GetGenders()
    {
        var genders = Enum.GetNames(typeof(AdSetGender));
        return Ok(genders);
    }
}
