using System.Buffers.Text;
using System.Collections.Concurrent;
using System.Security.Cryptography;

namespace Dashboard.Application.Services;

/// <summary>
/// In-memory, server-side store of pending Google OAuth authorization transactions.
/// Each state is cryptographically random, bound to the initiating Dashboard user,
/// expires after <see cref="Lifetime"/>, and can be consumed exactly once (atomic TryRemove).
/// Registered as a singleton. Pending states are lost on restart (the user simply retries);
/// a multi-instance deployment would need a shared store instead.
/// </summary>
public sealed class GoogleOAuthStateStore
{
    public static readonly TimeSpan Lifetime = TimeSpan.FromMinutes(10);

    private readonly ConcurrentDictionary<string, GoogleOAuthPendingAuthorization> _pending = new(StringComparer.Ordinal);
    private readonly TimeProvider _timeProvider;

    public GoogleOAuthStateStore(TimeProvider timeProvider)
    {
        _timeProvider = timeProvider;
    }

    /// <summary>Creates and stores a new single-use state for the given user.</summary>
    public string Create(string userId, string codeVerifier)
    {
        var now = _timeProvider.GetUtcNow();
        RemoveExpired(now);

        var state = Base64Url.EncodeToString(RandomNumberGenerator.GetBytes(32));
        _pending[state] = new GoogleOAuthPendingAuthorization(userId, codeVerifier, now.Add(Lifetime));
        //{ "state_string": {"user id","code verifier","expiration"} }
        return state;
    }

    /// <summary>
    /// Removes the state and returns its transaction if it existed and has not expired.
    /// Returns null for unknown, expired, or already consumed states.
    /// </summary>
    public GoogleOAuthPendingAuthorization? Consume(string state)
    {
        if (!_pending.TryRemove(state, out var pending))
            return null;

        return pending.ExpiresAt > _timeProvider.GetUtcNow() ? pending : null;
    }

    private void RemoveExpired(DateTimeOffset now)
    {
        foreach (var entry in _pending)
        {
            if (entry.Value.ExpiresAt <= now)
                _pending.TryRemove(entry.Key, out _);
        }
    }
}

public sealed record GoogleOAuthPendingAuthorization(string UserId, string CodeVerifier, DateTimeOffset ExpiresAt);
