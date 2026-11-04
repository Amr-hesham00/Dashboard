using Dashboard.Application.DTOs;
using Dashboard.Application.Interfaces;
using Dashboard.Application.Interfaces.Services;
using Dashboard.Domain.Entities;
using Dashboard.Domain.Enums;
using Google.Ads.Gax.Config;
using Google.Ads.GoogleAds.Config;
using Google.Ads.GoogleAds.Lib;
using Google.Ads.GoogleAds.V26.Enums;
using Google.Ads.GoogleAds.V26.Errors;
using Grpc.Core;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Collections.Concurrent;
using System.Globalization;

namespace Dashboard.Application.Services;

/// <summary>
/// Implements Google Ads customer account discovery, Client association, and read-only
/// GAQL data retrieval, persistence, incremental synchronization, and weekly backfill.
/// </summary>
public class GoogleAdsService : IGoogleAdsService
{
    public const int InitialImportDays = 30;
    public const int BackfillWindowDays = 30;
    public const int BackfillIntervalDays = 7;
    public const int MaxDateChunkDays = 30;
    private const int MaxRetryAttempts = 3;

    private static readonly ConcurrentDictionary<string, SemaphoreSlim> PlatformSyncLocks = new(StringComparer.Ordinal);

    private const string DirectAndMccAdvertiserQuery = @"
        SELECT
            customer_client.id,
            customer_client.descriptive_name,
            customer_client.manager,
            customer_client.level,
            customer_client.currency_code
        FROM customer_client
        WHERE customer_client.level <= 1
          AND customer_client.manager = FALSE";

    private const string AccountDetailsQuery = @"
        SELECT
            customer.id,
            customer.descriptive_name,
            customer.currency_code,
            customer.time_zone
        FROM customer
        LIMIT 1";

    private const string CampaignsQuery = @"
        SELECT
            campaign.id,
            campaign.name,
            campaign.status,
            campaign.advertising_channel_type,
            campaign.start_date_time,
            campaign.end_date_time
        FROM campaign";

    private const string AdGroupsQuery = @"
        SELECT
            ad_group.id,
            ad_group.name,
            ad_group.status,
            ad_group.type,
            campaign.id
        FROM ad_group";

    private const string AdsQuery = @"
        SELECT
            ad_group_ad.ad.id,
            ad_group_ad.ad.name,
            ad_group_ad.ad.type,
            ad_group_ad.ad.final_urls,
            ad_group_ad.ad.responsive_search_ad.headlines,
            ad_group_ad.ad.responsive_search_ad.descriptions,
            ad_group_ad.ad.expanded_text_ad.headline_part1,
            ad_group_ad.ad.expanded_text_ad.description,
            ad_group_ad.status,
            ad_group_ad.policy_summary.approval_status,
            ad_group.id,
            campaign.id
        FROM ad_group_ad";

    private readonly IGoogleOAuthService _googleOAuthService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IConfiguration _configuration;
    private readonly TimeProvider _timeProvider;
    private readonly ILogger<GoogleAdsService> _logger;

    public GoogleAdsService(
        IGoogleOAuthService googleOAuthService,
        IUnitOfWork unitOfWork,
        IConfiguration configuration,
        TimeProvider timeProvider,
        ILogger<GoogleAdsService> logger)
    {
        _googleOAuthService = googleOAuthService;
        _unitOfWork = unitOfWork;
        _configuration = configuration;
        _timeProvider = timeProvider;
        _logger = logger;
    }

    public async Task<GoogleAdsConnectionStatusDto> GetConnectionStatusAsync(
        string userId,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(userId))
            throw new ArgumentException("A Dashboard user ID is required.", nameof(userId));

        var connection = await _unitOfWork.OAuthConnection.GetByUserIdAsync(userId, PlatformType.GoogleAds);
        if (connection is null || string.IsNullOrEmpty(connection.RefreshTokenEncrypted))
        {
            return new GoogleAdsConnectionStatusDto { Connected = false };
        }

        var linkedPlatforms = await _unitOfWork.Platform.GetByOAuthConnectionIdAsync(connection.Id);
        var linkedDtos = linkedPlatforms
            .Where(p => p.PlatformType == PlatformType.GoogleAds &&
                        p.Status == PlatformStatus.Connected &&
                        !string.IsNullOrEmpty(p.ExternalAccountId))
            .Select(p =>
            {
                var formattedCustomerId = FormatCustomerId(p.ExternalAccountId!);
                return new GoogleAdsAccountAssociationDto
                {
                    PlatformId = p.Id,
                    ClientId = p.ClientId,
                    ClientName = p.Client?.CompanyName ?? $"Client #{p.ClientId}",
                    CustomerId = p.ExternalAccountId!,
                    FormattedCustomerId = formattedCustomerId,
                    AccountName = !string.IsNullOrWhiteSpace(p.AccountName)
                        ? p.AccountName!
                        : $"Google Ads Account ({formattedCustomerId})",
                    LoginCustomerId = p.ManagerAccountId,
                    Currency = p.Currency.ToString(),
                    TimeZone = p.TimeZone,
                    Status = p.Status.ToString(),
                    GoogleAdsConnectionId = p.OAuthConnectionId ?? connection.Id,
                    LastSyncedAt = p.LastSyncedAt,
                    LastBackfillAt = p.LastBackfillAt
                };
            })
            .ToList();

        return new GoogleAdsConnectionStatusDto
        {
            Connected = true,
            ConnectedAt = connection.CreatedAt,
            UpdatedAt = connection.UpdatedAt,
            LinkedAccounts = linkedDtos
        };
    }

    public async Task<GoogleAdsDiscoveryResultDto> DiscoverAccessibleAccountsAsync(
        string userId,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(userId))
            throw new ArgumentException("A Dashboard user ID is required.", nameof(userId));

        // 1. Resolve active OAuth credentials
        var credentials = await _googleOAuthService.GetValidCredentialsAsync(userId, cancellationToken);
        if (!credentials.Success || string.IsNullOrEmpty(credentials.RefreshToken))
        {
            return new GoogleAdsDiscoveryResultDto
            {
                Success = false,
                Connected = credentials.ErrorCode != GoogleOAuthErrorCodes.NotConnected,
                ErrorCode = credentials.ErrorCode ?? GoogleOAuthErrorCodes.NotConnected,
                Message = credentials.ErrorCode == GoogleOAuthErrorCodes.NotConnected
                    ? "No active Google Ads connection found. Please connect your Google Ads account first."
                    : "Google Ads authorization is invalid or expired. Please reconnect your Google Ads account."
            };
        }

        // 2. Discover accessible customer resource names
        IReadOnlyList<string> accessibleResourceNames;
        try
        {
            accessibleResourceNames = await ListAccessibleCustomerResourceNamesAsync(
                credentials.RefreshToken,
                credentials.AccessToken,
                cancellationToken);
        }
        catch (Exception ex) when (ex is GoogleAdsException or RpcException or InvalidOperationException)
        {
            _logger.LogWarning("Failed to list accessible Google Ads customers for user {UserId}: {ExceptionType}.",
                userId, ex.GetType().Name);
            return new GoogleAdsDiscoveryResultDto
            {
                Success = false,
                Connected = true,
                ErrorCode = GoogleOAuthErrorCodes.DiscoveryFailed,
                Message = "Failed to retrieve accessible Google Ads customer accounts from Google Ads API."
            };
        }

        var discoveredByCustomerId = new Dictionary<string, GoogleAdsCustomerAccountDto>(StringComparer.Ordinal);
        var accessibleCustomerIds = accessibleResourceNames
            .Select(NormalizeCustomerId)
            .Where(id => !string.IsNullOrEmpty(id))
            .Select(id => id!)
            .Distinct(StringComparer.Ordinal)
            .ToList();

        // 3. Query direct advertiser accounts (level <= 1, manager = false)
        foreach (var accessibleCustomerId in accessibleCustomerIds)
        {
            IReadOnlyList<GoogleAdsCustomerAccountDto> directAccounts;
            try
            {
                directAccounts = await QueryDirectAdvertiserAccountsAsync(
                    credentials.RefreshToken,
                    credentials.AccessToken,
                    accessibleCustomerId,
                    cancellationToken);
            }
            catch (Exception ex) when (ex is GoogleAdsException or RpcException)
            {
                _logger.LogWarning(
                    "Could not query customer_client for accessible customer {CustomerId} for user {UserId}: {ExceptionType}.",
                    accessibleCustomerId, userId, ex.GetType().Name);
                continue;
            }

            foreach (var account in directAccounts)
            {
                if (account.IsManager || account.Level > 1)
                    continue;

                AddOrUpdateDiscoveredAccount(discoveredByCustomerId, account);
            }
        }

        // 4. Cross-reference with existing linked Platforms for current client associations
        if (credentials.ConnectionId.HasValue)
        {
            var linkedPlatforms = await _unitOfWork.Platform.GetByOAuthConnectionIdAsync(credentials.ConnectionId.Value);
            foreach (var platform in linkedPlatforms)
            {
                if (platform.PlatformType == PlatformType.GoogleAds &&
                    platform.Status == PlatformStatus.Connected &&
                    !string.IsNullOrEmpty(platform.ExternalAccountId) &&
                    discoveredByCustomerId.TryGetValue(platform.ExternalAccountId, out var dto))
                {
                    dto.AssociatedClientId = platform.ClientId;
                    dto.AssociatedClientName = platform.Client?.CompanyName;
                }
            }
        }

        // 5. Order alphabetically by account name
        var accounts = discoveredByCustomerId.Values
            .OrderBy(a => a.DescriptiveName, StringComparer.OrdinalIgnoreCase)
            .ThenBy(a => a.CustomerId, StringComparer.Ordinal)
            .ToList();

        _logger.LogInformation(
            "Discovered {AdvertiserCount} selectable Google Ads advertiser accounts for user {UserId}.",
            accounts.Count,
            userId);

        return new GoogleAdsDiscoveryResultDto
        {
            Success = true,
            Connected = true,
            Accounts = accounts
        };
    }

    public async Task<SelectGoogleAdsAccountResultDto> AssociateAccountWithClientAsync(
        string userId,
        SelectGoogleAdsAccountRequestDto request,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(userId))
            throw new ArgumentException("A Dashboard user ID is required.", nameof(userId));

        if (request is null)
            throw new ArgumentNullException(nameof(request));

        // 1. Validate Customer ID
        var normalizedCustomerId = NormalizeCustomerId(request.CustomerId);
        if (string.IsNullOrEmpty(normalizedCustomerId))
        {
            return SelectGoogleAdsAccountResultDto.Fail(
                GoogleOAuthErrorCodes.InvalidCustomerId,
                "A valid numeric Google Ads Customer ID is required.");
        }

        // 2. Validate client ownership / authorization
        var client = await _unitOfWork.Client.GetById(request.ClientId);
        if (client is null)
        {
            return SelectGoogleAdsAccountResultDto.Fail(
                GoogleOAuthErrorCodes.ClientNotFound,
                $"Dashboard Client with ID '{request.ClientId}' was not found.");
        }

        if (!string.Equals(client.ManagerId, userId, StringComparison.Ordinal))
        {
            _logger.LogWarning(
                "User {UserId} attempted to associate a Google Ads account with unauthorized Client {ClientId} (owned by {ManagerId}).",
                userId, client.Id, client.ManagerId);
            return SelectGoogleAdsAccountResultDto.Fail(
                GoogleOAuthErrorCodes.UnauthorizedClient,
                "You do not have permission to associate a Google Ads account with this Dashboard Client.");
        }

        // 3. Ensure user has an active Google Ads connection
        var connection = await _unitOfWork.OAuthConnection.GetByUserIdAsync(userId, PlatformType.GoogleAds);
        if (connection is null || string.IsNullOrEmpty(connection.RefreshTokenEncrypted))
        {
            return SelectGoogleAdsAccountResultDto.Fail(
                GoogleOAuthErrorCodes.NotConnected,
                "No active Google Ads connection found for your user account. Please connect Google Ads first.");
        }

        // 4. Validate account accessibility via discovery
        var discovery = await DiscoverAccessibleAccountsAsync(userId, cancellationToken);
        if (!discovery.Success)
        {
            return SelectGoogleAdsAccountResultDto.Fail(
                discovery.ErrorCode ?? GoogleOAuthErrorCodes.DiscoveryFailed,
                discovery.Message ?? "Could not validate Google Ads account access.");
        }

        var matchedAccount = discovery.Accounts
            .FirstOrDefault(a => string.Equals(a.CustomerId, normalizedCustomerId, StringComparison.Ordinal));

        if (matchedAccount is null)
        {
            _logger.LogWarning(
                "User {UserId} attempted to associate inaccessible Google Ads Customer ID {CustomerId} with Client {ClientId}.",
                userId, normalizedCustomerId, client.Id);
            return SelectGoogleAdsAccountResultDto.Fail(
                GoogleOAuthErrorCodes.UnauthorizedCustomerAccount,
                $"Google Ads account '{FormatCustomerId(normalizedCustomerId)}' is not an accessible advertiser account for your Google Ads connection.");
        }

        // 5. Prevent linking the same account to multiple clients
        var existingByAccountId = await _unitOfWork.Platform.GetByExternalAccountIdAsync(
            PlatformType.GoogleAds,
            normalizedCustomerId);

        if (existingByAccountId is not null && existingByAccountId.ClientId != client.Id)
        {
            var otherClientName = existingByAccountId.Client?.CompanyName ?? $"Client #{existingByAccountId.ClientId}";
            return SelectGoogleAdsAccountResultDto.Fail(
                GoogleOAuthErrorCodes.CustomerAlreadyLinked,
                $"Google Ads account '{matchedAccount.FormattedCustomerId}' is already associated with '{otherClientName}'.");
        }

        // 6. Validate currency is supported by our system
        if (!Enum.TryParse<Currency>(matchedAccount.CurrencyCode, ignoreCase: true, out var currency))
        {
            _logger.LogWarning(
                "Cannot connect Google Ads account '{CustomerId}' with client '{CompanyName}' due to unsupported currency '{CurrencyCode}'.",
                matchedAccount.CustomerId,
                client.CompanyName,
                matchedAccount.CurrencyCode);

            return SelectGoogleAdsAccountResultDto.Fail(
                GoogleOAuthErrorCodes.UnsupportedCustomerCurrency,
                $"Google Ads account '{matchedAccount.FormattedCustomerId}' has an unsupported currency '{matchedAccount.CurrencyCode}'.");
        }

        // 7. Persist association on the Client's Platform record (preserving LastSyncedAt & LastBackfillAt on reconnection)
        var platform = await _unitOfWork.Platform.GetByClientAndTypeAsync(client.Id, PlatformType.GoogleAds);
        if (platform is null)
        {
            platform = new Platform
            {
                ClientId = client.Id,
                PlatformType = PlatformType.GoogleAds,
                CreatedAt = _timeProvider.GetUtcNow()
            };
            await _unitOfWork.Platform.Create(platform);
        }
        else
        {
            _unitOfWork.Platform.Update(platform);
        }

        platform.Status = PlatformStatus.Connected;
        platform.Currency = currency;
        platform.ExternalAccountId = matchedAccount.CustomerId;
        platform.AccountName = matchedAccount.DescriptiveName;
        platform.ManagerAccountId = matchedAccount.ManagerCustomerId;
        platform.OAuthConnectionId = connection.Id;

        await _unitOfWork.Complete();

        _logger.LogInformation(
            "Associated Google Ads advertiser account {CustomerId} (login manager: {LoginCustomerId}) with Client {ClientId} for user {UserId}.",
            matchedAccount.CustomerId,
            matchedAccount.ManagerCustomerId ?? "direct",
            client.Id,
            userId);

        var associationDto = new GoogleAdsAccountAssociationDto
        {
            PlatformId = platform.Id,
            ClientId = client.Id,
            ClientName = client.CompanyName,
            CustomerId = matchedAccount.CustomerId,
            FormattedCustomerId = matchedAccount.FormattedCustomerId,
            AccountName = matchedAccount.DescriptiveName,
            LoginCustomerId = matchedAccount.ManagerCustomerId,
            Currency = platform.Currency.ToString(),
            TimeZone = platform.TimeZone,
            Status = platform.Status.ToString(),
            GoogleAdsConnectionId = connection.Id,
            LastSyncedAt = platform.LastSyncedAt,
            LastBackfillAt = platform.LastBackfillAt
        };

        return SelectGoogleAdsAccountResultDto.Ok(associationDto);
    }

    public async Task<DisconnectGoogleAdsClientResultDto> DisconnectClientAccountAsync(
        string userId,
        int clientId,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(userId))
            throw new ArgumentException("A Dashboard user ID is required.", nameof(userId));

        var client = await _unitOfWork.Client.GetById(clientId);
        if (client is null)
        {
            return DisconnectGoogleAdsClientResultDto.Fail(
                clientId,
                GoogleOAuthErrorCodes.ClientNotFound,
                $"Dashboard Client with ID '{clientId}' was not found.");
        }

        if (!string.Equals(client.ManagerId, userId, StringComparison.Ordinal))
        {
            _logger.LogWarning(
                "User {UserId} attempted to disconnect Google Ads account from unauthorized Client {ClientId} (owned by {ManagerId}).",
                userId, client.Id, client.ManagerId);
            return DisconnectGoogleAdsClientResultDto.Fail(
                clientId,
                GoogleOAuthErrorCodes.UnauthorizedClient,
                "You do not have permission to modify this Dashboard Client's platform connections.");
        }

        var platform = await _unitOfWork.Platform.GetByClientAndTypeAsync(client.Id, PlatformType.GoogleAds);
        if (platform is not null)
        {
            // Preserve LastSyncedAt, LastBackfillAt, and all synchronized database records so reconnection resumes cleanly
            platform.Status = PlatformStatus.NotConnected;
            platform.ExternalAccountId = null;
            platform.AccountName = null;
            platform.ManagerAccountId = null;
            platform.OAuthConnectionId = null;
            _unitOfWork.Platform.Update(platform);
            await _unitOfWork.Complete();
        }

        _logger.LogInformation(
            "Disconnected Google Ads account association for Client {ClientId} by user {UserId} (user OAuth connection and sync history preserved).",
            client.Id,
            userId);

        return DisconnectGoogleAdsClientResultDto.Ok(
            client.Id,
            $"Google Ads account disconnected from '{client.CompanyName}'.");
    }

    // ─── Simplified Google Ads Synchronization Implementation ───────────────────────

    public Task<PlatformSyncResultDto> SynchronizePlatformAsync(
        int platformId,
        CancellationToken cancellationToken = default)
    {
        return SynchronizePlatformAsync(0, platformId, cancellationToken);
    }

    /// <summary>
    /// Synchronizes one specified Google Ads platform belonging to one specified Dashboard client.
    /// Flow:
    /// 1. Receive Dashboard Client ID and Google Ads Platform ID.
    /// 2. Verify platform belongs to client and is a connected Google Ads account.
    /// 3. Retrieve valid OAuth credentials and Customer ID.
    /// 4. Retrieve missing Google Ads metadata (Account, Campaigns, Ad Groups, Ads).
    /// 5. Calculate date range (normal incremental sync + weekly 30-day backfill when due).
    /// 6. Retrieve daily performance metrics in 30-day chunks.
    /// 7. Persist or update the retrieved hierarchy and metrics in the database.
    /// 8. Update sync timestamps and return result.
    /// </summary>
    public async Task<PlatformSyncResultDto> SynchronizePlatformAsync(
        int clientId,
        int platformId,
        CancellationToken cancellationToken = default)
    {
        // 1. Verify platform exists, belongs to the specified client, and is Google Ads
        var platform = await _unitOfWork.Platform.GetByIdWithDetailsAsync(platformId)
                       ?? await _unitOfWork.Platform.GetById(platformId);

        if (platform is null)
        {
            return PlatformSyncResultDto.Fail(
                platformId,
                clientId,
                PlatformType.GoogleAds,
                GoogleOAuthErrorCodes.PlatformNotFound,
                $"Platform with ID '{platformId}' was not found.");
        }

        if (clientId > 0 && platform.ClientId != clientId)
        {
            return PlatformSyncResultDto.Fail(
                platformId,
                clientId,
                PlatformType.GoogleAds,
                GoogleOAuthErrorCodes.UnauthorizedClient,
                $"Platform with ID '{platformId}' does not belong to Client '{clientId}'.");
        }

        if (platform.PlatformType != PlatformType.GoogleAds)
        {
            return PlatformSyncResultDto.Fail(
                platform.Id,
                platform.ClientId,
                platform.PlatformType,
                GoogleOAuthErrorCodes.PlatformNotConnected,
                "Only Google Ads platform synchronization is supported.");
        }

        if (platform.Status != PlatformStatus.Connected)
        {
            return PlatformSyncResultDto.Fail(
                platform.Id,
                platform.ClientId,
                platform.PlatformType,
                GoogleOAuthErrorCodes.PlatformNotConnected,
                $"Google Ads platform for Client '{platform.ClientId}' is not connected.");
        }

        var customerId = NormalizeCustomerId(platform.ExternalAccountId);
        if (string.IsNullOrEmpty(customerId))
        {
            return await MarkPlatformSyncFailedAsync(
                platform,
                GoogleOAuthErrorCodes.InvalidCustomerId,
                "Platform does not have a valid Google Ads Customer ID.");
        }

        // 2. Concurrency protection: prevent repeated and concurrent(10-min intervals) synchronization of the same platform
        var now = _timeProvider.GetUtcNow();
        if (platform.LastSyncStatus == "InProgress" && platform.LastSyncedAt.HasValue && (now - platform.LastSyncedAt.Value) < TimeSpan.FromMinutes(10))
        {
            return PlatformSyncResultDto.Fail(
                platform.Id,
                platform.ClientId,
                platform.PlatformType,
                GoogleOAuthErrorCodes.SyncAlreadyInProgress,
                "Synchronization is already in progress for this Google Ads platform.",
                skippedBecauseRunning: true);
        }

        var lockKey = $"googleads:{customerId}";
        var syncLock = PlatformSyncLocks.GetOrAdd(lockKey, _ => new SemaphoreSlim(1, 1));
        if (!await syncLock.WaitAsync(0, cancellationToken))
        {
            return PlatformSyncResultDto.Fail(
                platform.Id,
                platform.ClientId,
                platform.PlatformType,
                GoogleOAuthErrorCodes.SyncAlreadyInProgress,
                "Synchronization is already in progress for this Google Ads platform.",
                skippedBecauseRunning: true);
        }

        try
        {
            // Mark InProgress in database to ensure cross-instance visibility
            platform.LastSyncStatus = "InProgress";
            _unitOfWork.Platform.Update(platform);
            await _unitOfWork.Complete();

            // 3. Resolve OAuth user & valid access/refresh tokens
            var userId = platform.OAuthConnection?.UserId;
            if (string.IsNullOrWhiteSpace(userId) && platform.OAuthConnectionId.HasValue)
            {
                var conn = await _unitOfWork.OAuthConnection.GetById(platform.OAuthConnectionId.Value);
                userId = conn?.UserId;
            }

            if (string.IsNullOrWhiteSpace(userId))
            {
                return await MarkPlatformSyncFailedAsync(
                    platform,
                    GoogleOAuthErrorCodes.NotConnected,
                    "No OAuth user is associated with this Google Ads platform.");
            }

            var credentials = await _googleOAuthService.GetValidCredentialsAsync(userId, cancellationToken);
            if (!credentials.Success || string.IsNullOrEmpty(credentials.RefreshToken))
            {
                var errCode = credentials.ErrorCode ?? GoogleOAuthErrorCodes.AuthorizationFailed;
                return await MarkPlatformSyncFailedAsync(
                    platform,
                    errCode,
                    "Google Ads OAuth credentials are invalid, expired, or revoked.");
            }

            var loginCustomerId = NormalizeCustomerId(platform.ManagerAccountId);

            // 4. Retrieve Account Information, Campaigns, Ad Groups, and Ads (with transient retry)
            GoogleAdsAccountDetailsDto? accountDetails;
            IReadOnlyList<GoogleAdsCampaignRecordDto> campaignRecords;
            IReadOnlyList<GoogleAdsAdGroupRecordDto> adGroupRecords;
            IReadOnlyList<GoogleAdsAdRecordDto> adRecords;

            try
            {
                accountDetails = await ExecuteWithRetryAsync(
                    ct => QueryAccountDetailsAsync(credentials.RefreshToken, credentials.AccessToken, customerId, loginCustomerId, ct),
                    customerId,
                    "QueryAccountDetails",
                    cancellationToken);

                campaignRecords = await ExecuteWithRetryAsync(
                    ct => QueryCampaignsAsync(credentials.RefreshToken, credentials.AccessToken, customerId, loginCustomerId, ct),
                    customerId,
                    "QueryCampaigns",
                    cancellationToken) ?? Array.Empty<GoogleAdsCampaignRecordDto>();

                adGroupRecords = await ExecuteWithRetryAsync(
                    ct => QueryAdGroupsAsync(credentials.RefreshToken, credentials.AccessToken, customerId, loginCustomerId, ct),
                    customerId,
                    "QueryAdGroups",
                    cancellationToken) ?? Array.Empty<GoogleAdsAdGroupRecordDto>();

                adRecords = await ExecuteWithRetryAsync(
                    ct => QueryAdsAsync(credentials.RefreshToken, credentials.AccessToken, customerId, loginCustomerId, ct),
                    customerId,
                    "QueryAds",
                    cancellationToken) ?? Array.Empty<GoogleAdsAdRecordDto>();
            }
            catch (Exception ex) when (ex is GoogleAdsException or RpcException or InvalidOperationException or HttpRequestException)
            {
                var errorCode = ClassifyGoogleAdsException(ex);
                return await MarkPlatformSyncFailedAsync(
                    platform,
                    errorCode,
                    $"Failed to retrieve Google Ads account data ({errorCode}).");////////////
            }

            // Apply account details and preserve original currency
            if (accountDetails is not null)
            {
                if (!string.IsNullOrWhiteSpace(accountDetails.CurrencyCode) &&
                    Enum.TryParse<Currency>(accountDetails.CurrencyCode, ignoreCase: true, out var accountCurrency))
                {
                    platform.Currency = accountCurrency;
                }
                if (!string.IsNullOrWhiteSpace(accountDetails.DescriptiveName))
                {
                    platform.AccountName = accountDetails.DescriptiveName;
                }
                if (!string.IsNullOrWhiteSpace(accountDetails.TimeZone))
                {
                    platform.TimeZone = accountDetails.TimeZone;
                }
            }

            // 5. Calculate date range (normal incremental sync + weekly 30-day backfill)
            var today = DateOnly.FromDateTime(now.UtcDateTime);
            bool isInitialImport = !platform.LastSyncedAt.HasValue;
            bool isBackfillDue = isInitialImport ||
                                !platform.LastBackfillAt.HasValue ||
                                (now - platform.LastBackfillAt.Value) >= TimeSpan.FromDays(7);

            DateOnly startDate;
            if (isInitialImport)
            {
                startDate = today.AddDays(-30);
            }
            else if (isBackfillDue)
            {
                var lastSyncDate = DateOnly.FromDateTime(platform.LastSyncedAt!.Value.UtcDateTime);
                var backfillStart = today.AddDays(-30);
                startDate = lastSyncDate < backfillStart ? lastSyncDate : backfillStart;
            }
            else
            {
                startDate = DateOnly.FromDateTime(platform.LastSyncedAt!.Value.UtcDateTime);
                if (startDate > today) startDate = today;
            }

            // 6. Retrieve daily performance metrics in 30-day chunks
            var metricRows = new List<GoogleAdsDailyMetricRecordDto>();
            try
            {
                var cursor = startDate;
                while (cursor <= today)
                {
                    var chunkEnd = cursor.AddDays(30);
                    if (chunkEnd > today) chunkEnd = today;

                    var chunk = await ExecuteWithRetryAsync(
                        ct => QueryDailyMetricsAsync(credentials.RefreshToken, credentials.AccessToken, customerId, loginCustomerId, cursor, chunkEnd, ct),
                        customerId,
                        $"QueryDailyMetrics[{cursor:yyyy-MM-dd}..{chunkEnd:yyyy-MM-dd}]",
                        cancellationToken);

                    if (chunk is { Count: > 0 })
                    {
                        metricRows.AddRange(chunk);
                    }

                    cursor = chunkEnd.AddDays(1);
                }
            }
            catch (Exception ex) when (ex is GoogleAdsException or RpcException or InvalidOperationException or HttpRequestException)
            {
                var errorCode = ClassifyGoogleAdsException(ex);
                return await MarkPlatformSyncFailedAsync(
                    platform,
                    errorCode,
                    $"Failed to retrieve Google Ads daily metrics ({errorCode}).");
            }

            // 7. Persist Campaign -> AdSet -> Ad hierarchy and daily performance metrics
            var (campaignsSyncedCount, adSetsSyncedCount, adsSyncedCount, metricsUpsertedCount) =
                await PersistGoogleAdsDataAsync(
                    platform,
                    campaignRecords,
                    adGroupRecords,
                    adRecords,
                    metricRows,
                    startDate,
                    today,
                    now);

            // 8. Commit synchronization timestamps and successful state
            platform.LastSyncedAt = now;
            if (isBackfillDue)
            {
                platform.LastBackfillAt = now;
            }

            platform.LastSyncStatus = "Succeeded";
            platform.LastSyncError = null;
            _unitOfWork.Platform.Update(platform);
            await _unitOfWork.Complete();

            _logger.LogInformation(
                "Successfully synchronized Google Ads Platform {PlatformId} for Client {ClientId}: Campaigns={Campaigns}, AdSets={AdSets}, Ads={Ads}, Metrics={Metrics}, Dates={Start}..{End}, Initial={Initial}, Backfill={Backfill}.",
                platform.Id,
                platform.ClientId,
                campaignsSyncedCount,
                adSetsSyncedCount,
                adsSyncedCount,
                metricsUpsertedCount,
                startDate,
                today,
                isInitialImport,
                isBackfillDue);

            return new PlatformSyncResultDto
            {
                Success = true,
                PlatformId = platform.Id,
                ClientId = platform.ClientId,
                PlatformType = platform.PlatformType.ToString(),
                CustomerId = customerId,
                Currency = platform.Currency.ToString(),
                TimeZone = platform.TimeZone,
                IsInitialImport = isInitialImport,
                IsReconnectionSync = !isInitialImport,
                BackfillExecuted = isBackfillDue,
                CampaignsSynced = campaignsSyncedCount,
                AdSetsSynced = adSetsSyncedCount,
                AdsSynced = adsSyncedCount,
                DailyMetricsUpserted = metricsUpsertedCount,
                SyncedFromDate = startDate,
                SyncedToDate = today,
                LastSyncedAt = platform.LastSyncedAt,
                LastBackfillAt = platform.LastBackfillAt,
                Message = "Google Ads data synchronized successfully."
            };
        }
        finally
        {
            syncLock.Release();
        }
    }

    /// <summary>
    /// Direct database persistence: updates existing records, inserts new discoveries,
    /// preserves original currency without USD conversion, and avoids duplicate metrics.
    /// </summary>
    private async Task<(int Campaigns, int AdSets, int Ads, int Metrics)> PersistGoogleAdsDataAsync(
        Platform platform,
        IReadOnlyList<GoogleAdsCampaignRecordDto> incomingCampaigns,
        IReadOnlyList<GoogleAdsAdGroupRecordDto> incomingAdGroups,
        IReadOnlyList<GoogleAdsAdRecordDto> incomingAds,
        IReadOnlyList<GoogleAdsDailyMetricRecordDto> incomingMetrics,
        DateOnly startDate,
        DateOnly endDate,
        DateTimeOffset now)
    {
        // A. Upsert Campaigns
        var existingCampaigns = await _unitOfWork.Campaign.GetTrackedByPlatformIdAsync(platform.Id)
                                ?? new List<Campaign>();
        var campaignsByExtId = existingCampaigns
            .Where(c => !string.IsNullOrEmpty(c.ExternalId))
            .GroupBy(c => c.ExternalId!, StringComparer.Ordinal)
            .ToDictionary(g => g.Key, g => g.First(), StringComparer.Ordinal);

        foreach (var c in existingCampaigns)
        {
            c.Currency = platform.Currency;
        }

        int campaignsSynced = 0;
        foreach (var rec in incomingCampaigns.Where(r => !string.IsNullOrWhiteSpace(r.ExternalId)))
        {
            var extId = rec.ExternalId.Trim();
            var name = Truncate(string.IsNullOrWhiteSpace(rec.Name) ? $"Campaign #{extId}" : rec.Name.Trim(), 200);

            if (campaignsByExtId.TryGetValue(extId, out var camp))
            {
                camp.Name = name;
                camp.Status = rec.Status;
                camp.Objective = rec.Objective;
                camp.Currency = platform.Currency;
                if (rec.StartDate.HasValue) camp.StartDate = rec.StartDate.Value;
                camp.EndDate = rec.EndDate;
            }
            else
            {
                camp = new Campaign
                {
                    PlatformId = platform.Id,
                    ExternalId = extId,
                    Name = name,
                    Status = rec.Status,
                    Objective = rec.Objective,
                    Currency = platform.Currency,
                    StartDate = rec.StartDate ?? now,
                    EndDate = rec.EndDate,
                    CreatedAt = now
                };
                await _unitOfWork.Campaign.Create(camp);
                campaignsByExtId[extId] = camp;
            }
            campaignsSynced++;
        }
        await _unitOfWork.Complete();

        // B. Upsert AdSets (Ad Groups)
        var existingAdSets = await _unitOfWork.AdSet.GetTrackedByPlatformIdAsync(platform.Id)
                             ?? new List<AdSet>();
        var adSetsByExtId = existingAdSets
            .Where(a => !string.IsNullOrEmpty(a.ExternalId))
            .GroupBy(a => a.ExternalId!, StringComparer.Ordinal)
            .ToDictionary(g => g.Key, g => g.First(), StringComparer.Ordinal);

        int adSetsSynced = 0;
        foreach (var rec in incomingAdGroups.Where(r => !string.IsNullOrWhiteSpace(r.ExternalId) && !string.IsNullOrWhiteSpace(r.CampaignExternalId)))
        {
            var extId = rec.ExternalId.Trim();
            var campExtId = rec.CampaignExternalId.Trim();
            if (!campaignsByExtId.TryGetValue(campExtId, out var parentCamp))
                continue;

            var name = Truncate(string.IsNullOrWhiteSpace(rec.Name) ? $"Ad Group #{extId}" : rec.Name.Trim(), 200);
            var audience = Truncate(string.IsNullOrWhiteSpace(rec.AudienceType) ? "Search" : rec.AudienceType.Trim(), 100);

            if (adSetsByExtId.TryGetValue(extId, out var adSet))
            {
                adSet.CampaignId = parentCamp.Id;
                adSet.Name = name;
                adSet.Status = rec.Status;
                adSet.AudienceType = audience;
            }
            else
            {
                adSet = new AdSet
                {
                    CampaignId = parentCamp.Id,
                    ExternalId = extId,
                    Name = name,
                    AudienceType = audience,
                    AgeRange = "All",
                    Gender = AdSetGender.All,
                    Status = rec.Status,
                    StartDate = parentCamp.StartDate != default ? parentCamp.StartDate : now,
                    EndDate = parentCamp.EndDate
                };
                await _unitOfWork.AdSet.Create(adSet);
                adSetsByExtId[extId] = adSet;
            }
            adSetsSynced++;
        }
        await _unitOfWork.Complete();

        // C. Upsert Ads
        var existingAds = await _unitOfWork.Ad.GetTrackedByPlatformIdAsync(platform.Id)
                          ?? new List<Ad>();
        var adsByExtId = existingAds
            .Where(a => !string.IsNullOrEmpty(a.ExternalId))
            .GroupBy(a => a.ExternalId!, StringComparer.Ordinal)
            .ToDictionary(g => g.Key, g => g.First(), StringComparer.Ordinal);

        int adsSynced = 0;
        foreach (var rec in incomingAds.Where(r => !string.IsNullOrWhiteSpace(r.ExternalId) && !string.IsNullOrWhiteSpace(r.AdGroupExternalId)))
        {
            var extId = rec.ExternalId.Trim();
            var agExtId = rec.AdGroupExternalId.Trim();
            if (!adSetsByExtId.TryGetValue(agExtId, out var parentAdSet))
                continue;

            var headline = Truncate(!string.IsNullOrWhiteSpace(rec.Headline) ? rec.Headline.Trim() : $"Ad #{extId}", 200);
            var name = Truncate(!string.IsNullOrWhiteSpace(rec.Name) ? rec.Name.Trim() : headline, 200);

            if (adsByExtId.TryGetValue(extId, out var ad))
            {
                ad.Name = name;
                ad.Headline = headline;
                ad.Description = string.IsNullOrWhiteSpace(rec.Description) ? null : Truncate(rec.Description.Trim(), 1000);
                ad.CTA = string.IsNullOrWhiteSpace(rec.CTA) ? null : Truncate(rec.CTA.Trim(), 100);
                ad.MediaURL = string.IsNullOrWhiteSpace(rec.MediaUrl) ? null : Truncate(rec.MediaUrl.Trim(), 500);
                ad.MediaType = rec.MediaType ?? MediaType.Image;
                ad.Status = rec.Status;
            }
            else
            {
                ad = new Ad
                {
                    AdSetId = parentAdSet.Id,
                    ExternalId = extId,
                    Name = name,
                    Headline = headline,
                    Description = string.IsNullOrWhiteSpace(rec.Description) ? null : Truncate(rec.Description.Trim(), 1000),
                    CTA = string.IsNullOrWhiteSpace(rec.CTA) ? null : Truncate(rec.CTA.Trim(), 100),
                    MediaURL = string.IsNullOrWhiteSpace(rec.MediaUrl) ? null : Truncate(rec.MediaUrl.Trim(), 500),
                    MediaType = rec.MediaType ?? MediaType.Image,
                    Status = rec.Status,
                    CreatedAt = now
                };
                await _unitOfWork.Ad.Create(ad);
                adsByExtId[extId] = ad;
            }
            adsSynced++;
        }
        await _unitOfWork.Complete();

        // D. Upsert Daily Performance Metrics in Original Account Currency without duplicates
        int metricsUpserted = 0;
        if (incomingMetrics.Count > 0)
        {
            var existingMetrics = await _unitOfWork.AdDailyMetrics.GetTrackedByPlatformAndDateRangeAsync(platform.Id, startDate, endDate)
                                  ?? new List<AdDailyMetrics>();
            var metricsByAdAndDate = existingMetrics.ToDictionary(m => (m.AdId, m.Date), m => m);

            foreach (var rec in incomingMetrics)
            {
                if (string.IsNullOrWhiteSpace(rec.AdExternalId))
                    continue;

                if (!adsByExtId.TryGetValue(rec.AdExternalId.Trim(), out var ad) || ad.Id <= 0)
                    continue;

                // Store in original Google Ads currency (micros to standard decimal units)
                var spend = ConvertMicrosToCurrency(rec.CostMicros);
                var revenue = Math.Round(Math.Max(0.0, rec.ConversionsValue), 6);
                var impressions = (int)Math.Clamp(rec.Impressions, 0, int.MaxValue);
                var clicks = (int)Math.Clamp(rec.Clicks, 0, int.MaxValue);
                var conversions = (int)Math.Clamp((long)Math.Round(rec.Conversions), 0, int.MaxValue);

                if (metricsByAdAndDate.TryGetValue((ad.Id, rec.Date), out var existingMetric))
                {
                    existingMetric.Impressions = impressions;
                    existingMetric.Clicks = clicks;
                    existingMetric.Conversions = conversions;
                    existingMetric.Spend = spend;
                    existingMetric.Revenue = revenue;
                }
                else
                {
                    var newMetric = new AdDailyMetrics
                    {
                        AdId = ad.Id,
                        Date = rec.Date,
                        Impressions = impressions,
                        Clicks = clicks,
                        Conversions = conversions,
                        Spend = spend,
                        Revenue = revenue
                    };
                    await _unitOfWork.AdDailyMetrics.Create(newMetric);
                    metricsByAdAndDate[(ad.Id, rec.Date)] = newMetric;
                }

                metricsUpserted++;
            }
            await _unitOfWork.Complete();
        }

        return (campaignsSynced, adSetsSynced, adsSynced, metricsUpserted);
    }

    /// <summary>
    /// Converts Google Ads monetary values from micros (1,000,000 micros = 1 unit of original currency)
    /// into standard currency units without converting to USD or any other currency.
    /// </summary>
    public static double ConvertMicrosToCurrency(long micros)
    {
        if (micros <= 0)
            return 0.0;

        return (double)Math.Round(micros / 1_000_000m, 6, MidpointRounding.AwayFromZero);
    }

    // ─── Protected virtual Google Ads SDK operations (mockable in unit tests) ─────────

    protected virtual Task<IReadOnlyList<string>> ListAccessibleCustomerResourceNamesAsync(
        string refreshToken,
        string? accessToken,
        CancellationToken cancellationToken)
    {
        var client = CreateGoogleAdsClient(refreshToken, loginCustomerId: null);
        var customerService = client.GetService(Google.Ads.GoogleAds.Services.V26.CustomerService);
        var resourceNames = customerService.ListAccessibleCustomers();
        return Task.FromResult<IReadOnlyList<string>>(resourceNames ?? Array.Empty<string>());
    }

    protected virtual Task<IReadOnlyList<GoogleAdsCustomerAccountDto>> QueryDirectAdvertiserAccountsAsync(
        string refreshToken,
        string? accessToken,
        string accessibleCustomerId,
        CancellationToken cancellationToken)
    {
        var client = CreateGoogleAdsClient(refreshToken, loginCustomerId: accessibleCustomerId);
        var googleAdsService = client.GetService(Google.Ads.GoogleAds.Services.V26.GoogleAdsService);

        var results = new List<GoogleAdsCustomerAccountDto>();
        var response = googleAdsService.Search(accessibleCustomerId, DirectAndMccAdvertiserQuery);

        foreach (var row in response)
        {
            var cc = row.CustomerClient;
            if (cc is null || cc.Manager || cc.Level > 1)
                continue;

            var cid = cc.Id > 0
                ? cc.Id.ToString(CultureInfo.InvariantCulture)
                : NormalizeCustomerId(cc.ClientCustomer);

            if (string.IsNullOrEmpty(cid))
                continue;

            var formattedId = FormatCustomerId(cid);
            var displayName = !string.IsNullOrWhiteSpace(cc.DescriptiveName)
                ? cc.DescriptiveName
                : $"Google Ads Account ({formattedId})";

            results.Add(new GoogleAdsCustomerAccountDto
            {
                CustomerId = cid,
                FormattedCustomerId = formattedId,
                DescriptiveName = displayName,
                IsManager = false,
                CurrencyCode = string.IsNullOrWhiteSpace(cc.CurrencyCode) ? null : cc.CurrencyCode,
                ManagerCustomerId = cc.Level > 0 ? accessibleCustomerId : null,
                Level = cc.Level
            });
        }

        return Task.FromResult<IReadOnlyList<GoogleAdsCustomerAccountDto>>(results);
    }

    protected virtual Task<GoogleAdsAccountDetailsDto?> QueryAccountDetailsAsync(
        string refreshToken,
        string? accessToken,
        string customerId,
        string? loginCustomerId,
        CancellationToken cancellationToken)
    {
        var client = CreateGoogleAdsClient(refreshToken, loginCustomerId);
        var googleAdsService = client.GetService(Google.Ads.GoogleAds.Services.V26.GoogleAdsService);
        var response = googleAdsService.Search(customerId, AccountDetailsQuery);

        foreach (var row in response)
        {
            var cust = row.Customer;
            if (cust is null)
                continue;

            var cid = cust.Id > 0
                ? cust.Id.ToString(CultureInfo.InvariantCulture)
                : customerId;

            return Task.FromResult<GoogleAdsAccountDetailsDto?>(new GoogleAdsAccountDetailsDto
            {
                CustomerId = cid,
                DescriptiveName = !string.IsNullOrWhiteSpace(cust.DescriptiveName)
                    ? cust.DescriptiveName
                    : $"Google Ads Account ({FormatCustomerId(cid)})",
                CurrencyCode = cust.CurrencyCode ?? string.Empty,
                TimeZone = string.IsNullOrWhiteSpace(cust.TimeZone) ? null : cust.TimeZone
            });
        }

        return Task.FromResult<GoogleAdsAccountDetailsDto?>(null);
    }

    protected virtual Task<IReadOnlyList<GoogleAdsCampaignRecordDto>> QueryCampaignsAsync(
        string refreshToken,
        string? accessToken,
        string customerId,
        string? loginCustomerId,
        CancellationToken cancellationToken)
    {
        var client = CreateGoogleAdsClient(refreshToken, loginCustomerId);
        var googleAdsService = client.GetService(Google.Ads.GoogleAds.Services.V26.GoogleAdsService);
        var response = googleAdsService.Search(customerId, CampaignsQuery);

        var results = new List<GoogleAdsCampaignRecordDto>();
        foreach (var row in response)
        {
            var c = row.Campaign;
            if (c is null || c.Id <= 0)
                continue;

            var extId = c.Id.ToString(CultureInfo.InvariantCulture);
            results.Add(new GoogleAdsCampaignRecordDto
            {
                ExternalId = extId,
                Name = !string.IsNullOrWhiteSpace(c.Name) ? c.Name : $"Campaign #{extId}",
                Status = MapCampaignStatus(c.Status),
                Objective = MapCampaignObjective(c.AdvertisingChannelType),
                StartDate = ParseGoogleAdsDateTime(c.StartDateTime),
                EndDate = ParseGoogleAdsDateTime(c.EndDateTime)
            });
        }

        return Task.FromResult<IReadOnlyList<GoogleAdsCampaignRecordDto>>(results);
    }

    protected virtual Task<IReadOnlyList<GoogleAdsAdGroupRecordDto>> QueryAdGroupsAsync(
        string refreshToken,
        string? accessToken,
        string customerId,
        string? loginCustomerId,
        CancellationToken cancellationToken)
    {
        var client = CreateGoogleAdsClient(refreshToken, loginCustomerId);
        var googleAdsService = client.GetService(Google.Ads.GoogleAds.Services.V26.GoogleAdsService);
        var response = googleAdsService.Search(customerId, AdGroupsQuery);

        var results = new List<GoogleAdsAdGroupRecordDto>();
        foreach (var row in response)
        {
            var ag = row.AdGroup;
            var camp = row.Campaign;
            if (ag is null || ag.Id <= 0)
                continue;

            var campaignExtId = camp is { Id: > 0 }
                ? camp.Id.ToString(CultureInfo.InvariantCulture)
                : ExtractTrailingResourceId(ag.Campaign);

            if (string.IsNullOrEmpty(campaignExtId))
                continue;

            var extId = ag.Id.ToString(CultureInfo.InvariantCulture);
            results.Add(new GoogleAdsAdGroupRecordDto
            {
                ExternalId = extId,
                CampaignExternalId = campaignExtId,
                Name = !string.IsNullOrWhiteSpace(ag.Name) ? ag.Name : $"Ad Group #{extId}",
                Status = MapAdSetStatus(ag.Status),
                AudienceType = MapAdGroupAudienceType(ag.Type)
            });
        }

        return Task.FromResult<IReadOnlyList<GoogleAdsAdGroupRecordDto>>(results);
    }

    protected virtual Task<IReadOnlyList<GoogleAdsAdRecordDto>> QueryAdsAsync(
        string refreshToken,
        string? accessToken,
        string customerId,
        string? loginCustomerId,
        CancellationToken cancellationToken)
    {
        var client = CreateGoogleAdsClient(refreshToken, loginCustomerId);
        var googleAdsService = client.GetService(Google.Ads.GoogleAds.Services.V26.GoogleAdsService);
        var response = googleAdsService.Search(customerId, AdsQuery);

        var results = new List<GoogleAdsAdRecordDto>();
        foreach (var row in response)
        {
            var aga = row.AdGroupAd;
            var ad = aga?.Ad;
            if (aga is null || ad is null || ad.Id <= 0)
                continue;

            var adGroupExtId = row.AdGroup is { Id: > 0 }
                ? row.AdGroup.Id.ToString(CultureInfo.InvariantCulture)
                : ExtractTrailingResourceId(aga.AdGroup);

            if (string.IsNullOrEmpty(adGroupExtId))
                continue;

            var campaignExtId = row.Campaign is { Id: > 0 }
                ? row.Campaign.Id.ToString(CultureInfo.InvariantCulture)
                : null;

            var extId = ad.Id.ToString(CultureInfo.InvariantCulture);
            var headline = ExtractAdHeadline(ad, extId);
            var description = ExtractAdDescription(ad);
            var finalUrl = ad.FinalUrls is { Count: > 0 } ? ad.FinalUrls[0] : null;
            var approvalStatus = aga.PolicySummary?.ApprovalStatus
                                 ?? PolicyApprovalStatusEnum.Types.PolicyApprovalStatus.Unspecified;

            results.Add(new GoogleAdsAdRecordDto
            {
                ExternalId = extId,
                AdGroupExternalId = adGroupExtId,
                CampaignExternalId = campaignExtId,
                Name = !string.IsNullOrWhiteSpace(ad.Name) ? ad.Name : headline,
                Headline = headline,
                Description = description,
                MediaUrl = finalUrl,
                MediaType = MapAdMediaType(ad.Type),
                Status = MapAdStatus(aga.Status, approvalStatus)
            });
        }

        return Task.FromResult<IReadOnlyList<GoogleAdsAdRecordDto>>(results);
    }

    protected virtual Task<IReadOnlyList<GoogleAdsDailyMetricRecordDto>> QueryDailyMetricsAsync(
        string refreshToken,
        string? accessToken,
        string customerId,
        string? loginCustomerId,
        DateOnly startDate,
        DateOnly endDate,
        CancellationToken cancellationToken)
    {
        var client = CreateGoogleAdsClient(refreshToken, loginCustomerId);
        var googleAdsService = client.GetService(Google.Ads.GoogleAds.Services.V26.GoogleAdsService);
        var gaql = BuildDailyMetricsQuery(startDate, endDate);
        var response = googleAdsService.Search(customerId, gaql);

        var results = new List<GoogleAdsDailyMetricRecordDto>();
        foreach (var row in response)
        {
            var ad = row.AdGroupAd?.Ad;
            var segments = row.Segments;
            var metrics = row.Metrics;
            if (ad is null || ad.Id <= 0 || segments is null || metrics is null)
                continue;

            if (!DateOnly.TryParseExact(segments.Date, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var reportDate))
                continue;

            var adGroupExtId = row.AdGroup is { Id: > 0 }
                ? row.AdGroup.Id.ToString(CultureInfo.InvariantCulture)
                : ExtractTrailingResourceId(row.AdGroupAd?.AdGroup);

            var campaignExtId = row.Campaign is { Id: > 0 }
                ? row.Campaign.Id.ToString(CultureInfo.InvariantCulture)
                : null;

            results.Add(new GoogleAdsDailyMetricRecordDto
            {
                AdExternalId = ad.Id.ToString(CultureInfo.InvariantCulture),
                AdGroupExternalId = adGroupExtId,
                CampaignExternalId = campaignExtId,
                Date = reportDate,
                Impressions = metrics.Impressions,
                Clicks = metrics.Clicks,
                CostMicros = metrics.CostMicros,
                Conversions = metrics.Conversions,
                ConversionsValue = metrics.ConversionsValue
            });
        }

        return Task.FromResult<IReadOnlyList<GoogleAdsDailyMetricRecordDto>>(results);
    }

    public static string BuildDailyMetricsQuery(DateOnly startDate, DateOnly endDate)
    {
        return $@"
        SELECT
            ad_group_ad.ad.id,
            ad_group.id,
            campaign.id,
            segments.date,
            metrics.impressions,
            metrics.clicks,
            metrics.cost_micros,
            metrics.conversions,
            metrics.conversions_value
        FROM ad_group_ad
        WHERE segments.date BETWEEN '{startDate:yyyy-MM-dd}' AND '{endDate:yyyy-MM-dd}'";
    }

    // ─── Retry & Error Classification Helpers ────────────────────────────────────────

    private async Task<T> ExecuteWithRetryAsync<T>(
        Func<CancellationToken, Task<T>> operation,
        string customerId,
        string operationName,
        CancellationToken cancellationToken)
    {
        int attempt = 0;
        while (true)
        {
            cancellationToken.ThrowIfCancellationRequested();
            attempt++;
            try
            {
                return await operation(cancellationToken);
            }
            catch (Exception ex) when (attempt < MaxRetryAttempts && IsTransientGoogleAdsFailure(ex))
            {
                var delayMs = 150 * attempt;
                _logger.LogWarning(
                    "Transient Google Ads failure on {Operation} for customer {CustomerId} (attempt {Attempt}/{MaxAttempts}, {ExceptionType}). Retrying in {DelayMs}ms.",
                    operationName, customerId, attempt, MaxRetryAttempts, ex.GetType().Name, delayMs);

                await Task.Delay(TimeSpan.FromMilliseconds(delayMs), cancellationToken);
            }
        }
    }

    private static bool IsTransientGoogleAdsFailure(Exception ex)
    {
        if (ex is RpcException rpcEx)
        {
            return rpcEx.StatusCode is StatusCode.Unavailable
                or StatusCode.DeadlineExceeded
                or StatusCode.ResourceExhausted
                or StatusCode.Internal
                or StatusCode.Aborted;
        }

        return ex is HttpRequestException;
    }

    private static string ClassifyGoogleAdsException(Exception ex)
    {
        if (ex is RpcException rpcEx)
        {
            return rpcEx.StatusCode switch
            {
                StatusCode.Unauthenticated => GoogleOAuthErrorCodes.AuthorizationFailed,
                StatusCode.PermissionDenied => GoogleOAuthErrorCodes.UnauthorizedCustomerAccount,
                _ => GoogleOAuthErrorCodes.SyncFailed
            };
        }

        return GoogleOAuthErrorCodes.SyncFailed;
    }

    private async Task<PlatformSyncResultDto> MarkPlatformSyncFailedAsync(
        Platform platform,
        string errorCode,
        string message)
    {
        platform.LastSyncStatus = "Failed";
        platform.LastSyncError = Truncate(message, 1000);
        _unitOfWork.Platform.Update(platform);
        await _unitOfWork.Complete();

        return PlatformSyncResultDto.Fail(
            platform.Id,
            platform.ClientId,
            platform.PlatformType,
            errorCode,
            message);
    }

    // ─── Mapping & Parsing Helpers ───────────────────────────────────────────────────

    private GoogleAdsClient CreateGoogleAdsClient(string refreshToken, string? loginCustomerId)
    {
        var clientId = _configuration["GoogleOAuth:ClientId"];
        var clientSecret = _configuration["GoogleOAuth:ClientSecret"];

        if (string.IsNullOrWhiteSpace(clientId) || string.IsNullOrWhiteSpace(clientSecret))
        {
            throw new InvalidOperationException("Google OAuth ClientId and ClientSecret must be configured.");
        }

        var config = new GoogleAdsConfig
        {
            OAuth2Mode = OAuth2Flow.APPLICATION,
            OAuth2ClientId = clientId,
            OAuth2ClientSecret = clientSecret,
            OAuth2RefreshToken = refreshToken
        };

        var developerToken = _configuration["GoogleAds:DeveloperToken"]
                             ?? _configuration["GoogleOAuth:DeveloperToken"]
                             ?? _configuration["DeveloperToken"];
        if (!string.IsNullOrWhiteSpace(developerToken))
        {
            config.DeveloperToken = developerToken;
        }

        if (!string.IsNullOrWhiteSpace(loginCustomerId))
        {
            config.LoginCustomerId = loginCustomerId;
        }

        return new GoogleAdsClient(config);
    }

    private static CampaignStatus MapCampaignStatus(CampaignStatusEnum.Types.CampaignStatus status)
    {
        return status switch
        {
            CampaignStatusEnum.Types.CampaignStatus.Enabled => CampaignStatus.Active,
            CampaignStatusEnum.Types.CampaignStatus.Paused => CampaignStatus.Paused,
            CampaignStatusEnum.Types.CampaignStatus.Removed => CampaignStatus.Archived,
            _ => CampaignStatus.Draft
        };
    }

    private static CampaignObjective MapCampaignObjective(AdvertisingChannelTypeEnum.Types.AdvertisingChannelType channelType)
    {
        return channelType switch
        {
            AdvertisingChannelTypeEnum.Types.AdvertisingChannelType.Search => CampaignObjective.Traffic,
            AdvertisingChannelTypeEnum.Types.AdvertisingChannelType.Display => CampaignObjective.Awareness,
            AdvertisingChannelTypeEnum.Types.AdvertisingChannelType.Video => CampaignObjective.Awareness,
            AdvertisingChannelTypeEnum.Types.AdvertisingChannelType.Shopping => CampaignObjective.Sales,
            AdvertisingChannelTypeEnum.Types.AdvertisingChannelType.PerformanceMax => CampaignObjective.Sales,
            AdvertisingChannelTypeEnum.Types.AdvertisingChannelType.MultiChannel => CampaignObjective.AppPromotion,
            AdvertisingChannelTypeEnum.Types.AdvertisingChannelType.LocalServices => CampaignObjective.Leads,
            AdvertisingChannelTypeEnum.Types.AdvertisingChannelType.DemandGen => CampaignObjective.Engagement,
            _ => CampaignObjective.Traffic
        };
    }

    private static AdSetStatus MapAdSetStatus(AdGroupStatusEnum.Types.AdGroupStatus status)
    {
        return status switch
        {
            AdGroupStatusEnum.Types.AdGroupStatus.Enabled => AdSetStatus.Active,
            AdGroupStatusEnum.Types.AdGroupStatus.Paused => AdSetStatus.Paused,
            AdGroupStatusEnum.Types.AdGroupStatus.Removed => AdSetStatus.Completed,
            _ => AdSetStatus.Paused
        };
    }

    private static string MapAdGroupAudienceType(AdGroupTypeEnum.Types.AdGroupType adGroupType)
    {
        return adGroupType switch
        {
            AdGroupTypeEnum.Types.AdGroupType.SearchStandard or AdGroupTypeEnum.Types.AdGroupType.SearchDynamicAds => "Search",
            AdGroupTypeEnum.Types.AdGroupType.DisplayStandard => "Display",
            AdGroupTypeEnum.Types.AdGroupType.ShoppingProductAds or AdGroupTypeEnum.Types.AdGroupType.ShoppingSmartAds or AdGroupTypeEnum.Types.AdGroupType.ShoppingComparisonListingAds => "Shopping",
            AdGroupTypeEnum.Types.AdGroupType.VideoBumper or AdGroupTypeEnum.Types.AdGroupType.VideoTrueViewInStream or AdGroupTypeEnum.Types.AdGroupType.VideoTrueViewInDisplay or AdGroupTypeEnum.Types.AdGroupType.VideoNonSkippableInStream or AdGroupTypeEnum.Types.AdGroupType.VideoResponsive or AdGroupTypeEnum.Types.AdGroupType.VideoEfficientReach => "Video",
            _ => "General"
        };
    }

    private static AdStatus MapAdStatus(
        AdGroupAdStatusEnum.Types.AdGroupAdStatus status,
        PolicyApprovalStatusEnum.Types.PolicyApprovalStatus approvalStatus)
    {
        if (approvalStatus == PolicyApprovalStatusEnum.Types.PolicyApprovalStatus.Disapproved)
            return AdStatus.Disapproved;

        return status switch
        {
            AdGroupAdStatusEnum.Types.AdGroupAdStatus.Enabled => AdStatus.Active,
            AdGroupAdStatusEnum.Types.AdGroupAdStatus.Paused => AdStatus.Paused,
            AdGroupAdStatusEnum.Types.AdGroupAdStatus.Removed => AdStatus.Paused,
            _ => AdStatus.Pending
        };
    }

    private static MediaType MapAdMediaType(AdTypeEnum.Types.AdType adType)
    {
        return adType switch
        {
            AdTypeEnum.Types.AdType.VideoAd
                or AdTypeEnum.Types.AdType.VideoBumperAd
                or AdTypeEnum.Types.AdType.VideoNonSkippableInStreamAd
                or AdTypeEnum.Types.AdType.VideoTrueviewInStreamAd
                or AdTypeEnum.Types.AdType.VideoResponsiveAd
                or AdTypeEnum.Types.AdType.InFeedVideoAd
                or AdTypeEnum.Types.AdType.DemandGenVideoResponsiveAd => MediaType.Video,
            AdTypeEnum.Types.AdType.DemandGenCarouselAd => MediaType.Carousel,
            _ => MediaType.Image
        };
    }

    private static string ExtractAdHeadline(Google.Ads.GoogleAds.V26.Resources.Ad ad, string fallbackId)
    {
        if (ad.ResponsiveSearchAd?.Headlines is { Count: > 0 })
        {
            var rsaHeadline = ad.ResponsiveSearchAd.Headlines
                .Select(h => h.Text)
                .FirstOrDefault(t => !string.IsNullOrWhiteSpace(t));
            if (!string.IsNullOrWhiteSpace(rsaHeadline))
                return Truncate(rsaHeadline.Trim(), 200);
        }

        if (!string.IsNullOrWhiteSpace(ad.ExpandedTextAd?.HeadlinePart1))
        {
            return Truncate(ad.ExpandedTextAd.HeadlinePart1.Trim(), 200);
        }

        if (!string.IsNullOrWhiteSpace(ad.Name))
        {
            return Truncate(ad.Name.Trim(), 200);
        }

        return $"Ad #{fallbackId}";
    }

    private static string? ExtractAdDescription(Google.Ads.GoogleAds.V26.Resources.Ad ad)
    {
        if (ad.ResponsiveSearchAd?.Descriptions is { Count: > 0 })
        {
            var rsaDesc = ad.ResponsiveSearchAd.Descriptions
                .Select(d => d.Text)
                .FirstOrDefault(t => !string.IsNullOrWhiteSpace(t));
            if (!string.IsNullOrWhiteSpace(rsaDesc))
                return Truncate(rsaDesc.Trim(), 1000);
        }

        if (!string.IsNullOrWhiteSpace(ad.ExpandedTextAd?.Description))
        {
            return Truncate(ad.ExpandedTextAd.Description.Trim(), 1000);
        }

        return null;
    }

    private static DateTimeOffset? ParseGoogleAdsDateTime(string? rawDateTime)
    {
        if (string.IsNullOrWhiteSpace(rawDateTime))
            return null;

        if (DateTimeOffset.TryParse(
            rawDateTime.Trim(),
            CultureInfo.InvariantCulture,
            DateTimeStyles.AssumeUniversal | DateTimeStyles.AdjustToUniversal,
            out var parsed))
        {
            return parsed;
        }

        return null;
    }

    private static string? ExtractTrailingResourceId(string? resourceName)
    {
        if (string.IsNullOrWhiteSpace(resourceName))
            return null;

        var lastSlash = resourceName.LastIndexOf('/');
        var candidate = lastSlash >= 0 ? resourceName[(lastSlash + 1)..] : resourceName;
        return NormalizeCustomerId(candidate);
    }

    private static string Truncate(string value, int maxLength)
    {
        if (string.IsNullOrEmpty(value) || value.Length <= maxLength)
            return value;

        return value[..maxLength];
    }

    private static void AddOrUpdateDiscoveredAccount(
        Dictionary<string, GoogleAdsCustomerAccountDto> map,
        GoogleAdsCustomerAccountDto incoming)
    {
        if (!map.TryGetValue(incoming.CustomerId, out var _))
        {
            map[incoming.CustomerId] = incoming;
            return;
        }

        // If discovered directly (level 0), prefer direct access over MCC access
        if (incoming.Level == 0)
        {
            map[incoming.CustomerId] = incoming;
        }
    }

    public static string? NormalizeCustomerId(string? rawCustomerId)
    {
        if (string.IsNullOrWhiteSpace(rawCustomerId))
            return null;

        var input = rawCustomerId.Trim();
        if (input.StartsWith("customers/", StringComparison.OrdinalIgnoreCase))
            input = input[10..];

        var digits = new string(input.Where(c => c is not ('-' or ' ')).ToArray());
        return digits.Length is >= 1 and <= 15 && digits.All(char.IsAsciiDigit) ? digits : null;
    }

    public static string FormatCustomerId(string customerId)
    {
        var normalized = NormalizeCustomerId(customerId) ?? customerId;
        return normalized.Length == 10
            ? $"{normalized[..3]}-{normalized[3..6]}-{normalized[6..]}"
            : normalized;
    }
}
