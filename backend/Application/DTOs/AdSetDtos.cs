using System.ComponentModel.DataAnnotations;
using Dashboard.Domain.Enums;

namespace Dashboard.Application.DTOs;

public class AdSetDTO
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string AudienceType { get; set; } = null!;
    public string AgeRange { get; set; } = null!;
    public AdSetGender Gender { get; set; }
    public string? Location { get; set; }
    public AdSetStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int CampaignId { get; set; }
}

public class CreateAdSetDTO
{
    [Required]
    public string Name { get; set; } = null!;

    [Required]
    public string AudienceType { get; set; } = null!;

    [Required]
    public string AgeRange { get; set; } = null!;

    [Required]
    public AdSetGender Gender { get; set; }

    public string? Location { get; set; }
    public AdSetStatus Status { get; set; }

    [Required]
    public DateTime StartDate { get; set; }

    [Required]
    public DateTime EndDate { get; set; }

    [Required]
    public int CampaignId { get; set; }
}

public class UpdateAdSetDTO
{
    [Required]
    public string Name { get; set; } = null!;

    [Required]
    public string AudienceType { get; set; } = null!;

    [Required]
    public string AgeRange { get; set; } = null!;

    [Required]
    public AdSetGender Gender { get; set; }

    public string? Location { get; set; }
    public AdSetStatus Status { get; set; }

    [Required]
    public DateTime StartDate { get; set; }

    [Required]
    public DateTime EndDate { get; set; }

    [Required]
    public int CampaignId { get; set; }
}
