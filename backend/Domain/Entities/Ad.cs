using Dashboard.Domain.Enums;

namespace Dashboard.Domain.Entities;
public class Ad
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
    public AdSet Adset { get; set; }
}


