using Dashboard.Infrastructure;

namespace Dashboard.Domain.Entities;

public class RefreshToken
{
    public int Id { get; set; }

    public string TokenHash { get; set; } = null!;

    public string UserId { get; set; } = null!;

    public AppUser User { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public DateTime ExpiresAt { get; set; }

    public DateTime? RevokedAt { get; set; }

    public bool IsExpired => DateTime.UtcNow >= ExpiresAt;

    public bool IsRevoked => RevokedAt != null;

    public bool IsActive => !IsRevoked && !IsExpired;
}
