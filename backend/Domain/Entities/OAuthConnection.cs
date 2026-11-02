using Dashboard.Domain.Enums;
using Dashboard.Infrastructure;

namespace Dashboard.Domain.Entities;

/// <summary>
/// Platform-agnostic OAuth credentials granted by a Dashboard user (e.g. Google Ads, Meta Ads, TikTok Ads, Snapchat Ads).
/// Stored per Dashboard user and PlatformType. Token values are stored encrypted (ASP.NET Core Data Protection).
/// </summary>
public class OAuthConnection
{
    public int Id { get; set; }

    public string UserId { get; set; } = null!;

    public AppUser User { get; set; } = null!;

    public PlatformType PlatformType { get; set; } = PlatformType.GoogleAds;

    public string AccessTokenEncrypted { get; set; } = null!;

    public string RefreshTokenEncrypted { get; set; } = null!;

    public DateTimeOffset AccessTokenExpiresAt { get; set; }

    public string? Scopes { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    public ICollection<Platform> Platforms { get; set; } = new List<Platform>();
}
