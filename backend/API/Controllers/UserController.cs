using Dashboard.Application.DTOs;
using Dashboard.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Dashboard.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class UserController : ControllerBase
{
    private readonly IUserService _userService;

    public UserController(IUserService userService)
    {
        _userService = userService;
    }

    /// <summary>
    /// Authenticate a user with email/username and password.
    /// Sets the Refresh Token in a secure HttpOnly cookie and returns the Access Token.
    /// </summary>
    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDTO dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var (success, message, token, refreshToken, refreshTokenExpiresAt, user) = await _userService.LoginAsync(dto);
        if (!success)
        {
            return Unauthorized(new AuthResponseDTO
            {
                Success = false,
                Message = message
            });
        }

        if (!string.IsNullOrEmpty(refreshToken))
        {
            SetRefreshTokenCookie(refreshToken, refreshTokenExpiresAt);
        }

        return Ok(new AuthResponseDTO
        {
            Success = true,
            Message = message,
            Token = token,
            User = user
        });
    }

    /// <summary>
    /// Sign out the current user and revoke their refresh token.
    /// </summary>
    [HttpPost("Logout")]
    public async Task<IActionResult> Logout()
    {
        var token = Request.Cookies["refreshToken"];
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        await _userService.LogoutAsync(token, userId);
        DeleteRefreshTokenCookie();

        return Ok(new { message = "Signed out successfully." });
    }

    /// <summary>
    /// Refresh access token using the HttpOnly cookie refresh token.
    /// Rotates the refresh token and returns a new access token.
    /// </summary>
    [AllowAnonymous]
    [HttpPost("refresh-token")]
    public async Task<IActionResult> RefreshToken()
    {
        var refreshToken = Request.Cookies["refreshToken"];
        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            return Unauthorized(new AuthResponseDTO
            {
                Success = false,
                Message = "Refresh token cookie is missing."
            });
        }

        var (success, message, token, newRefreshToken, newExpiresAt, user) = await _userService.RefreshTokenAsync(refreshToken);
        if (!success)
        {
            DeleteRefreshTokenCookie();
            return Unauthorized(new AuthResponseDTO
            {
                Success = false,
                Message = message
            });
        }

        if (!string.IsNullOrEmpty(newRefreshToken))
        {
            SetRefreshTokenCookie(newRefreshToken, newExpiresAt);
        }

        return Ok(new AuthResponseDTO
        {
            Success = true,
            Message = message,
            Token = token,
            User = user
        });
    }

    /// <summary>
    /// Revoke the active refresh token.
    /// </summary>
    [HttpPost("revoke-token")]
    public async Task<IActionResult> RevokeToken()
    {
        var refreshToken = Request.Cookies["refreshToken"];
        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            return BadRequest(new { message = "Refresh token cookie is missing." });
        }

        var (success, message) = await _userService.RevokeTokenAsync(refreshToken);
        DeleteRefreshTokenCookie();

        if (!success)
        {
            return BadRequest(new { message });
        }

        return Ok(new { message });
    }



    /// <summary>
    /// Get list of all registered users.
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll()
    {
        var users = await _userService.GetAllUsersAsync();
        return Ok(users);
    }

    /// <summary>
    /// Get user details by User ID.
    /// </summary>
    [HttpGet("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetById(string id)
    {
        var user = await _userService.GetUserByIdAsync(id);
        if (user == null)
        {
            return NotFound(new { message = $"User with ID '{id}' not found." });
        }

        return Ok(user);
    }

    /// <summary>
    /// Create a new user.
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Register([FromBody] CreateUserDTO dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var (success, message, user) = await _userService.CreateUserAsync(dto);
        if (!success)
        {
            return BadRequest(new { message });
        }

        return CreatedAtAction(nameof(GetById), new { id = user!.Id }, user);
    }

    /// <summary>
    /// Update an existing user's information.
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] UpdateUserDTO dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var (success, message) = await _userService.UpdateUserAsync(id, dto);
        if (!success)
        {
            return BadRequest(new { message });
        }

        return Ok(new { message });
    }

    /// <summary>
    /// Delete a user by User ID.
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(string id)
    {
        var (success, message) = await _userService.DeleteUserAsync(id);
        if (!success)
        {
            return BadRequest(new { message });
        }

        return Ok(new { message });
    }

    /// <summary>
    /// Change password for a specified user.
    /// </summary>
    [HttpPost("{id}/change-password")]
    public async Task<IActionResult> ChangePassword(string id, [FromBody] ChangePasswordDTO dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var (success, message) = await _userService.ChangePasswordAsync(id, dto);
        if (!success)
        {
            return BadRequest(new { message });
        }

        return Ok(new { message });
    }

    /// <summary>
    /// Appends the refresh token as an HTTP-only cookie on the response, with an optional expiration time.
    /// </summary>
    private void SetRefreshTokenCookie(string refreshToken, DateTime? expiresAt)
    {
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = Request.IsHttps,
            SameSite = Request.IsHttps ? SameSiteMode.None : SameSiteMode.Lax,
            Expires = expiresAt ?? DateTime.UtcNow.AddDays(7),
            IsEssential = true
        };

        Response.Cookies.Append("refreshToken", refreshToken, cookieOptions);
    }

    /// <summary>
    /// Delete the refresh token from cookies
    /// </summary>
    private void DeleteRefreshTokenCookie()
    {
        Response.Cookies.Delete("refreshToken", new CookieOptions
        {
            HttpOnly = true,
            Secure = Request.IsHttps,
            SameSite = Request.IsHttps ? SameSiteMode.None : SameSiteMode.Lax
        });
    }
}

