using Dashboard.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace Dashboard.Application.DTOs;

public class AdDTO
{
    public int Id { get; set; }
    public string? ExternalId { get; set; }
    public string Name { get; set; } = null!;
    public string Headline { get; set; } = null!;
    public string? Description { get; set; }
    public string? CTA { get; set; }
    public string? MediaURL { get; set; }
    public MediaType? MediaType { get; set; }
    public AdStatus Status { get; set; }
    public DateTimeOffset CreatedAt { get; set; }

    // primary metrics
    public int Impressions { get; set; }
    public int Clicks { get; set; }
    public int Conversions { get; set; }
    public double Spend { get; set; }
    public double Revenue { get; set; }

    //derived metrics
    public double CTR { get; set; }
    public double CPC { get; set; }
    public double CPA { get; set; }
    public double ROAS { get; set; }

    public int AdSetId { get; set; }

}
public class AdSetPageDTO
{
    // KPI
    public int Conversions { get; set; }
    public double Spend { get; set; }
    public double Revenue { get; set; }
    public double CTR { get; set; }
    public double CPA { get; set; }
    public double ROAS { get; set; }

    public int AdId { get; set; }

    // table
    public IEnumerable<ChartPoint> Points { get; set; }

    // Ads Table
    public IEnumerable<TableRow> AdRow { get; set; }

    public IEnumerable<SearchTermRow> SearchTermRows { get; set; }
    = Array.Empty<SearchTermRow>();

}

public class ChartPoint
{
    public DateOnly Date { get; set; }
    public double Spend { get; set; }
    public double Revenue { get; set; }
    public int Conversions { get; set; }
    public double ROAS { get; set; }
    public double CPA { get; set; }
    public double CTR { get; set; }

}

public class TableRow
{
    public string Name { get; set; } = null!;
    public object Status { get; set; } = null!;
    public double Spend { get; set; }
    public int Impressions { get; set; }
    public int Clicks { get; set; }
    public int Conversions { get; set; }
    public double CPA { get; set; }
    public double Revenue { get; set; }
    public double ROAS { get; set; }
}

public class UpdateAdDTO
{
    public string? ExternalId { get; set; }

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

public class SearchTermRow
{
    public string Term { get; set; } = null!;
    public string? Keyword { get; set; }
    public string MatchType { get; set; } = null!;


    public int Impressions { get; set; }
    public int Clicks { get; set; }
    public double Spend { get; set; }
    public int Conversions { get; set; }

    // Null when there are no conversions.
    public double? CPA { get; set; }
}
