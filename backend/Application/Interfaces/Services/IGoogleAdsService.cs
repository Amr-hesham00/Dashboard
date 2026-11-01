using Dashboard.Application.DTOs;

namespace Dashboard.Application.Interfaces.Services;

/// <summary>
/// Discovers Google Ads customer accounts (including Manager/MCC hierarchies) using the
/// authenticated user's stored OAuth credentials and associates selected Advertiser accounts
/// with Dashboard Clients.
/// </summary>
public interface IGoogleAdsService
{
    /// <summary>
    /// Returns the authenticated user's Google OAuth connection status and any currently linked
    /// Dashboard Client Google Ads accounts.
    /// </summary>
    Task<GoogleAdsConnectionStatusDto> GetConnectionStatusAsync(
        string userId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Discovers all Google Ads customer accounts accessible to the authenticated user's Google identity,
    /// including directly accessible accounts and accounts linked directly under an accessible Manager (MCC) account.
    /// </summary>
    Task<GoogleAdsDiscoveryResultDto> DiscoverAccessibleAccountsAsync(
        string userId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Validates that the authenticated user can access the specified Google Ads Advertiser account
    /// and associates it with the specified Dashboard Client (owned by the user).
    /// </summary>
    Task<SelectGoogleAdsAccountResultDto> AssociateAccountWithClientAsync(
        string userId,
        string? userRole,
        SelectGoogleAdsAccountRequestDto request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Deactivates/clears only the specified Dashboard Client's Google Ads account association,
    /// without revoking or deleting the user's Google OAuth connection or affecting other clients.
    /// </summary>
    Task<DisconnectGoogleAdsClientResultDto> DisconnectClientAccountAsync(
        string userId,
        string? userRole,
        int clientId,
        CancellationToken cancellationToken = default);
}
