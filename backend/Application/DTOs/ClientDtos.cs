using System.ComponentModel.DataAnnotations;
using Dashboard.Domain.Enums;

namespace Dashboard.Application.DTOs;

public class ClientDTO
{
    public int Id { get; set; }
    public string CompanyName { get; set; } = null!;
    public string? Logo { get; set; }
    public string Website { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Phone { get; set; } = null!;
    public string Country { get; set; } = null!;
    public Currency Currency { get; set; }
    public ClientStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? Notes { get; set; }
    public string ManagerId { get; set; } = null!;
}

public class CreateClientDTO
{
    [Required]
    public string CompanyName { get; set; } = null!;

    public string? Logo { get; set; }

    [Required]
    [Url]
    public string Website { get; set; } = null!;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = null!;

    [Required]
    [Phone]
    public string Phone { get; set; } = null!;

    [Required]
    public string Country { get; set; } = null!;

    [Required]
    public Currency Currency { get; set; }

    public ClientStatus Status { get; set; }

    public string? Notes { get; set; }

    [Required]
    public string ManagerId { get; set; } = null!;
}

public class UpdateClientDTO
{
    [Required]
    public string CompanyName { get; set; } = null!;

    public string? Logo { get; set; }

    [Required]
    [Url]
    public string Website { get; set; } = null!;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = null!;

    [Required]
    [Phone]
    public string Phone { get; set; } = null!;

    [Required]
    public string Country { get; set; } = null!;

    [Required]
    public Currency Currency { get; set; }

    public ClientStatus Status { get; set; }

    public string? Notes { get; set; }

    [Required]
    public string ManagerId { get; set; } = null!;
}
