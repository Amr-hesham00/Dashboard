using System.ComponentModel.DataAnnotations;
using Dashboard.Domain.Enums;

namespace Dashboard.Application.DTOs;

public class UserDTO
{
    public string Id { get; set; } = null!;
    public string UserName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string? ProfileImage { get; set; }
    public Roles? Role { get; set; }
    public string? PhoneNumber { get; set; }
    public bool EmailConfirmed { get; set; }
}

public class CreateUserDTO
{
    [Required]
    public string UserName { get; set; } = null!;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = null!;

    [Required]
    [MinLength(3)]
    public string Password { get; set; } = null!;

    [Required]
    public string FirstName { get; set; } = null!;

    [Required]
    public string LastName { get; set; } = null!;

    public Roles? Role { get; set; }

    public string? ProfileImage { get; set; }

    public string? PhoneNumber { get; set; }
}

public class UpdateUserDTO
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = null!;

    [Required]
    public string FirstName { get; set; } = null!;

    [Required]
    public string LastName { get; set; } = null!;

    public Roles? Role { get; set; }

    public string? ProfileImage { get; set; }

    public string? PhoneNumber { get; set; }
}

public class ChangePasswordDTO
{
    [Required]
    public string CurrentPassword { get; set; } = null!;

    [Required]
    [MinLength(3)]
    public string NewPassword { get; set; } = null!;
}

public class LoginDTO
{
    [Required]
    public string EmailOrUserName { get; set; } = null!;

    [Required]
    public string Password { get; set; } = null!;
}

public class AuthResponseDTO
{
    public bool Success { get; set; }
    public string Message { get; set; } = null!;
    public string? Token { get; set; }
    public UserDTO? User { get; set; }
}
