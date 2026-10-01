using Dashboard.Domain.Enums;

namespace Dashboard.Domain.Entities;
public class AdSet
{
    public int Id { get; set; }
    public string? ExternalId { get; set; }
    public string Name { get; set; } = null!;
    public string AudienceType { get; set; } = null!;
    public string AgeRange { get; set; } = null!;
    public AdSetGender Gender { get; set; }
    public string? Location { get; set; }
    public AdSetStatus Status { get; set; }
    public DateTimeOffset StartDate { get; set; }
    public DateTimeOffset? EndDate { get; set; }

    public int CampaignId { get; set; } // FK
    public Campaign Campaign { get; set; }

    public ICollection<Ad> Ads { get; set; }
    public ICollection<SearchTerm> SearchTerms { get; set; } = new List<SearchTerm>();
}
