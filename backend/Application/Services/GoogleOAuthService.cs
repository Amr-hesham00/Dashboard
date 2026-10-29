using Dashboard.Application.DTOs;
using Dashboard.Application.Interfaces;
using Dashboard.Application.Interfaces.Services;
using Dashboard.Domain.Entities;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Buffers.Text;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;

namespace Dashboard.Application.Services;

/// <summary>
/// Implements Google's OAuth 2.0 web-server flow:
/// https://developers.google.com/identity/protocols/oauth2/web-server
/// Uses direct HTTP calls to the documented endpoints; no Google Ads API calls are made.
/// </summary>
public class GoogleOAuthService : IGoogleOAuthService
{
    public const string AuthorizationEndpoint = "https://accounts.google.com/o/oauth2/v2/auth";
    public const string TokenEndpoint = "https://oauth2.googleapis.com/token";
    public const string RevocationEndpoint = "https://oauth2.googleapis.com/revoke";
    public const string GoogleAdsScope = "https://www.googleapis.com/auth/adwords";

    // Data Protection purpose string; changing it makes existing stored tokens unreadable.
    private const string TokenProtectionPurpose = "Dashboard.GoogleOAuth.Tokens.v1";

    private readonly HttpClient _httpClient;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IDataProtector _tokenProtector;
    private readonly GoogleOAuthStateStore _stateStore;
    private readonly IConfiguration _configuration;
    private readonly TimeProvider _timeProvider;
    private readonly ILogger<GoogleOAuthService> _logger;

    public GoogleOAuthService(
        HttpClient httpClient,
        IUnitOfWork unitOfWork,
        IDataProtectionProvider dataProtectionProvider,
        GoogleOAuthStateStore stateStore,
        IConfiguration configuration,
        TimeProvider timeProvider,
        ILogger<GoogleOAuthService> logger)
    {
        _httpClient = httpClient;
        _unitOfWork = unitOfWork;
        _tokenProtector = dataProtectionProvider.CreateProtector(TokenProtectionPurpose);
        _stateStore = stateStore;
        _configuration = configuration;
        _timeProvider = timeProvider;
        _logger = logger;
    }

    public async Task<GoogleOAuthStartResult> StartAuthorization(string userId)
    {
        if (string.IsNullOrWhiteSpace(userId))
            throw new ArgumentException("A Dashboard user ID is required.", nameof(userId));

        // Prevent reconnecting if the user already has an active, valid connection
        var existing = await _unitOfWork.GoogleAdsConnection.GetByUserIdAsync(userId);
        if (existing is not null && !string.IsNullOrEmpty(existing.RefreshTokenEncrypted))
        {
            _logger.LogWarning("User {UserId} already has a valid Google Ads connection. Reconnecting is prevented.", userId);
            return new GoogleOAuthStartResult(null, null, HasToken: true, ErrorCode: GoogleOAuthErrorCodes.AlreadyConnected);
        }

        var clientId = _configuration["GoogleOAuth:ClientId"];
        var redirectUri = _configuration["GoogleOAuth:RedirectUri"];

        if (string.IsNullOrWhiteSpace(clientId) || string.IsNullOrWhiteSpace(redirectUri))
        {
            throw new InvalidOperationException($"{clientId} or {redirectUri} is not configured.");
        }

        // PKCE (S256) – recommended by Google for web server apps as well
        var codeVerifier = Base64Url.EncodeToString(RandomNumberGenerator.GetBytes(32));
        var codeChallenge = Base64Url.EncodeToString(SHA256.HashData(Encoding.ASCII.GetBytes(codeVerifier)));

        var state = _stateStore.Create(userId, codeVerifier);

        var url = QueryHelpers.AddQueryString(AuthorizationEndpoint, new Dictionary<string, string?>
        {
            ["client_id"] = clientId,
            ["redirect_uri"] = redirectUri,
            ["response_type"] = "code",
            ["scope"] = GoogleAdsScope,
            ["state"] = state,
            ["access_type"] = "offline",
            ["prompt"] = "select_account consent",
            ["code_challenge"] = codeChallenge,
            ["code_challenge_method"] = "S256",
        });

        _logger.LogInformation("Google OAuth authorization started for user {UserId}.", userId);
        return new GoogleOAuthStartResult(url, state, HasToken: false);
    }

    public async Task<GoogleOAuthCallbackResult> HandleCallbackAsync(GoogleOAuthCallbackRequest request, CancellationToken cancellationToken = default)
    {
        // 1. Validate state first (always consumed, so it is single-use even when Google returns an error)
        if (string.IsNullOrEmpty(request.State))
        {
            _logger.LogWarning("Google OAuth callback rejected: missing state.");
            return GoogleOAuthCallbackResult.Fail(GoogleOAuthErrorCodes.InvalidState);
        }

        var pending = _stateStore.Consume(request.State);
        if (pending is null)
        {
            _logger.LogWarning("Google OAuth callback rejected: unknown, expired, or reused state.");
            return GoogleOAuthCallbackResult.Fail(GoogleOAuthErrorCodes.InvalidState);
        }

        // 2. If the browser-binding cookie is present, verify it matches the state
        if (!string.IsNullOrEmpty(request.BrowserState) && !FixedTimeEquals(request.State, request.BrowserState))
        {
            _logger.LogWarning("Google OAuth callback rejected for user {UserId}: state not bound to this browser.", pending.UserId);
            return GoogleOAuthCallbackResult.Fail(GoogleOAuthErrorCodes.InvalidState);
        }

        var userId = pending.UserId; // identity comes only from the server-side transaction

        // Prevent reconnecting if user already has an active, valid connection
        var existing = await _unitOfWork.GoogleAdsConnection.GetByUserIdAsync(userId);
        if (existing is not null && !string.IsNullOrEmpty(existing.RefreshTokenEncrypted))
        {
            _logger.LogWarning("Google OAuth callback rejected: user {UserId} already has a valid connection.", userId);
            return GoogleOAuthCallbackResult.Fail(GoogleOAuthErrorCodes.AlreadyConnected);
        }

        // 3. Google returned an error (e.g. access_denied)
        if (!string.IsNullOrEmpty(request.Error))
        {
            var errorCode = GoogleOAuthErrorCodes.FromGoogle(request.Error);
            _logger.LogWarning("Google OAuth authorization returned error {ErrorCode} for user {UserId}.", errorCode, userId);
            return GoogleOAuthCallbackResult.Fail(errorCode);
        }

        if (string.IsNullOrEmpty(request.Code))
        {
            _logger.LogWarning("Google OAuth callback for user {UserId} had no authorization code.", userId);
            return GoogleOAuthCallbackResult.Fail(GoogleOAuthErrorCodes.InvalidRequest);
        }

        // 4. Exchange the code (backend only)
        var (tokens, exchangeError) = await ExchangeCodeAsync(request.Code, pending.CodeVerifier, userId, cancellationToken);
        if (tokens is null)
            return GoogleOAuthCallbackResult.Fail(exchangeError!);

        // 5. Granular consent: make sure the Google Ads scope was actually granted
        if (tokens.Scope != null &&
            !tokens.Scope.Split(' ', StringSplitOptions.RemoveEmptyEntries).Contains(GoogleAdsScope, StringComparer.Ordinal))
        {
            _logger.LogWarning("Google OAuth for user {UserId}: Google Ads scope was not granted.", userId);
            return GoogleOAuthCallbackResult.Fail(GoogleOAuthErrorCodes.ScopeNotGranted);
        }

        // 6. Persist
        return await SaveConnectionAsync(userId, tokens);
    }

    public async Task<bool> DisconnectAsync(string userId, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(userId))
            throw new ArgumentException("A Dashboard user ID is required.", nameof(userId));

        var connection = await _unitOfWork.GoogleAdsConnection.GetByUserIdAsync(userId);
        if (connection is null)
        {
            _logger.LogInformation("Google Ads disconnect requested for user {UserId}, but no active connection exists.", userId);
            return false;
        }

        await RevokeTokenBestEffortAsync(connection, userId, cancellationToken);

        _unitOfWork.GoogleAdsConnection.Delete(connection);
        await _unitOfWork.Complete();

        _logger.LogInformation("Google Ads connection disconnected and removed for user {UserId}.", userId);
        return true;
    }


    // ---------------------------helpers
    private async Task RevokeTokenBestEffortAsync(GoogleAdsConnection connection, string userId, CancellationToken cancellationToken)
    {
        string? tokenToRevoke = null;
        try
        {
            var encryptedToken = !string.IsNullOrEmpty(connection.RefreshTokenEncrypted)
                ? connection.RefreshTokenEncrypted
                : connection.AccessTokenEncrypted;

            if (!string.IsNullOrEmpty(encryptedToken))
            {
                tokenToRevoke = _tokenProtector.Unprotect(encryptedToken);
            }
        }
        catch (Exception ex) when (ex is CryptographicException)
        {
            _logger.LogWarning("Could not decrypt stored Google token for revocation for user {UserId}; proceeding with local deletion.", userId);
            return;
        }

        if (string.IsNullOrEmpty(tokenToRevoke))
            return;

        try
        {
            using var content = new FormUrlEncodedContent(new Dictionary<string, string>
            {
                ["token"] = tokenToRevoke
            });

            using var response = await _httpClient.PostAsync(RevocationEndpoint, content, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Google token revocation returned HTTP {StatusCode} for user {UserId}; proceeding with local deletion.",
                    (int)response.StatusCode, userId);
            }
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException)
        {
            _logger.LogWarning("Google token revocation request failed for user {UserId} ({ExceptionType}); proceeding with local deletion.",
                userId, ex.GetType().Name);
        }
    }
    private async Task<(GoogleTokenResponse? Tokens, string? ErrorCode)> ExchangeCodeAsync(
        string code, string codeVerifier, string userId, CancellationToken cancellationToken)
    {
        var clientId = _configuration["GoogleOAuth:ClientId"];
        var clientSecret = _configuration["GoogleOAuth:ClientSecret"];
        var redirectUri = _configuration["GoogleOAuth:RedirectUri"];

        if (string.IsNullOrWhiteSpace(clientId) || string.IsNullOrWhiteSpace(clientSecret) || string.IsNullOrWhiteSpace(redirectUri))
        {
            _logger.LogError("Google OAuth is not fully configured (GoogleOAuth:ClientId/ClientSecret/RedirectUri).");
            return (null, GoogleOAuthErrorCodes.NotConfigured);
        }

        using var content = new FormUrlEncodedContent(new Dictionary<string, string>
        {
            ["code"] = code,
            ["client_id"] = clientId,
            ["client_secret"] = clientSecret,
            ["redirect_uri"] = redirectUri, // must equal the value used in the authorization request
            ["grant_type"] = "authorization_code",
            ["code_verifier"] = codeVerifier,
        });

        try
        {
            using var response = await _httpClient.PostAsync(TokenEndpoint, content, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                string? googleError = null;
                try
                {
                    googleError = (await response.Content.ReadFromJsonAsync<GoogleTokenErrorResponse>(cancellationToken))?.Error;
                }
                catch (Exception) { /* non-JSON body; ignore */ }

                var errorCode = GoogleOAuthErrorCodes.FromGoogle(googleError);
                _logger.LogWarning("Google token exchange failed for user {UserId}: HTTP {StatusCode}, error {ErrorCode}.",
                    userId, (int)response.StatusCode, errorCode);
                return (null, errorCode);
            }

            var tokens = await response.Content.ReadFromJsonAsync<GoogleTokenResponse>(cancellationToken);
            if (tokens is null || string.IsNullOrEmpty(tokens.AccessToken))
            {
                _logger.LogWarning("Google token exchange for user {UserId} returned no access token.", userId);
                return (null, GoogleOAuthErrorCodes.AuthorizationFailed);
            }

            return (tokens, null);
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException or System.Text.Json.JsonException)
        {
            // Log only the exception type; messages could in theory echo request data
            _logger.LogWarning("Google token exchange for user {UserId} failed: {ExceptionType}.", userId, ex.GetType().Name);
            return (null, GoogleOAuthErrorCodes.AuthorizationFailed);
        }
    }

    private async Task<GoogleOAuthCallbackResult> SaveConnectionAsync(string userId, GoogleTokenResponse tokens)
    {
        var now = _timeProvider.GetUtcNow();
        var existing = await _unitOfWork.GoogleAdsConnection.GetByUserIdAsync(userId);
        bool hasNewRefreshToken = !string.IsNullOrEmpty(tokens.RefreshToken);

        if (existing is null)
        {
            if (!hasNewRefreshToken)
            {
                // Without a refresh token the connection cannot be renewed – do not report success
                _logger.LogWarning("Google OAuth for user {UserId}: no refresh token returned for a new connection.", userId);
                return GoogleOAuthCallbackResult.Fail(GoogleOAuthErrorCodes.MissingRefreshToken);
            }

            await _unitOfWork.GoogleAdsConnection.Create(new GoogleAdsConnection
            {
                UserId = userId,
                AccessTokenEncrypted = _tokenProtector.Protect(tokens.AccessToken!),
                RefreshTokenEncrypted = _tokenProtector.Protect(tokens.RefreshToken!),
                AccessTokenExpiresAt = now.AddSeconds(tokens.ExpiresIn),
                Scopes = tokens.Scope,
                CreatedAt = now,
                UpdatedAt = now
            });
        }
        else
        {
            existing.AccessTokenEncrypted = _tokenProtector.Protect(tokens.AccessToken!);
            existing.AccessTokenExpiresAt = now.AddSeconds(tokens.ExpiresIn);
            existing.Scopes = tokens.Scope ?? existing.Scopes;
            existing.UpdatedAt = now;

            // Google may omit refresh_token on re-authorization: keep the stored one
            if (hasNewRefreshToken)
                existing.RefreshTokenEncrypted = _tokenProtector.Protect(tokens.RefreshToken!);

            _unitOfWork.GoogleAdsConnection.Update(existing);
        }

        await _unitOfWork.Complete();

        _logger.LogInformation("Google OAuth connection saved for user {UserId} (new refresh token: {HasNewRefreshToken}).",
            userId, hasNewRefreshToken);
        return GoogleOAuthCallbackResult.Ok();
    }


    private static bool FixedTimeEquals(string expected, string? actual)
    {
        if (string.IsNullOrEmpty(actual))
            return false;

        return CryptographicOperations.FixedTimeEquals(
            Encoding.UTF8.GetBytes(expected),
            Encoding.UTF8.GetBytes(actual));
    }


}
