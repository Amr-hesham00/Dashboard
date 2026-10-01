using Dashboard.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace Dashboard.Application.DTOs;

public class PlatformDTO
{
    public int Id { get; set; }
    public PlatformType PlatformType { get; set; }
    public string? PlatformName { get; set; }
    public PlatformStatus Status { get; set; }
    public Currency Currency { get; set; }
    public string? CurrencyName { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public int ClientId { get; set; }

    // Calculated Performance Metrics (Backend)
    public decimal Spend { get; set; }
    public decimal Revenue { get; set; }
    public double ROAS { get; set; }
    public int Impressions { get; set; }
    public int Clicks { get; set; }
    public double CTR { get; set; }
    public int Conversions { get; set; }
    public double CPA { get; set; }
    public double CPC { get; set; }
    public double CPM { get; set; }
    public int CampaignsCount { get; set; }
}

public class CreatePlatformDTO
{
    [Required]
    public PlatformType PlatformType { get; set; }

    public PlatformStatus Status { get; set; }

    public Currency Currency { get; set; } = Currency.USD;

    [Required]
    public int ClientId { get; set; }
}

public class UpdatePlatformDTO
{
    [Required]
    public PlatformType PlatformType { get; set; }

    public PlatformStatus Status { get; set; }

    public Currency Currency { get; set; } = Currency.USD;

    [Required]
    public int ClientId { get; set; }
}
