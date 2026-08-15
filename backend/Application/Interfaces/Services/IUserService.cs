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
    Task<AuthResponseDTO> LoginAsync(LoginDTO dto);
    Task LogoutAsync();
}

