using System.ComponentModel.DataAnnotations;

namespace Dashboard.Application.DTOs;

public class AdDailyMetricsDTO
{
    public int Id { get; set; }
    public int AdId { get; set; }
    public DateOnly Date { get; set; }

    public int Impressions { get; set; }
    public int Clicks { get; set; }
    public int Conversions { get; set; }
    public double Spend { get; set; }
    public double Revenue { get; set; }

    // Derived metrics
    public double CTR => Impressions > 0 ? Math.Round((double)Clicks / Impressions * 100, 2) : 0;
    public double CPC => Clicks > 0 ? Math.Round(Spend / Clicks, 2) : 0;
    public double CPA => Conversions > 0 ? Math.Round(Spend / Conversions, 2) : 0;
    public double ROAS => Spend > 0 ? Math.Round(Revenue / Spend, 2) : 0;
    public double ConversionRate => Clicks > 0 ? Math.Round((double)Conversions / Clicks * 100, 2) : 0;
}

public class CreateAdDailyMetricsDTO
{
    [Required]
    public int AdId { get; set; }

    [Required]
    public DateOnly Date { get; set; }

    [Range(0, int.MaxValue)]
    public int Impressions { get; set; }

    [Range(0, int.MaxValue)]
    public int Clicks { get; set; }

    [Range(0, int.MaxValue)]
    public int Conversions { get; set; }

    [Range(0, double.MaxValue)]
    public double Spend { get; set; }

    [Range(0, double.MaxValue)]
    public double Revenue { get; set; }
}

public class UpdateAdDailyMetricsDTO
{
    [Range(0, int.MaxValue)]
    public int Impressions { get; set; }

    [Range(0, int.MaxValue)]
    public int Clicks { get; set; }

    [Range(0, int.MaxValue)]
    public int Conversions { get; set; }

    [Range(0, double.MaxValue)]
    public double Spend { get; set; }

    [Range(0, double.MaxValue)]
    public double Revenue { get; set; }
}
