using Dashboard.Infrastructure;

namespace Dashboard.Domain.Entities;

public class RefreshToken
{
    public int Id { get; set; }

    public string TokenHash { get; set; } = null!;

    public string UserId { get; set; } = null!;

    public AppUser User { get; set; } = null!;

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset ExpiresAt { get; set; }

    public DateTimeOffset? RevokedAt { get; set; }

    public bool IsExpired => DateTimeOffset.UtcNow >= ExpiresAt;

    public bool IsRevoked => RevokedAt != null;

    public bool IsActive => !IsRevoked && !IsExpired;
}
