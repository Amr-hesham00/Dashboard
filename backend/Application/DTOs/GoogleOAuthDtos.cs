using System.ComponentModel.DataAnnotations;
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

/// <summary>
/// Internal-only decrypted OAuth credentials for backend Google Ads API calls.
/// Never serialized to API responses or exposed to the frontend.
/// </summary>
public record GoogleOAuthValidCredentialsResult(
    bool Success,
    int? ConnectionId = null,
    string? AccessToken = null,
    string? RefreshToken = null,
    DateTimeOffset? AccessTokenExpiresAt = null,
    string? ErrorCode = null)
{
    public static GoogleOAuthValidCredentialsResult Ok(
        int connectionId,
        string accessToken,
        string refreshToken,
        DateTimeOffset expiresAt) =>
        new(true, connectionId, accessToken, refreshToken, expiresAt, null);

    public static GoogleOAuthValidCredentialsResult Fail(string errorCode) =>
        new(false, null, null, null, null, errorCode);
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
    public const string NotConnected = "not_connected";
    public const string InvalidState = "invalid_state";
    public const string ScopeNotGranted = "scope_not_granted";
    public const string MissingRefreshToken = "missing_refresh_token";
    public const string NotConfigured = "not_configured";
    public const string AuthorizationFailed = "authorization_failed";

    // Account discovery & selection errors
    public const string DiscoveryFailed = "discovery_failed";
    public const string InvalidCustomerId = "invalid_customer_id";
    public const string UnauthorizedCustomerAccount = "unauthorized_customer_account";
    public const string ManagerAccountNotAllowed = "manager_account_not_allowed";
    public const string ClientNotFound = "client_not_found";
    public const string UnauthorizedClient = "unauthorized_client";
    public const string CustomerAlreadyLinked = "customer_already_linked";
    public const string UnsupportedCustomerCurrency = "unsupported_customer_currency";

    private static readonly HashSet<string> GoogleErrors = new(StringComparer.Ordinal)
    {
        AccessDenied, InvalidRequest, RedirectUriMismatch, InvalidClient, InvalidGrant,
        AdminPolicyEnforced, OrgInternal, DisallowedUserAgent, DeletedClient
    };

    /// <summary>Maps a provider error string to a known code; anything unrecognised becomes authorization_failed.</summary>
    public static string FromGoogle(string? error) =>
        error != null && GoogleErrors.Contains(error) ? error : AuthorizationFailed;
}

/// <summary>
/// Represents a discovered Google Ads customer account (either an Advertiser account or a Manager/MCC account).
/// </summary>
public class GoogleAdsCustomerAccountDto
{
    /// <summary>Normalized 10-digit Google Ads Customer ID (digits only, e.g. "1757564917").</summary>
    public string CustomerId { get; set; } = null!;

    /// <summary>Human-friendly formatted Customer ID (e.g. "175-756-4917").</summary>
    public string FormattedCustomerId { get; set; } = null!;

    /// <summary>Descriptive account name set in Google Ads.</summary>
    public string DescriptiveName { get; set; } = null!;

    /// <summary>True if this is a Google Ads Manager (MCC) account; false if it is an Advertiser account.</summary>
    public bool IsManager { get; set; }

    /// <summary>True only when the account is an Advertiser account that can be selected for a Dashboard Client.</summary>
    public bool CanSelect => !IsManager;

    /// <summary>ISO 4217 currency code of the account (e.g. "USD", "EGP", "EUR").</summary>
    public string? CurrencyCode { get; set; }

    /// <summary>
    /// If discovered underneath a Manager (MCC) account, the Manager Customer ID used as login-customer-id.
    /// Null if accessed directly as a standalone customer.
    /// </summary>
    public string? ManagerCustomerId { get; set; }

    /// <summary>Hierarchy depth relative to the root accessible account (0 for root, 1+ for child accounts).</summary>
    public long Level { get; set; }

    /// <summary>If already associated with a Dashboard Client, the Client ID.</summary>
    public int? AssociatedClientId { get; set; }

    /// <summary>If already associated with a Dashboard Client, the Client's company name.</summary>
    public string? AssociatedClientName { get; set; }
}

/// <summary>Result of discovering accessible Google Ads customer accounts for the authenticated user.</summary>
public class GoogleAdsDiscoveryResultDto
{
    public bool Success { get; set; }
    public bool Connected { get; set; }
    public string? ErrorCode { get; set; }
    public string? Message { get; set; }
    public List<GoogleAdsCustomerAccountDto> Accounts { get; set; } = new();
}

/// <summary>Request payload to associate a selected Google Ads advertiser account with a Dashboard Client.</summary>
public class SelectGoogleAdsAccountRequestDto
{
    [Required]
    public int ClientId { get; set; }

    [Required]
    public string CustomerId { get; set; } = null!;
}

/// <summary>Details of a persisted association between a Dashboard Client and a Google Ads Advertiser account.</summary>
public class GoogleAdsAccountAssociationDto
{
    public int PlatformId { get; set; }
    public int ClientId { get; set; }
    public string ClientName { get; set; } = null!;
    public string CustomerId { get; set; } = null!;
    public string FormattedCustomerId { get; set; } = null!;
    public string AccountName { get; set; } = null!;
    public string? LoginCustomerId { get; set; }
    public string Currency { get; set; } = null!;
    public string Status { get; set; } = null!;
    public int GoogleAdsConnectionId { get; set; }
}

/// <summary>Outcome of associating a Google Ads customer account with a Dashboard Client.</summary>
public class SelectGoogleAdsAccountResultDto
{
    public bool Success { get; set; }
    public string? ErrorCode { get; set; }
    public string Message { get; set; } = null!;
    public GoogleAdsAccountAssociationDto? Association { get; set; }

    public static SelectGoogleAdsAccountResultDto Ok(GoogleAdsAccountAssociationDto association, string message = "Google Ads account associated with client successfully.") =>
        new() { Success = true, Message = message, Association = association };

    public static SelectGoogleAdsAccountResultDto Fail(string errorCode, string message) =>
        new() { Success = false, ErrorCode = errorCode, Message = message };
}

/// <summary>Status of the authenticated user's Google Ads OAuth connection and linked Client accounts.</summary>
public class GoogleAdsConnectionStatusDto
{
    public bool Connected { get; set; }
    public DateTimeOffset? ConnectedAt { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }
    public List<GoogleAdsAccountAssociationDto> LinkedAccounts { get; set; } = new();
}

/// <summary>Outcome of disconnecting a single Dashboard Client's Google Ads account association (without revoking user OAuth).</summary>
public class DisconnectGoogleAdsClientResultDto
{
    public bool Success { get; set; }
    public string? ErrorCode { get; set; }
    public string Message { get; set; } = null!;
    public int ClientId { get; set; }

    public static DisconnectGoogleAdsClientResultDto Ok(int clientId, string message = "Google Ads account disconnected from client successfully.") =>
        new() { Success = true, ClientId = clientId, Message = message };

    public static DisconnectGoogleAdsClientResultDto Fail(int clientId, string errorCode, string message) =>
        new() { Success = false, ClientId = clientId, ErrorCode = errorCode, Message = message };
}
