using Dashboard.Application.DTOs;
using Dashboard.Application.Interfaces.Services;
using Dashboard.Infrastructure;
using Microsoft.AspNetCore.Identity;

namespace Dashboard.Application.Services;

public class UserService : IUserService
{
    private readonly UserManager<AppUser> _userManager;
    private readonly SignInManager<AppUser> _signInManager;
    private readonly ITokenService _tokenService;

    public UserService(
        UserManager<AppUser> userManager,
        SignInManager<AppUser> signInManager,
        ITokenService tokenService
        )
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _tokenService = tokenService;
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
            Role = dto.Role,
            ProfileImage = dto.ProfileImage,
            PhoneNumber = dto.PhoneNumber
        };

        var result = await _userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            return (false, errors, null);
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

    public async Task<AuthResponseDTO> LoginAsync(LoginDTO dto)
    {
        var user = await _userManager.FindByEmailAsync(dto.EmailOrUserName)
            ?? await _userManager.FindByNameAsync(dto.EmailOrUserName);

        if (user == null)
        {
            return new AuthResponseDTO
            {
                Success = false,
                Message = "Invalid username or password."
            };
        }
        var result = await _signInManager.CheckPasswordSignInAsync(user, dto.Password, false);
        if (!result.Succeeded)
        {
            return new AuthResponseDTO
            {
                Success = false,
                Message = "Invalid username or password."
            };
        }

        var token = _tokenService.GenerateToken(user); // JWT token

        return new AuthResponseDTO
        {
            Success = true,
            Message = "Login successful.",
            Token = token,
            User = MapToDTO(user)
        };
    }

    public async Task LogoutAsync()
    {
        await _signInManager.SignOutAsync();
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
            ProfileImage = user.ProfileImage,
            Role = user.Role,
            PhoneNumber = user.PhoneNumber
        };
    }
}


