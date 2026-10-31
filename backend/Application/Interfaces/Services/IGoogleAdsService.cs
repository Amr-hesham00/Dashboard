using Dashboard.Application.DTOs;

namespace Dashboard.Application.Interfaces.Services;

/// <summary>
/// Discovers Google Ads customer and manager accounts accessible to an authenticated Dashboard user's
/// OAuth connection, and validates and persists associations between selected Google Ads advertiser
/// accounts and Dashboard Clients.
/// </summary>
public interface IGoogleAdsService
{
    /// <summary>
    /// Returns the authenticated user's Google Ads OAuth connection status and any associated Client platforms.
    /// </summary>
    Task<GoogleAdsConnectionStatusDto> GetConnectionStatusAsync(
        string userId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Discovers all Google Ads accounts accessible to the authenticated user's OAuth connection,
    /// including child accounts under Manager (MCC) accounts, deduplicated and classified into
    /// Advertiser vs Manager accounts.
    /// </summary>
    Task<GoogleAdsDiscoveryResultDto> DiscoverAccessibleAccountsAsync(
        string userId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Validates that the authenticated user can access both the specified Dashboard Client and the
    /// specified Google Ads Advertiser account (rejecting Manager accounts and inaccessible Customer IDs),
    /// and persists the association on the Client's GoogleAds Platform record.
    /// </summary>
    Task<SelectGoogleAdsAccountResultDto> AssociateAccountWithClientAsync(
        string userId,
        string? userRole,
        SelectGoogleAdsAccountRequestDto request,
        CancellationToken cancellationToken = default);
}

