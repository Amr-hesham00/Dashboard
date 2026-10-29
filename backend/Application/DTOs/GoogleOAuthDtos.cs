using System.Text.Json.Serialization;

namespace Dashboard.Application.DTOs;

/// <summary>
/// Result of starting authorization. If the user already has a valid connection, HasToken is true,
/// ErrorCode is "already_connected", and AuthorizationUrl/State are null to prevent reconnecting.
/// </summary>
public record GoogleOAuthStartResult(string? AuthorizationUrl, string? State, bool HasToken = false, string? ErrorCode = null)
{
    public bool AlreadyConnected => HasToken || ErrorCode == GoogleOAuthErrorCodes.AlreadyConnected;
    public bool hasToken => HasToken;
}

/// <summary>Raw values received on the OAuth callback plus the browser-binding cookie value.</summary>
public record GoogleOAuthCallbackRequest(string? Code, string? State, string? Error, string? BrowserState);

/// <summary>
/// Outcome of the callback. Contains no tokens or codes; ErrorCode is one of <see cref="GoogleOAuthErrorCodes"/>.
/// </summary>
public record GoogleOAuthCallbackResult(bool Success, string? ErrorCode)
{
    public static GoogleOAuthCallbackResult Ok() => new(true, null);
    public static GoogleOAuthCallbackResult Fail(string errorCode) => new(false, errorCode);
}

/// <summary>Successful response from https://oauth2.googleapis.com/token.</summary>
public class GoogleTokenResponse
{
    [JsonPropertyName("access_token")]
    public string? AccessToken { get; set; }

    [JsonPropertyName("refresh_token")]
    public string? RefreshToken { get; set; }

    [JsonPropertyName("expires_in")]
    public int ExpiresIn { get; set; }

    [JsonPropertyName("token_type")]
    public string? TokenType { get; set; }

    [JsonPropertyName("scope")]
    public string? Scope { get; set; }
}

/// <summary>Error response from the Google token endpoint.</summary>
public class GoogleTokenErrorResponse
{
    [JsonPropertyName("error")]
    public string? Error { get; set; }
}

/// <summary>Safe, fixed error codes passed back.</summary>
public static class GoogleOAuthErrorCodes
{
    // Google-defined errors (authorization redirect or token endpoint)
    public const string AccessDenied = "access_denied";
    public const string InvalidRequest = "invalid_request";
    public const string RedirectUriMismatch = "redirect_uri_mismatch";
    public const string InvalidClient = "invalid_client";
    public const string InvalidGrant = "invalid_grant";
    public const string AdminPolicyEnforced = "admin_policy_enforced";
    public const string OrgInternal = "org_internal";
    public const string DisallowedUserAgent = "disallowed_useragent";
    public const string DeletedClient = "deleted_client";

    // Application-defined errors
    public const string AlreadyConnected = "already_connected";
    public const string InvalidState = "invalid_state";
    public const string ScopeNotGranted = "scope_not_granted";
    public const string MissingRefreshToken = "missing_refresh_token";
    public const string NotConfigured = "not_configured";
    public const string AuthorizationFailed = "authorization_failed";

    private static readonly HashSet<string> GoogleErrors = new(StringComparer.Ordinal)
    {
        AccessDenied, InvalidRequest, RedirectUriMismatch, InvalidClient, InvalidGrant,
        AdminPolicyEnforced, OrgInternal, DisallowedUserAgent, DeletedClient
    };

    /// <summary>Maps a provider error string to a known code; anything unrecognised becomes authorization_failed.</summary>
    public static string FromGoogle(string? error) =>
        error != null && GoogleErrors.Contains(error) ? error : AuthorizationFailed;
}
