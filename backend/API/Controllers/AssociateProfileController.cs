using Dashboard.Application.DTOs;
using Dashboard.Application.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;

namespace Dashboard.API.Controllers;

[Route("api/[controller]")]
[ApiController]
//[Authorize]
public class AssociateProfileController : ControllerBase
{
    private readonly IAssociateProfileService _associateProfileService;

    public AssociateProfileController(IAssociateProfileService associateProfileService)
    {
        _associateProfileService = associateProfileService;
    }

    /// <summary>
    /// Get list of all associate profiles.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var profiles = await _associateProfileService.GetAllAssociateProfilesAsync();
        return Ok(profiles);
    }

    /// <summary>
    /// Get associate profile details by Profile ID.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var profile = await _associateProfileService.GetAssociateProfileByIdAsync(id);
        if (profile == null)
        {
            return NotFound(new { message = $"Associate profile with ID '{id}' not found." });
        }

        return Ok(profile);
    }

    /// <summary>
    /// Create a new associate profile.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateAssociateProfileDTO dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var (success, message, profile) = await _associateProfileService.CreateAssociateProfileAsync(dto);
        if (!success)
        {
            return BadRequest(new { message });
        }

        return CreatedAtAction(nameof(GetById), new { id = profile!.Id }, profile);
    }

    /// <summary>
    /// Update an existing associate profile's information.
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] UpdateAssociateProfileDTO dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var (success, message) = await _associateProfileService.UpdateAssociateProfileAsync(id, dto);
        if (!success)
        {
            return BadRequest(new { message });
        }

        return Ok(new { message });
    }

    /// <summary>
    /// Delete an associate profile by Profile ID.
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var (success, message) = await _associateProfileService.DeleteAssociateProfileAsync(id);
        if (!success)
        {
            return BadRequest(new { message });
        }

        return Ok(new { message });
    }


}
