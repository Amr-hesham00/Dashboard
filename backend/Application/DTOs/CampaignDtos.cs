using System.ComponentModel.DataAnnotations;
using Dashboard.Domain.Enums;

namespace Dashboard.Application.DTOs;

public class CampaignDTO
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public CampaignObjective Objective { get; set; }
    public CampaignStatus Status { get; set; }
    public double Spend { get; set; }
    public double Revenue { get; set; }
    public float ROAS { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public int PlatformId { get; set; }
}

public class CreateCampaignDTO
{
    [Required]
    public string Name { get; set; } = null!;

    [Required]
    public CampaignObjective Objective { get; set; }

    public CampaignStatus Status { get; set; }
    public double Spend { get; set; }
    public double Revenue { get; set; }
    public float ROAS { get; set; }

    [Required]
    public DateTime StartDate { get; set; }

    [Required]
    public DateTime EndDate { get; set; }

    [Required]
    public int PlatformId { get; set; }
}

public class UpdateCampaignDTO
{
    [Required]
    public string Name { get; set; } = null!;

    [Required]
    public CampaignObjective Objective { get; set; }

    public CampaignStatus Status { get; set; }
    public double Spend { get; set; }
    public double Revenue { get; set; }
    public float ROAS { get; set; }

    [Required]
    public DateTime StartDate { get; set; }

    [Required]
    public DateTime EndDate { get; set; }

    [Required]
    public int PlatformId { get; set; }
}
