using Dashboard.Application.DTOs;

namespace Dashboard.Application.Interfaces.Services;

/// <summary>
/// Service interface for discovering accessible Google Ads customer accounts,
/// linking selected advertiser accounts to Dashboard Clients, and synchronizing
/// Google Ads account hierarchy and daily performance metrics.
/// </summary>
public interface IGoogleAdsService
{
    /// <summary>
    /// Returns the authenticated user's Google Ads OAuth connection status
    /// and the list of currently linked Dashboard client accounts.
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
        SelectGoogleAdsAccountRequestDto request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Deactivates/clears only the specified Dashboard Client's Google Ads account association,
    /// without revoking or deleting the user's Google OAuth connection or affecting other clients.
    /// </summary>
    Task<DisconnectGoogleAdsClientResultDto> DisconnectClientAccountAsync(
        string userId,
        int clientId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Synchronizes one specified Google Ads platform belonging to one specified Dashboard client.
    /// Handles initial 30-day import, reconnection from the last successful sync date,
    /// normal incremental sync, and weekly 30-day backfill when due.
    /// </summary>
    Task<PlatformSyncResultDto> SynchronizePlatformAsync(
        int clientId,
        int platformId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Synchronizes one specified Google Ads platform by platform ID.
    /// </summary>
    Task<PlatformSyncResultDto> SynchronizePlatformAsync(
        int platformId,
        CancellationToken cancellationToken = default);
}
