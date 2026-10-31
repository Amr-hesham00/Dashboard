using Dashboard.Application.DTOs;
using Dashboard.Application.Interfaces;
using Dashboard.Application.Interfaces.Services;
using Dashboard.Domain.Entities;
using Dashboard.Domain.Enums;
using Google.Ads.Gax.Config;
using Google.Ads.GoogleAds;
using Google.Ads.GoogleAds.Config;
using Google.Ads.GoogleAds.V26.Errors;
using Google.Ads.GoogleAds.Lib;
using Grpc.Core;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Dashboard.Application.Services;

/// <summary>
/// Implements Google Ads customer account discovery using the official <c>Google.Ads.GoogleAds</c> .NET client library
/// for two supported access scenarios:
/// 1. Direct Access: Standalone advertiser accounts directly accessible to the authenticated Google user (level = 0, manager = false).
/// 2. MCC Access: Advertiser accounts linked directly under an accessible MCC Manager account (level = 1, manager = false).
/// Also handles validated account selection and association with Dashboard Clients.
/// </summary>
public class GoogleAdsService : IGoogleAdsService
{
    private const string DirectAndMccAdvertiserQuery = @"
        SELECT
            customer_client.id,
            customer_client.descriptive_name,
            customer_client.manager,
            customer_client.level,
            customer_client.status,
            customer_client.currency_code,
            customer_client.time_zone,
            customer_client.test_account
        FROM customer_client
        WHERE customer_client.level <= 1
          AND customer_client.manager = FALSE";

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

        var connection = await _unitOfWork.GoogleAdsConnection.GetByUserIdAsync(userId);
        if (connection is null || string.IsNullOrEmpty(connection.RefreshTokenEncrypted))
        {
            return new GoogleAdsConnectionStatusDto
            {
                Connected = false
            };
        }

        var linkedPlatforms = await _unitOfWork.Platform.GetByGoogleAdsConnectionIdAsync(connection.Id);
        var linkedDtos = linkedPlatforms
            .Where(p => p.PlatformType == PlatformType.GoogleAds && !string.IsNullOrEmpty(p.ExternalAccountId))
            .Select(p => new GoogleAdsAccountAssociationDto
            {
                PlatformId = p.Id,
                ClientId = p.ClientId,
                ClientName = p.Client?.CompanyName ?? $"Client #{p.ClientId}",
                CustomerId = p.ExternalAccountId!,
                FormattedCustomerId = FormatCustomerId(p.ExternalAccountId!),
                AccountName = !string.IsNullOrWhiteSpace(p.AccountName)
                    ? p.AccountName!
                    : $"Google Ads Account ({FormatCustomerId(p.ExternalAccountId!)})",
                LoginCustomerId = p.LoginCustomerId,
                Currency = p.Currency.ToString(),
                Status = p.Status.ToString(),
                GoogleAdsConnectionId = connection.Id
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

        // 1. Resolve and validate (or refresh) OAuth credentials for this user
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

        // 2. Discover directly accessible customer resource names via CustomerService.ListAccessibleCustomers
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

        // 3. For each accessible customer from ListAccessibleCustomers():
        //    - If it is a standalone advertiser account, customer_client returns it at level 0 (manager = false).
        //    - If it is an MCC manager account, customer_client returns its directly linked advertiser accounts at level 1 (manager = false).
        //    No nested MCC traversal, queues, or recursion are used, and MCC manager accounts are never included.
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
                // Never include MCC Manager accounts or nested accounts deeper than level 1
                if (account.IsManager || account.Level > 1)
                    continue;

                MergeDiscoveredAccount(discoveredByCustomerId, account);
            }
        }

        // 4. Cross-reference with existing linked Platforms for this connection so the UI knows current associations
        if (credentials.ConnectionId.HasValue)
        {
            var linkedPlatforms = await _unitOfWork.Platform.GetByGoogleAdsConnectionIdAsync(credentials.ConnectionId.Value);
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

        // 5. Finalize display names and sort alphabetically by account name
        var accounts = discoveredByCustomerId.Values
            .Select(FinalizeDisplayProperties)
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
        string? userRole,
        SelectGoogleAdsAccountRequestDto request,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(userId))
            throw new ArgumentException("A Dashboard user ID is required.", nameof(userId));

        if (request is null)
            throw new ArgumentNullException(nameof(request));

        // 1. Validate Customer ID format
        var normalizedCustomerId = NormalizeCustomerId(request.CustomerId);
        if (string.IsNullOrEmpty(normalizedCustomerId))
        {
            return SelectGoogleAdsAccountResultDto.Fail(
                GoogleOAuthErrorCodes.InvalidCustomerId,
                "A valid numeric Google Ads Customer ID is required.");
        }

        // 2. Verify target Dashboard Client exists and the authenticated user is authorized to manage it
        var client = await _unitOfWork.Client.GetById(request.ClientId);
        if (client is null)
        {
            return SelectGoogleAdsAccountResultDto.Fail(
                GoogleOAuthErrorCodes.ClientNotFound,
                $"Dashboard Client with ID '{request.ClientId}' was not found.");
        }

        bool isAdmin = string.Equals(userRole, Roles.Admin.ToString(), StringComparison.OrdinalIgnoreCase);
        bool isOwnerManager = string.Equals(client.ManagerId, userId, StringComparison.Ordinal);
        if (!isAdmin && !isOwnerManager)
        {
            _logger.LogWarning(
                "User {UserId} attempted to associate a Google Ads account with unauthorized Client {ClientId} (owned by {ManagerId}).",
                userId, client.Id, client.ManagerId);
            return SelectGoogleAdsAccountResultDto.Fail(
                GoogleOAuthErrorCodes.UnauthorizedClient,
                "You do not have permission to associate a Google Ads account with this Dashboard Client.");
        }

        // 3. Ensure user has their own active GoogleAdsConnection
        var connection = await _unitOfWork.GoogleAdsConnection.GetByUserIdAsync(userId);
        if (connection is null || string.IsNullOrEmpty(connection.RefreshTokenEncrypted))
        {
            return SelectGoogleAdsAccountResultDto.Fail(
                GoogleOAuthErrorCodes.NotConnected,
                "No active Google Ads connection found for your user account. Please connect Google Ads first.");
        }

        // 4. Validate account access against Google Ads API (only selectable Advertiser accounts from Direct or MCC access are returned)
        var discovery = await DiscoverAccessibleAccountsAsync(userId, cancellationToken);
        if (!discovery.Success)
        {
            return SelectGoogleAdsAccountResultDto.Fail(
                discovery.ErrorCode ?? GoogleOAuthErrorCodes.DiscoveryFailed,
                discovery.Message ?? "Could not validate Google Ads account access.");
        }

        var matchedAccount = discovery.Accounts
            .FirstOrDefault(a => string.Equals(a.CustomerId, normalizedCustomerId, StringComparison.Ordinal));

        if (matchedAccount is null || matchedAccount.IsManager)
        {
            _logger.LogWarning(
                "User {UserId} attempted to associate non-selectable or inaccessible Google Ads Customer ID {CustomerId} with Client {ClientId}.",
                userId, normalizedCustomerId, client.Id);
            return SelectGoogleAdsAccountResultDto.Fail(
                GoogleOAuthErrorCodes.UnauthorizedCustomerAccount,
                $"Google Ads account '{FormatCustomerId(normalizedCustomerId)}' is not an accessible advertiser account for your Google Ads connection.");
        }

        // 5. Prevent linking the same Google Ads advertiser account to two different Dashboard Clients
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

        // 6. Resolve currency from the Google Ads account (fallback to Client's UnitCurrency)
        var resolvedCurrency = MapCurrencyOrDefault(matchedAccount.CurrencyCode, client.UnitCurrency);

        // 7. Persist association on the Client's single GoogleAds Platform record
        var platform = await _unitOfWork.Platform.GetByClientAndTypeAsync(client.Id, PlatformType.GoogleAds);
        if (platform is null)
        {
            platform = new Platform
            {
                ClientId = client.Id,
                PlatformType = PlatformType.GoogleAds,
                Status = PlatformStatus.Connected,
                Currency = resolvedCurrency,
                ExternalAccountId = matchedAccount.CustomerId,
                AccountName = matchedAccount.DescriptiveName,
                LoginCustomerId = matchedAccount.ManagerCustomerId,
                GoogleAdsConnectionId = connection.Id,
                CreatedAt = _timeProvider.GetUtcNow()
            };
            await _unitOfWork.Platform.Create(platform);
        }
        else
        {
            platform.Status = PlatformStatus.Connected;
            platform.Currency = resolvedCurrency;
            platform.ExternalAccountId = matchedAccount.CustomerId;
            platform.AccountName = matchedAccount.DescriptiveName;
            platform.LoginCustomerId = matchedAccount.ManagerCustomerId;
            platform.GoogleAdsConnectionId = connection.Id;
            _unitOfWork.Platform.Update(platform);
        }

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
            Status = platform.Status.ToString(),
            GoogleAdsConnectionId = connection.Id
        };

        return SelectGoogleAdsAccountResultDto.Ok(associationDto);
    }

    // ─── Protected virtual Google Ads SDK operations (testable in unit tests) ─────────

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
                ? cc.Id.ToString(System.Globalization.CultureInfo.InvariantCulture)
                : NormalizeCustomerId(cc.ClientCustomer);

            if (string.IsNullOrEmpty(cid))
                continue;

            // Scenario 1 (Direct Access): level == 0 (cid == accessibleCustomerId) -> ManagerCustomerId is null.
            // Scenario 2 (MCC Access): level == 1 (advertiser linked directly under accessibleCustomerId MCC) -> ManagerCustomerId is accessibleCustomerId.
            string? managerCustomerId = cc.Level > 0 && !string.Equals(cid, accessibleCustomerId, StringComparison.Ordinal)
                ? accessibleCustomerId
                : null;

            results.Add(new GoogleAdsCustomerAccountDto
            {
                CustomerId = cid,
                FormattedCustomerId = FormatCustomerId(cid),
                DescriptiveName = cc.DescriptiveName ?? string.Empty,
                IsManager = false,
                IsTestAccount = cc.TestAccount,
                Status = cc.Status.ToString().ToUpperInvariant(),
                CurrencyCode = string.IsNullOrWhiteSpace(cc.CurrencyCode) ? null : cc.CurrencyCode,
                TimeZone = string.IsNullOrWhiteSpace(cc.TimeZone) ? null : cc.TimeZone,
                ManagerCustomerId = managerCustomerId,
                Level = cc.Level
            });
        }

        return Task.FromResult<IReadOnlyList<GoogleAdsCustomerAccountDto>>(results);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────────────

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

        if (!string.IsNullOrWhiteSpace(loginCustomerId))
        {
            config.LoginCustomerId = loginCustomerId;
        }

        return new GoogleAdsClient(config);
    }

    private static void MergeDiscoveredAccount(
        Dictionary<string, GoogleAdsCustomerAccountDto> map,
        GoogleAdsCustomerAccountDto incoming)
    {
        if (!map.TryGetValue(incoming.CustomerId, out var existing))
        {
            map[incoming.CustomerId] = incoming;
            return;
        }

        if (string.IsNullOrWhiteSpace(existing.DescriptiveName) && !string.IsNullOrWhiteSpace(incoming.DescriptiveName))
        {
            existing.DescriptiveName = incoming.DescriptiveName;
        }

        if (incoming.IsTestAccount)
        {
            existing.IsTestAccount = true;
        }

        if (string.IsNullOrWhiteSpace(existing.CurrencyCode) && !string.IsNullOrWhiteSpace(incoming.CurrencyCode))
        {
            existing.CurrencyCode = incoming.CurrencyCode;
        }

        if (string.IsNullOrWhiteSpace(existing.TimeZone) && !string.IsNullOrWhiteSpace(incoming.TimeZone))
        {
            existing.TimeZone = incoming.TimeZone;
        }

        // If the account is directly accessible (Level == 0), prefer direct access (no login manager needed);
        // otherwise preserve the first discovered MCC ManagerCustomerId.
        if (incoming.Level == 0)
        {
            existing.Level = 0;
            existing.ManagerCustomerId = null;
        }
        else if (string.IsNullOrWhiteSpace(existing.ManagerCustomerId) && !string.IsNullOrWhiteSpace(incoming.ManagerCustomerId))
        {
            existing.ManagerCustomerId = incoming.ManagerCustomerId;
        }
    }

    private static GoogleAdsCustomerAccountDto FinalizeDisplayProperties(GoogleAdsCustomerAccountDto dto)
    {
        dto.FormattedCustomerId = FormatCustomerId(dto.CustomerId);
        if (string.IsNullOrWhiteSpace(dto.DescriptiveName))
        {
            dto.DescriptiveName = $"Google Ads Account ({dto.FormattedCustomerId})";
        }
        return dto;
    }

    public static string? NormalizeCustomerId(string? rawCustomerId)
    {
        if (string.IsNullOrWhiteSpace(rawCustomerId))
            return null;

        var trimmed = rawCustomerId.Trim();
        if (trimmed.StartsWith("customers/", StringComparison.OrdinalIgnoreCase))
        {
            trimmed = trimmed["customers/".Length..];
        }

        var digits = new string(trimmed.Where(c => c != '-' && !char.IsWhiteSpace(c)).ToArray());
        if (string.IsNullOrEmpty(digits) || digits.Length > 15 || !digits.All(char.IsAsciiDigit))
            return null;

        return digits;
    }

    public static string FormatCustomerId(string customerId)
    {
        var normalized = NormalizeCustomerId(customerId) ?? customerId;
        if (normalized.Length == 10 && normalized.All(char.IsAsciiDigit))
        {
            return $"{normalized[..3]}-{normalized[3..6]}-{normalized[6..]}";
        }
        return normalized;
    }

    private static Currency MapCurrencyOrDefault(string? currencyCode, Currency fallback)
    {
        if (!string.IsNullOrWhiteSpace(currencyCode) &&
            Enum.TryParse<Currency>(currencyCode.Trim(), ignoreCase: true, out var parsed))
        {
            return parsed;
        }

        return fallback;
    }
}
