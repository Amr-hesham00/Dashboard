using Dashboard.Application.DTOs;
using Dashboard.Application.Interfaces.Services;
using Dashboard.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Dashboard.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class ClientController : ControllerBase
{
    private readonly IClientService _clientService;

    public ClientController(IClientService clientService)
    {
        _clientService = clientService;
    }

    /// <summary>
    ///  Get clients accessible to the current authenticated user.
    /// Admins receive all clients; Managers & Associates receive their assigned clients.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetByUser() // Client	Platforms	Spend	Revenue	Conversions	Status	Achieved ROAS	Actions
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var role = User.FindFirstValue(ClaimTypes.Role);
        if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(role))
        {
            return Unauthorized(new { message = "User identity or role not found in token." });
        }

        IEnumerable<ClientDTO> clients = new List<ClientDTO>();
        switch (role)
        {
            case "Admin":
                clients = await _clientService.GetAdminClientasync(userId);
                break;
            case "Manager":
                clients = await _clientService.GetManagerClientasync(userId);
                break;
            default:
                clients = await _clientService.GetAssociateClientasync(userId);
                break;
        }
        return Ok(clients);
    }

    /// <summary>
    /// Get list of all clients.
    /// </summary>
    [HttpGet("AllClients")]
    public async Task<IActionResult> GetAll()
    {
        var clients = await _clientService.GetAllClientsAsync();
        return Ok(clients);
    }

    /// <summary>
    /// Get client details by Client ID.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var client = await _clientService.GetClientByIdAsync(id);
        if (client == null)
        {
            return NotFound(new { message = $"Client with ID '{id}' not found." });
        }

        return Ok(client);
    }

    /// <summary>
    /// Create a new client.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateClientDTO dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var (success, message, client) = await _clientService.CreateClientAsync(dto);
        if (!success)
        {
            return BadRequest(new { message });
        }

        return CreatedAtAction(nameof(GetById), new { id = client!.Id }, client);
    }

    /// <summary>
    /// Update an existing client's information.
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateClientDTO dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var (success, message) = await _clientService.UpdateClientAsync(id, dto);
        if (!success)
        {
            return BadRequest(new { message });
        }

        return Ok(new { message });
    }

    /// <summary>
    /// Delete a client by Client ID.
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var (success, message) = await _clientService.DeleteClientAsync(id);
        if (!success)
        {
            return BadRequest(new { message });
        }

        return Ok(new { message });
    }

    /// <summary>
    /// Get available client status values.
    /// </summary>
    [HttpGet("statuses")]
    [AllowAnonymous]
    public IActionResult GetStatuses()
    {
        var statuses = Enum.GetNames(typeof(ClientStatus));
        return Ok(statuses);
    }

    /// <summary>
    /// Get available currency values.
    /// </summary>
    [HttpGet("currencies")]
    [AllowAnonymous]
    public IActionResult GetCurrencies()
    {
        var currencies = Enum.GetNames(typeof(Currency));
        return Ok(currencies);
    }
}
