using System.ComponentModel.DataAnnotations;

namespace Dashboard.Application.DTOs;

public class SearchTermDTO
{
    public int Id { get; set; }
    public string Term { get; set; } = null!;
    public string SearchTerm => Term;
    public string? Keyword { get; set; }
    public string MatchType { get; set; } = "Exact";
    public DateOnly Date { get; set; }
    public int Impressions { get; set; }
    public int Clicks { get; set; }
    public double Spend { get; set; }
    public double Cost => Spend;
    public int Conversions { get; set; }
    public double CPA { get; set; }
    public int AdSetId { get; set; }
    public int? CampaignId { get; set; }
    public string? CampaignName { get; set; }
    public string? AdSetName { get; set; }
}

public class CreateSearchTermDTO
{
    [Required]
    public string SearchTerm { get; set; } = null!;

    public string? Keyword { get; set; }

    public string MatchType { get; set; } = "Exact";

    [Required]
    public DateOnly Date { get; set; }

    public int Impressions { get; set; }
    public int Clicks { get; set; }
    public double Spend { get; set; }
    public int Conversions { get; set; }

    [Required]
    public int AdSetId { get; set; }
}
