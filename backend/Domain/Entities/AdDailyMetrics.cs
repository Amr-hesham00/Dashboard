namespace Dashboard.Domain.Entities;

public class AdDailyMetrics
{
    public int Id { get; set; }
    public DateOnly Date { get; set; }

    public int Impressions { get; set; }
    public int Clicks { get; set; }
    public int Conversions { get; set; }
    public double Spend { get; set; }
    public double Revenue { get; set; }

    public int AdId { get; set; }
    public Ad Ad { get; set; } = null!;
}
