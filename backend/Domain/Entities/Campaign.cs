using Dashboard.Domain.Enums;

namespace Dashboard.Domain.Entities;
public class Campaign
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

    public int PlatformId { get; set; } // FK
    public Platform Platform { get; set; }
    public ICollection<AdSet> AdSets { get; set; }

}
