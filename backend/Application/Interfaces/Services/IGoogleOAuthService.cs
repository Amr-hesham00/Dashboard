using Dashboard.Application.DTOs;

namespace Dashboard.Application.Interfaces.Services;

/// <summary>
/// Google OAuth 2.0 authorization-code flow (web server / confidential client) used to obtain
/// and securely persist Google Ads credentials for a Dashboard user. Makes no Google Ads API calls.
/// </summary>
public interface IGoogleOAuthService
{
    /// <summary>
    /// Creates a single-use state for the user and returns the Google authorization URL.
    /// If the user already has a valid Google Ads connection, returns HasToken = true to prevent reconnecting.
    /// </summary>
    Task<GoogleOAuthStartResult> StartAuthorization(string userId);

    /// <summary>Validates the callback, exchanges the code on the backend, and stores encrypted tokens.</summary>
    Task<GoogleOAuthCallbackResult> HandleCallbackAsync(GoogleOAuthCallbackRequest request, CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves valid decrypted OAuth credentials for the specified Dashboard user.
    /// If the stored access token is expired (or near expiry), refreshes it using the stored refresh token
    /// and persists the newly encrypted access token.
    /// </summary>
    Task<GoogleOAuthValidCredentialsResult> GetValidCredentialsAsync(string userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Disconnects the user's Google Ads connection by revoking stored token(s) with Google (best-effort)
    /// and removing the stored credentials from the database.
    /// Returns true if an active connection was found and removed; false if the user had no connection.
    /// </summary>
    Task<bool> DisconnectAsync(string userId, CancellationToken cancellationToken = default);
}
