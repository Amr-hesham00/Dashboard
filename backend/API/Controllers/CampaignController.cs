using Dashboard.Application.DTOs;
using Dashboard.Application.Interfaces.Services;
using Dashboard.Domain.Enums;
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
    /// Get list of all campaigns.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var campaigns = await _campaignService.GetAllCampaignsAsync();
        return Ok(campaigns);
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
    /// Create a new campaign.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCampaignDTO dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var (success, message, campaign) = await _campaignService.CreateCampaignAsync(dto);
        if (!success)
        {
            return BadRequest(new { message });
        }

        return CreatedAtAction(nameof(GetById), new { id = campaign!.Id }, campaign);
    }

    /// <summary>
    /// Update an existing campaign's information.
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateCampaignDTO dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var (success, message) = await _campaignService.UpdateCampaignAsync(id, dto);
        if (!success)
        {
            return BadRequest(new { message });
        }

        return Ok(new { message });
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

    /// <summary>
    /// Get available campaign status values.
    /// </summary>
    [HttpGet("statuses")]
    public IActionResult GetStatuses()
    {
        var statuses = Enum.GetNames(typeof(CampaignStatus));
        return Ok(statuses);
    }

    /// <summary>
    /// Get available campaign objective values.
    /// </summary>
    [HttpGet("objectives")]
    public IActionResult GetObjectives()
    {
        var objectives = Enum.GetNames(typeof(CampaignObjective));
        return Ok(objectives);
    }
}
