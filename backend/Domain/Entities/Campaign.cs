using Dashboard.Domain.Enums;

namespace Dashboard.Domain.Entities;
public class Campaign
{
    public int Id { get; set; }
    public string? ExternalId { get; set; }
    public string Name { get; set; } = null!;
    public CampaignObjective Objective { get; set; }
    public Currency Currency { get; set; }
    public CampaignStatus Status { get; set; }
    public DateTimeOffset StartDate { get; set; }
    public DateTimeOffset? EndDate { get; set; }
    public DateTimeOffset CreatedAt { get; set; }

    public int PlatformId { get; set; }
    public Platform Platform { get; set; }
    public ICollection<AdSet> AdSets { get; set; }

}

