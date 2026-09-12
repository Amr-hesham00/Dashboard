using Dashboard.Application.DTOs;
using Dashboard.Application.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;

namespace Dashboard.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ClientTargetController : ControllerBase
{
    private readonly IClientTargetService _clientTargetService;

    public ClientTargetController(IClientTargetService clientTargetService)
    {
        _clientTargetService = clientTargetService;
    }

    /// <summary>
    /// Get list of all client targets.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var targets = await _clientTargetService.GetAllTargetsAsync();
        return Ok(targets);
    }

    /// <summary>
    /// Get target by Target ID.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var target = await _clientTargetService.GetTargetByIdAsync(id);
        if (target == null)
        {
            return NotFound(new { message = $"Client target with ID '{id}' not found." });
        }

        return Ok(target);
    }

    /// <summary>
    /// Get target settings for a specific Client by Client ID.
    /// </summary>
    [HttpGet("client/{clientId}")]
    public async Task<IActionResult> GetByClientId(int clientId)
    {
        var target = await _clientTargetService.GetTargetByClientIdAsync(clientId);
        if (target == null)
        {
            return NotFound(new { message = $"Target settings for client ID '{clientId}' not found." });
        }

        return Ok(target);
    }

    /// <summary>
    /// Create target settings for a client.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateClientTargetDTO dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var (success, message, target) = await _clientTargetService.CreateTargetAsync(dto);
        if (!success)
        {
            return BadRequest(new { message });
        }

        return CreatedAtAction(nameof(GetById), new { id = target!.Id }, target);
    }

    /// <summary>
    /// Update target settings by Target ID.
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateClientTargetDTO dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var (success, message) = await _clientTargetService.UpdateTargetAsync(id, dto);
        if (!success)
        {
            return BadRequest(new { message });
        }

        return Ok(new { message });
    }

    /// <summary>
    /// Create or update (upsert) target settings for a specific client.
    /// </summary>
    [HttpPut("client/{clientId}")]
    public async Task<IActionResult> UpsertByClientId(int clientId, [FromBody] UpdateClientTargetDTO dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var (success, message, target) = await _clientTargetService.UpsertByClientIdAsync(clientId, dto);
        if (!success)
        {
            return BadRequest(new { message });
        }

        return Ok(new { message, target });
    }

    /// <summary>
    /// Delete target settings by Target ID.
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var (success, message) = await _clientTargetService.DeleteTargetAsync(id);
        if (!success)
        {
            return BadRequest(new { message });
        }

        return Ok(new { message });
    }
}
