using Dashboard.Application.DTOs;

namespace Dashboard.Application.Interfaces.Services;

public interface IUserService
{
    Task<IEnumerable<UserDTO>> GetAllUsersAsync();
    Task<UserDTO?> GetUserByIdAsync(string id);
    Task<(bool Success, string Message, UserDTO? User)> CreateUserAsync(CreateUserDTO dto);
    Task<(bool Success, string Message)> UpdateUserAsync(string id, UpdateUserDTO dto);
    Task<(bool Success, string Message)> DeleteUserAsync(string id);
    Task<(bool Success, string Message)> ChangePasswordAsync(string id, ChangePasswordDTO dto);
    Task<(bool Success, string Message, string? Token, string? RefreshToken, DateTime? RefreshTokenExpiresAt, UserDTO? User)> LoginAsync(LoginDTO dto);
    Task LogoutAsync(string? refreshToken = null, string? userId = null);
    Task<(bool Success, string Message, string? Token, string? RefreshToken, DateTime? RefreshTokenExpiresAt, UserDTO? User)> RefreshTokenAsync(string refreshToken);
    Task<(bool Success, string Message)> RevokeTokenAsync(string refreshToken);
}

