using Dashboard.Domain.Enums;

namespace Dashboard.Domain.Entities;

public class AssetGroup
{
    public int Id { get; set; }
    public string? ExternalId { get; set; }
    public string Name { get; set; } = null!;
    public AdSetStatus Status { get; set; }
    public DateTimeOffset StartDate { get; set; }
    public DateTimeOffset? EndDate { get; set; }

    public int CampaignId { get; set; }
    public Campaign Campaign { get; set; } = null!;

    public ICollection<DailyAssetGroupMetrics> DailyMetrics { get; set; } = new List<DailyAssetGroupMetrics>();
}

