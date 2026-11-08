namespace Dashboard.Domain.Entities;

public class DailyAssetGroupMetrics
{
    public int Id { get; set; }
    public DateOnly Date { get; set; }

    public int Impressions { get; set; }
    public int Clicks { get; set; }
    public int Conversions { get; set; }
    public double Spend { get; set; }
    public double Revenue { get; set; }

    public int AssetGroupId { get; set; }
    public AssetGroup AssetGroup { get; set; } = null!;
}

