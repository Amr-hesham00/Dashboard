using Dashboard.Application.DTOs;
using Dashboard.Application.Interfaces;
using Dashboard.Application.Interfaces.Services;
using Dashboard.Domain.Entities;
using Dashboard.Domain.Enums;
using Dashboard.Infrastructure;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;

namespace Dashboard.Application.Services;

public class UserService : IUserService
{
    private readonly UserManager<AppUser> _userManager;
    private readonly SignInManager<AppUser> _signInManager;
    private readonly ITokenService _tokenService;
    private readonly IRefreshTokenService _refreshTokenService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IConfiguration _configuration;

    public UserService(
        UserManager<AppUser> userManager,
        SignInManager<AppUser> signInManager,
        ITokenService tokenService,
        IRefreshTokenService refreshTokenService,
        IUnitOfWork unitOfWork,
        IConfiguration configuration
        )
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _tokenService = tokenService;
        _refreshTokenService = refreshTokenService;
        _unitOfWork = unitOfWork;
        _configuration = configuration;
    }

    public Task<IEnumerable<UserDTO>> GetAllUsersAsync()
    {
        var users = _userManager.Users.ToList();
        return Task.FromResult(users.Select(MapToDTO));
    }

    public async Task<UserDTO?> GetUserByIdAsync(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        return user == null ? null : MapToDTO(user);
    }

    public async Task<(bool Success, string Message, UserDTO? User)> CreateUserAsync(CreateUserDTO dto)
    {
        // Validate password and confirmation password
        if (dto.Password != dto.ConfirmPassword)
        {
            return (false, "Password and confirmation password do not match.", null);
        }

        // Check if the user is already exists
        var existingUser = await _userManager.FindByEmailAsync(dto.Email)
            ?? await _userManager.FindByNameAsync(dto.UserName);
        if (existingUser != null)
        {
            return (false, "User with this email or username already exists.", null);
        }

        var user = new AppUser
        {
            UserName = dto.UserName,
            Email = dto.Email,
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Role = Roles.Manager,
        };

        // Create the user 
        var result = await _userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            return (false, errors, null);
        }

        // assign Manager role 
        var roleresult = await _userManager.AddToRoleAsync(user, Roles.Manager.ToString());

        // If role assignment fails, delete the user.
        if (!roleresult.Succeeded)
        {
            await _userManager.DeleteAsync(user);
            var errors = string.Join(", ", roleresult.Errors.Select(e => e.Description));
            return (false, $"Failed to assign role: {errors}", null);
        }

        return (true, "User created successfully.", MapToDTO(user));
    }

    public async Task<(bool Success, string Message)> UpdateUserAsync(string id, UpdateUserDTO dto)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
        {
            return (false, "User not found.");
        }

        user.Email = dto.Email;
        user.FirstName = dto.FirstName;
        user.LastName = dto.LastName;
        user.Role = dto.Role;
        user.ProfileImage = dto.ProfileImage;
        user.PhoneNumber = dto.PhoneNumber;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            return (false, errors);
        }

        return (true, "User updated successfully.");
    }

    public async Task<(bool Success, string Message)> DeleteUserAsync(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
        {
            return (false, "User not found.");
        }

        var result = await _userManager.DeleteAsync(user);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            return (false, errors);
        }

        return (true, "User deleted successfully.");
    }

    public async Task<(bool Success, string Message)> ChangePasswordAsync(string id, ChangePasswordDTO dto)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
        {
            return (false, "User not found.");
        }

        var result = await _userManager.ChangePasswordAsync(user, dto.CurrentPassword, dto.NewPassword);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            return (false, errors);
        }

        return (true, "Password changed successfully.");
    }

    public async Task<(bool Success, string Message, string? Token, string? RefreshToken, DateTime? RefreshTokenExpiresAt, UserDTO? User)> LoginAsync(LoginDTO dto)
    {
        // 1. authenticate user credentials
        var user = await _userManager.FindByEmailAsync(dto.EmailOrUserName)
            ?? await _userManager.FindByNameAsync(dto.EmailOrUserName);

        if (user == null)
        {
            return (false, "Invalid username or password.", null, null, null, null);
        }
        var result = await _signInManager.CheckPasswordSignInAsync(user, dto.Password, false);
        if (!result.Succeeded)
        {
            return (false, "Invalid username or password.", null, null, null, null);
        }

        // generate access token
        var token = _tokenService.GenerateToken(user); // JWT token

        // generate refresh token
        var rawRefreshToken = _refreshTokenService.GenerateToken();
        var tokenHash = _refreshTokenService.HashToken(rawRefreshToken);
        var refreshTokenExpiryDays = _configuration.GetValue("JWT:RefreshTokenExpiryInDays", 7);
        var refreshTokenExpiresAt = DateTime.UtcNow.AddDays(refreshTokenExpiryDays);

        var refreshTokenEntity = new RefreshToken
        {
            UserId = user.Id,
            TokenHash = tokenHash,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = refreshTokenExpiresAt
        };
        // Store the refresh token in the database
        await _unitOfWork.RefreshToken.Create(refreshTokenEntity);
        await _unitOfWork.Complete();

        return (true, "Login successful.", token, rawRefreshToken, refreshTokenExpiresAt, MapToDTO(user));
    }

    public async Task LogoutAsync(string? refreshToken = null, string? userId = null)
    {
        await _signInManager.SignOutAsync();

        if (!string.IsNullOrWhiteSpace(refreshToken))
        {
            var tokenHash = _refreshTokenService.HashToken(refreshToken);
            var token = await _unitOfWork.RefreshToken.GetByTokenHashAsync(tokenHash);
            if (token != null && !token.IsRevoked)
            {
                token.RevokedAt = DateTime.UtcNow;
                _unitOfWork.RefreshToken.Update(token);
                await _unitOfWork.Complete();
            }
        }
        else if (!string.IsNullOrWhiteSpace(userId))
        {
            var activeTokens = await _unitOfWork.RefreshToken.GetActiveTokensByUserIdAsync(userId);
            if (activeTokens.Count > 0)
            {
                foreach (var token in activeTokens)
                {
                    token.RevokedAt = DateTime.UtcNow;
                    _unitOfWork.RefreshToken.Update(token);
                }
                await _unitOfWork.Complete();
            }
        }
    }

    public async Task<(bool Success, string Message, string? Token, string? RefreshToken, DateTime? RefreshTokenExpiresAt, UserDTO? User)> RefreshTokenAsync(string refreshToken)
    {
        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            return (false, "Refresh token is required.", null, null, null, null);
        }

        var tokenHash = _refreshTokenService.HashToken(refreshToken);
        var existingToken = await _unitOfWork.RefreshToken.GetByTokenHashAsync(tokenHash);

        if (existingToken == null || existingToken.IsRevoked || existingToken.IsExpired)
        {
            return (false, "Invalid, expired, or revoked refresh token.", null, null, null, null);
        }

        var user = existingToken.User ?? await _userManager.FindByIdAsync(existingToken.UserId);
        if (user == null)
        {
            return (false, "User associated with this refresh token was not found.", null, null, null, null);
        }

        // Revoke the old token (Token Rotation)
        existingToken.RevokedAt = DateTime.UtcNow;
        _unitOfWork.RefreshToken.Update(existingToken);

        // Generate new refresh token
        var newRawRefreshToken = _refreshTokenService.GenerateToken();
        var newTokenHash = _refreshTokenService.HashToken(newRawRefreshToken);
        var refreshTokenExpiryDays = _configuration.GetValue("JWT:RefreshTokenExpiryInDays", 7);
        var newExpiresAt = DateTime.UtcNow.AddDays(refreshTokenExpiryDays);

        var newRefreshTokenEntity = new RefreshToken
        {
            UserId = user.Id,
            TokenHash = newTokenHash,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = newExpiresAt
        };

        await _unitOfWork.RefreshToken.Create(newRefreshTokenEntity);
        await _unitOfWork.Complete();

        // Generate new JWT
        var newJwtToken = _tokenService.GenerateToken(user);

        return (true, "Token refreshed successfully.", newJwtToken, newRawRefreshToken, newExpiresAt, MapToDTO(user));
    }

    public async Task<(bool Success, string Message)> RevokeTokenAsync(string refreshToken)
    {
        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            return (false, "Refresh token is required.");
        }

        var tokenHash = _refreshTokenService.HashToken(refreshToken);
        var existingToken = await _unitOfWork.RefreshToken.GetByTokenHashAsync(tokenHash);

        if (existingToken == null)
        {
            return (false, "Refresh token not found.");
        }

        if (existingToken.IsRevoked)
        {
            return (false, "Refresh token is already revoked.");
        }

        existingToken.RevokedAt = DateTime.UtcNow;
        _unitOfWork.RefreshToken.Update(existingToken);
        await _unitOfWork.Complete();

        return (true, "Token revoked successfully.");
    }

    private static UserDTO MapToDTO(AppUser user)
    {
        return new UserDTO
        {
            Id = user.Id,
            UserName = user.UserName ?? string.Empty,
            Email = user.Email ?? string.Empty,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Role = user.Role,
        };
    }
}


