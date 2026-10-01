using Dashboard.Domain.Entities;
using Dashboard.Domain.Enums;

namespace Dashboard.Application.DTOs;

public class PageDTO
{
    // KPIs
    public int Impressions { get; set; }
    public int Clicks { get; set; }
    public int Conversions { get; set; }
    public double Spend { get; set; }
    public double Revenue { get; set; }

    public double ROAS { get; set; }
    public double CTR { get; set; }
    public double CPC { get; set; }
    public double CPM { get; set; }
    public double CPA { get; set; }
    public double? AOV { get; set; }
    public double ConversionRate { get; set; }
}
public class ClientPageDTO : PageDTO
{
    public Currency Currency { get; set; }

    public ClientTargetDTO Target { get; set; } = null!;
    public ClientInfoDTO Client { get; set; }

    // chart data
    public IEnumerable<ChartPoint> Points { get; set; }
        = Array.Empty<ChartPoint>();

    // platforms comparison table
    public IEnumerable<PlatformsTable> PlatformRow { get; set; }

    // camps table
    public IEnumerable<CampsTable> CampRow { get; set; }

}
public class PlatformPageDTO : PageDTO
{
    public Currency Currency { get; set; }

    // camps table
    public IEnumerable<CampsTable> CampRow { get; set; }

}
public class CampaignDTO
{
    public int Id { get; set; }
    public string? ExternalId { get; set; }
    public string Name { get; set; } = null!;
    public CampaignObjective Objective { get; set; }
    public CampaignStatus Status { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public int PlatformId { get; set; }
    public PlatformType PlatformType { get; set; }
    public string? PlatformName { get; set; }

    public ClientTarget target { get; set; } = null!;

    // KPIs
    public int Impressions { get; set; }
    public int Clicks { get; set; }
    public int Conversions { get; set; }
    public double Spend { get; set; }
    public double Revenue { get; set; }

    // derived metrics
    public double ROAS { get; set; }
    public double CTR { get; set; }
    public double CPC { get; set; }
    public double CPM { get; set; }
    public double CPA { get; set; }
    public double AOV { get; set; }
    public double ConversionRate { get; set; }
}


public class PlatformsTable
{

    public PlatformType PlatformName { get; set; }
    public double Spend { get; set; }
    public double Revenue { get; set; }
    public double ROAS { get; set; } // will be user in platforms bar chart
    public int Impressions { get; set; }
    public int Clicks { get; set; }
    public double CTR { get; set; }
    public int Conversions { get; set; }
    public double CPA { get; set; }
    public int PlatformId { get; set; }
    public Currency Currency { get; set; }
}
public class CampsTable
{
    public string CampaignName { set; get; }
    public CampaignStatus Status { set; get; }
    public CampaignObjective Objective { set; get; }
    public double Spend { set; get; }
    public double Revenue { set; get; }
    public double ROAS { set; get; }
    public DateTimeOffset StartDate { set; get; }
    public int CampaignId { get; set; }
    public int PlatformId { get; set; }
    public PlatformType Platform { get; set; }
}

public class ClientInfoDTO
{
    public int Id { get; set; }
    public string CompanyName { get; set; } = null!;
    public string? Logo { get; set; }
    public string Website { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Phone { get; set; } = null!;
    public string Country { get; set; } = null!;
    public ClientStatus Status { get; set; }
    public BusinessModel BusinessModel { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public string? Notes { get; set; }
}









