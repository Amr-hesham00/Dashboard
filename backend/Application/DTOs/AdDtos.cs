using System.ComponentModel.DataAnnotations;
using Dashboard.Domain.Enums;

namespace Dashboard.Application.DTOs;

public class AdDTO
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Headline { get; set; } = null!;
    public string? Description { get; set; }
    public string? CTA { get; set; }
    public string? MediaURL { get; set; }
    public MediaType? MediaType { get; set; }
    public AdStatus Status { get; set; }

    public int Impressions { get; set; }
    public int Clicks { get; set; }
    public int Conversions { get; set; }
    public double Spend { get; set; }
    public double Revenue { get; set; }

    public DateTime CreatedAt { get; set; }
    public int AdSetId { get; set; }
}

public class CreateAdDTO
{
    [Required]
    public string Name { get; set; } = null!;

    [Required]
    public string Headline { get; set; } = null!;

    public string? Description { get; set; }
    public string? CTA { get; set; }
    public string? MediaURL { get; set; }
    public MediaType? MediaType { get; set; }
    public AdStatus Status { get; set; }

    public int Impressions { get; set; }
    public int Clicks { get; set; }
    public int Conversions { get; set; }
    public double Spend { get; set; }
    public double Revenue { get; set; }

    [Required]
    public int AdSetId { get; set; }
}

public class UpdateAdDTO
{
    [Required]
    public string Name { get; set; } = null!;

    [Required]
    public string Headline { get; set; } = null!;

    public string? Description { get; set; }
    public string? CTA { get; set; }
    public string? MediaURL { get; set; }
    public MediaType? MediaType { get; set; }
    public AdStatus Status { get; set; }

    public int Impressions { get; set; }
    public int Clicks { get; set; }
    public int Conversions { get; set; }
    public double Spend { get; set; }
    public double Revenue { get; set; }

    [Required]
    public int AdSetId { get; set; }
}


