using Dashboard.Domain.Enums;

namespace Dashboard.Application.DTOs;

public class AdSetDTO
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
    public int CampaignId { get; set; }
}
public class CampPageDTO
{
    public int ClientId { get; set; }
    public string? ClientName { get; set; }
    public string CampName { get; set; } = null!;
    public string Status { get; set; } = null!;
    public string CampPlatform { get; set; } = null!;

    // KPIs
    public double Spend { set; get; }
    public double Impressions { set; get; }
    public double Clicks { set; get; }
    public double Conversions { set; get; }
    public double Revenue { set; get; }

    public double CPA { set; get; }
    public double ROAS { set; get; }
    public double CPC { set; get; }
    public double AOV { set; get; }
    public double CPM { set; get; }
    public double ConversionRate { set; get; }
    // chart
    public IEnumerable<ChartPoint> Points { get; set; }
    // Adset Table
    public IEnumerable<TableRow> AdsetRows { get; set; }

}
//public class ChartPoint
//{
//    public DateOnly Date { get; set; }
//    public double Spend { get; set; }
//    public double Revenue { get; set; }
//    public int Conversions { get; set; }
//    public double ROAS { get; set; }
//    public double CPA { get; set; }
//    public double CTR { get; set; }
//}

//public class TableRow
//{
//    public string AdSetName { get; set; } = null!;
//    public AdSetStatus Status { get; set; }
//    public double Spend { get; set; }
//    public int Impressions { get; set; }
//    public int Clicks { get; set; }
//    public int Conversions { get; set; }
//    public double CPA { get; set; }
//    public double Revenue { get; set; }
//    public double ROAS { get; set; }
//}


