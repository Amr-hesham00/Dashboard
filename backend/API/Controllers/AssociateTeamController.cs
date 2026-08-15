using Dashboard.Application.DTOs;
using Dashboard.Application.Interfaces.Services;
using Dashboard.Domain.Enums;
using Microsoft.AspNetCore.Mvc;

namespace Dashboard.API.Controllers;

[Route("api/[controller]")]
[ApiController]
//[Authorize]
public class AssociateTeamController : ControllerBase
{
    private readonly IAssociateTeamService _associateTeamService;

    public AssociateTeamController(IAssociateTeamService associateTeamService)
    {
        _associateTeamService = associateTeamService;
    }

    /// <summary>
    /// Get list of all associate teams.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var teams = await _associateTeamService.GetAllAssociateTeamsAsync();
        return Ok(teams);
    }

    /// <summary>
    /// Get associate team details by Team ID.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var team = await _associateTeamService.GetAssociateTeamByIdAsync(id);
        if (team == null)
        {
            return NotFound(new { message = $"Associate team with ID '{id}' not found." });
        }

        return Ok(team);
    }

    /// <summary>
    /// Create a new associate team.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateAssociateTeamDTO dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var (success, message, team) = await _associateTeamService.CreateAssociateTeamAsync(dto);
        if (!success)
        {
            return BadRequest(new { message });
        }

        return CreatedAtAction(nameof(GetById), new { id = team!.Id }, team);
    }

    /// <summary>
    /// Update an existing associate team's information.
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateAssociateTeamDTO dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var (success, message) = await _associateTeamService.UpdateAssociateTeamAsync(id, dto);
        if (!success)
        {
            return BadRequest(new { message });
        }

        return Ok(new { message });
    }

    /// <summary>
    /// Delete an associate team by Team ID.
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var (success, message) = await _associateTeamService.DeleteAssociateTeamAsync(id);
        if (!success)
        {
            return BadRequest(new { message });
        }

        return Ok(new { message });
    }

    /// <summary>
    /// Get available associate team status values.
    /// </summary>
    [HttpGet("statuses")]
    public IActionResult GetStatuses()
    {
        var statuses = Enum.GetNames(typeof(AssociateTeamStatus));
        return Ok(statuses);
    }
}
