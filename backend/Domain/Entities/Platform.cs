using Dashboard.Domain.Enums;

namespace Dashboard.Domain.Entities;
public class Platform
{
    public int Id { get; set; }
    public PlatformType PlatformType { get; set; }
    public PlatformStatus Status { get; set; }
    public Currency Currency { get; set; }
    public DateTimeOffset CreatedAt { get; set; }

    public string? ExternalAccountId { get; set; }
    public string? AccountName { get; set; }
    public string? LoginCustomerId { get; set; }

    public int? GoogleAdsConnectionId { get; set; }
    public GoogleAdsConnection? GoogleAdsConnection { get; set; }

    public int ClientId { get; set; }
    public Client Client { get; set; }
    public ICollection<Campaign> Campaigns { get; set; }

}
