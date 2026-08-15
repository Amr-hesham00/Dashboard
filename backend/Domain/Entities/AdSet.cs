using Dashboard.Domain.Enums;

namespace Dashboard.Domain.Entities;
public class AdSet
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

    public int CampaignId { get; set; } // FK
    public Campaign Campaign { get; set; }

    public ICollection<Ad> Ads { get; set; }

}
