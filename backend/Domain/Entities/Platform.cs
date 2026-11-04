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
    public string? ManagerAccountId { get; set; }
    public string? TimeZone { get; set; }

    public DateTimeOffset? LastSyncedAt { get; set; }
    public DateTimeOffset? LastBackfillAt { get; set; }
    public string? LastSyncStatus { get; set; }
    public string? LastSyncError { get; set; }

    public int? OAuthConnectionId { get; set; }
    public OAuthConnection? OAuthConnection { get; set; }

    public int ClientId { get; set; }
    public Client Client { get; set; }
    public ICollection<Campaign> Campaigns { get; set; }

}
