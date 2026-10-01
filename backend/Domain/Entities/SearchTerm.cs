using Dashboard.Domain.Enums;

namespace Dashboard.Domain.Entities;

public class SearchTerm
{
    public int Id { get; set; }
    public string Term { get; set; } = null!;
    public string? Keyword { get; set; }
    public Dashboard.Domain.Enums.MatchType MatchType { get; set; }
    public DateOnly Date { get; set; }

    public int Impressions { get; set; }
    public int Clicks { get; set; }
    public double Spend { get; set; }
    public int Conversions { get; set; }

    public int AdSetId { get; set; }
    public AdSet AdSet { get; set; } = null!;
}
