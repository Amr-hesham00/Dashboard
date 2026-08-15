using System.ComponentModel.DataAnnotations;
using Dashboard.Domain.Enums;

namespace Dashboard.Application.DTOs;

public class PlatformDTO
{
    public int Id { get; set; }
    public PlatformType PlatformType { get; set; }
    public PlatformStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public int ClientId { get; set; }
}

public class CreatePlatformDTO
{
    [Required]
    public PlatformType PlatformType { get; set; }

    public PlatformStatus Status { get; set; }

    [Required]
    public int ClientId { get; set; }
}

public class UpdatePlatformDTO
{
    [Required]
    public PlatformType PlatformType { get; set; }

    public PlatformStatus Status { get; set; }

    [Required]
    public int ClientId { get; set; }
}
