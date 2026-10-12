using Dashboard.Application.DTOs;
using Dashboard.Application.Interfaces.Services;
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
    private readonly IWebHostEnvironment _environment;

    public ClientController(IClientService clientService, IWebHostEnvironment environment)
    {
        _clientService = clientService;
        _environment = environment;
    }

    /// <summary>
    ///  Get clients accessible to the current authenticated user.
    /// Admins receive all clients; Managers & Associates receive their assigned clients.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetByUser() // Client	Active_Campaigns	Status	ROAS	Conversions(%)	Target_Achievement
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
        {
            dto.ManagerId = userId;
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var (success, message, client) = await _clientService.CreateClientAsync(dto);
        if (!success)
        {
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
    /// Upload client logo image.
    /// </summary>
    [HttpPost("upload-logo")]
    public async Task<IActionResult> UploadLogo(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { message = "No file uploaded." });
        }

        var allowedExtensions = new[] { ".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif" };
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(extension))
        {
            return BadRequest(new { message = "Invalid file type. Allowed formats: .png, .jpg, .jpeg, .webp, .svg, .gif" });
        }

        if (file.Length > 5 * 1024 * 1024)
        {
            return BadRequest(new { message = "File size exceeds 5MB limit." });
        }

        var webRoot = _environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        var logosDir = Path.Combine(webRoot, "Logos");
        if (!Directory.Exists(logosDir))
        {
            Directory.CreateDirectory(logosDir);
        }

        var fileName = $"{Guid.NewGuid()}{extension}";
        var filePath = Path.Combine(logosDir, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var logoUrl = $"/Logos/{fileName}";
        return Ok(new { url = logoUrl, fileName });
    }

}
