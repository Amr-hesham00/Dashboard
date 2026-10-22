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
    private readonly ILogoService _logoService;

    public ClientController(IClientService clientService, ILogoService logoService)
    {
        _clientService = clientService;
        _logoService = logoService;
    }



    /// <summary>
    /// Get supported currencies for clients.
    /// </summary>
    [HttpGet("currencies")]
    [AllowAnonymous]
    public IActionResult GetCurrencies()
    {
        var currencies = Enum.GetNames(typeof(Currency));
        return Ok(currencies);
    }

    /// <summary>
    /// get client names and ids
    /// </summary>
    [HttpGet("lookup")]
    public async Task<IActionResult> ClientLookup()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { message = "User identity not found in token." });

        var clients = await _clientService.GetClientLookupAsync(userId);

        return Ok(clients);
    }

    /// <summary>
    ///  Get clients accessible to the current authenticated user.
    /// Admins receive all clients; Managers &amp; Associates receive their assigned clients.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetByUser()

    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var role = User.FindFirstValue(ClaimTypes.Role);
        if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(role))
        {
            return Unauthorized(new { message = "User identity or role not found in token." });
        }

        switch (role)
        {
            case "Admin":
                var adminClients = await _clientService.GetAdminClientasync(userId);
                return Ok(adminClients);
            case "Manager":
                var managerClients = await _clientService.GetManagerClientasync(userId);
                return Ok(managerClients);
            default:
                var associateClients = await _clientService.GetAssociateClientasync(userId);
                return Ok(associateClients);
        }
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
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(dto.ManagerId) && !string.IsNullOrEmpty(userId))
            dto.ManagerId = userId;

        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        // Handle logo file upload if provided directly
        if (dto.LogoFile != null)
        {
            try
            {
                dto.Logo = await _logoService.SaveAsync(dto.LogoFile);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        var (success, message, client) = await _clientService.CreateClientAsync(dto);
        if (!success)
        {
            // Clean up the saved logo if client creation failed
            if (!string.IsNullOrEmpty(dto.Logo))
                await _logoService.DeleteAsync(dto.Logo);

            return BadRequest(new { message });
        }

        return CreatedAtAction(nameof(GetById), new { id = client!.ClientId }, client);
    }

    /// <summary>
    /// Update an existing client's information.
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateClientDTO dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        dto.ClientId ??= id;

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(dto.ManagerId) && !string.IsNullOrEmpty(userId))
            dto.ManagerId = userId;

        // Fetch existing client to handle logo cleanup if changed
        var existingClient = await _clientService.GetClientByIdAsync(id);
        var oldLogoUrl = existingClient?.Logo;

        if (dto.LogoFile != null)
        {
            try
            {
                dto.Logo = await _logoService.SaveAsync(dto.LogoFile);

                if (!string.IsNullOrEmpty(oldLogoUrl))
                    await _logoService.DeleteAsync(oldLogoUrl);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        else if (oldLogoUrl != null && dto.Logo != oldLogoUrl)
        {
            // Logo was changed or removed
            await _logoService.DeleteAsync(oldLogoUrl);
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



}
