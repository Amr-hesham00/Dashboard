using Dashboard.Infrastructure;

namespace Dashboard.Domain.Entities;

/// <summary>
/// Google OAuth credentials granted by a Dashboard user for future Google Ads API access.
/// One connection per Dashboard user. Token values are stored encrypted (ASP.NET Core Data Protection).
/// </summary>
public class GoogleAdsConnection
{
    public int Id { get; set; }

    public string UserId { get; set; } = null!;

    public AppUser User { get; set; } = null!;

    public string AccessTokenEncrypted { get; set; } = null!;

    public string RefreshTokenEncrypted { get; set; } = null!;

    public DateTimeOffset AccessTokenExpiresAt { get; set; }

    public string? Scopes { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }
}
