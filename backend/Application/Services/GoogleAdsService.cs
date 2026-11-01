using Dashboard.Application.DTOs;
using Dashboard.Application.Interfaces;
using Dashboard.Application.Interfaces.Services;
using Dashboard.Domain.Entities;
using Dashboard.Domain.Enums;
using Google.Ads.Gax.Config;
using Google.Ads.GoogleAds.Config;
using Google.Ads.GoogleAds.Lib;
using Google.Ads.GoogleAds.V26.Errors;
using Grpc.Core;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Dashboard.Application.Services;

/// <summary>
/// Implements Google Ads customer account discovery and Client association:
/// - Direct Access (level 0): Standalone advertiser accounts directly accessible to the user.
/// - MCC Access (level 1): Direct advertiser accounts under an accessible Manager account.
/// Manager accounts are filtered out so only selectable advertiser accounts are returned.
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
                    Status = p.Status.ToString(),
                    GoogleAdsConnectionId = p.OAuthConnectionId ?? connection.Id
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
        string? userRole,
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

        // 3. Ensure user has an active Google Ads connection
        var connection = await _unitOfWork.GoogleAdsConnection.GetByUserIdAsync(userId);
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

        // 6. Resolve currency (fallback to client's UnitCurrency)
        var currency = Enum.TryParse<Currency>(matchedAccount.CurrencyCode, ignoreCase: true, out var parsed)
            ? parsed
            : client.UnitCurrency;

        // 7. Persist association on the Client's Platform record
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
            Status = platform.Status.ToString(),
            GoogleAdsConnectionId = connection.Id
        };

        return SelectGoogleAdsAccountResultDto.Ok(associationDto);
    }

    public async Task<DisconnectGoogleAdsClientResultDto> DisconnectClientAccountAsync(
        string userId,
        string? userRole,
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

        bool isAdmin = string.Equals(userRole, Roles.Admin.ToString(), StringComparison.OrdinalIgnoreCase);
        bool isOwnerManager = string.Equals(client.ManagerId, userId, StringComparison.Ordinal);
        if (!isAdmin && !isOwnerManager)
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
            platform.Status = PlatformStatus.NotConnected;
            platform.ExternalAccountId = null;
            platform.AccountName = null;
            platform.ManagerAccountId = null;
            platform.OAuthConnectionId = null;
            _unitOfWork.Platform.Update(platform);
            await _unitOfWork.Complete();
        }

        _logger.LogInformation(
            "Disconnected Google Ads account association for Client {ClientId} by user {UserId} (user OAuth connection preserved).",
            client.Id,
            userId);

        return DisconnectGoogleAdsClientResultDto.Ok(
            client.Id,
            $"Google Ads account disconnected from '{client.CompanyName}'.");
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
                ? cc.Id.ToString(System.Globalization.CultureInfo.InvariantCulture)
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
                IsTestAccount = cc.TestAccount,
                Status = cc.Status.ToString().ToUpperInvariant(),
                CurrencyCode = string.IsNullOrWhiteSpace(cc.CurrencyCode) ? null : cc.CurrencyCode,
                TimeZone = string.IsNullOrWhiteSpace(cc.TimeZone) ? null : cc.TimeZone,
                ManagerCustomerId = cc.Level > 0 ? accessibleCustomerId : null,
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
