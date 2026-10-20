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

    public PlatformController(IPlatformService platformService)
    {
        _platformService = platformService;
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
