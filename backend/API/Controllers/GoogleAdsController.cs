using Dashboard.Application.DTOs;
using Dashboard.Application.Interfaces.Services;
using Dashboard.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Dashboard.API.Controllers;

[Route("api/google-ads")]
[ApiController]
[Authorize]
public class GoogleAdsController : ControllerBase
{
    private readonly IGoogleOAuthService _googleOAuthService;
    private readonly IGoogleAdsService? _googleAdsService;

    public GoogleAdsController(
        IGoogleOAuthService googleOAuthService,
        IGoogleAdsService? googleAdsService = null)
    {
        _googleOAuthService = googleOAuthService;
        _googleAdsService = googleAdsService;
    }

    /// <summary>
    /// Step A: Initiate Google OAuth authorization for the authenticated Media Buyer.
    /// Resolves the user identity strictly from the authenticated principal.
    /// Returns the Google authorization URL and sets an HTTP-only state cookie.
    /// </summary>
    [HttpPost("connect")]
    public async Task<IActionResult> Connect()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(new { message = "User identity not found in token." });
        }

        var result = await _googleOAuthService.StartAuthorization(userId);
        if (result.AlreadyConnected)
        {
            return Conflict(new
            {
                message = "User already has an active Google Ads connection. Reconnecting is not allowed.",
                errorCode = GoogleOAuthErrorCodes.AlreadyConnected,
                alreadyConnected = true
            });
        }

        Response.Cookies.Append("g_oauth_state", result.State!, new CookieOptions
        {
            HttpOnly = true,
            Secure = Request.IsHttps,
            SameSite = Request.IsHttps ? SameSiteMode.None : SameSiteMode.Lax,
            Expires = DateTimeOffset.UtcNow.Add(GoogleOAuthStateStore.Lifetime)
        });

        return Ok(new { authorizationUrl = result.AuthorizationUrl });
    }

    /// <summary>
    /// Step C: OAuth callback endpoint matching the registered redirect URI.
    /// Handles successful authorization and Google error responses, validates state,
    /// exchanges the authorization code on the backend, and securely persists tokens.
    /// </summary>
    [AllowAnonymous]
    [HttpGet("callback")]
    public async Task<IActionResult> Callback(
        [FromQuery] string? code,
        [FromQuery] string? state,
        [FromQuery] string? error,
        CancellationToken cancellationToken)
    {
        var browserState = Request.Cookies["g_oauth_state"];

        var request = new GoogleOAuthCallbackRequest(code, state, error, browserState);
        var result = await _googleOAuthService.HandleCallbackAsync(request, cancellationToken);

        // Delete the single-use state cookie
        Response.Cookies.Delete("g_oauth_state", new CookieOptions
        {
            HttpOnly = true,
            Secure = Request.IsHttps,
            SameSite = Request.IsHttps ? SameSiteMode.None : SameSiteMode.Lax
        });

        const string clientsRedirectUrl = "http://localhost:3000/clients";

        if (result.Success)
        {
            var successMsg = Uri.EscapeDataString("Google Ads authorized and connected successfully!");
            return Redirect($"{clientsRedirectUrl}?googleAuth=success&message={successMsg}");
        }

        var errorMsg = Uri.EscapeDataString(GetErrorMessage(result.ErrorCode));
        var safeCode = Uri.EscapeDataString(result.ErrorCode ?? GoogleOAuthErrorCodes.AuthorizationFailed);
        return Redirect($"{clientsRedirectUrl}?googleAuth=error&errorCode={safeCode}&message={errorMsg}");
    }


    //------------------------------------------------------------------ 
    /// <summary>
    /// Returns the authenticated user's Google Ads OAuth connection status and linked client accounts.
    /// </summary>
    [HttpGet("status")]
    public async Task<IActionResult> GetStatus(CancellationToken cancellationToken = default)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(new { message = "User identity not found in token." });
        }

        if (_googleAdsService is null)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new { message = "Google Ads service is not available." });
        }

        var status = await _googleAdsService.GetConnectionStatusAsync(userId, cancellationToken);
        return Ok(status);
    }

    //------------------------------------------------------------------ 

    /// <summary>
    /// Discovers all Google Ads accounts accessible to the authenticated user's stored Google OAuth connection.
    /// </summary>
    [HttpGet("accounts")]
    public async Task<IActionResult> GetAccessibleAccounts(CancellationToken cancellationToken = default)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(new { message = "User identity not found in token." });
        }

        if (_googleAdsService is null)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new { message = "Google Ads service is not available." });
        }

        var result = await _googleAdsService.DiscoverAccessibleAccountsAsync(userId, cancellationToken);
        if (!result.Success)
        {
            var errorPayload = new
            {
                message = result.Message ?? "Failed to discover Google Ads accounts.",
                errorCode = result.ErrorCode ?? GoogleOAuthErrorCodes.DiscoveryFailed,
                connected = result.Connected
            };

            return result.ErrorCode == GoogleOAuthErrorCodes.NotConnected
                ? NotFound(errorPayload)
                : BadRequest(errorPayload);
        }

        return Ok(result);
    }

    //------------------------------------------------------------------ 

    /// <summary>
    /// Associates a selected Google Ads Advertiser account with an existing Dashboard Client.
    /// Validates both Client ownership and Google Ads account accessibility on the backend,
    /// and prevents selecting a Manager (MCC) account as an advertising client.
    /// </summary>
    [HttpPost("accounts/select")]
    public async Task<IActionResult> SelectAccount(
        [FromBody] SelectGoogleAdsAccountRequestDto request,
        CancellationToken cancellationToken = default)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(new { message = "User identity not found in token." });
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        if (_googleAdsService is null)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new { message = "Google Ads service is not available." });
        }

        var result = await _googleAdsService.AssociateAccountWithClientAsync(
            userId,
            request,
            cancellationToken);

        if (!result.Success)
        {
            return result.ErrorCode switch
            {
                GoogleOAuthErrorCodes.ClientNotFound or GoogleOAuthErrorCodes.NotConnected =>
                    NotFound(new { message = result.Message, errorCode = result.ErrorCode }),

                GoogleOAuthErrorCodes.UnauthorizedClient or GoogleOAuthErrorCodes.UnauthorizedCustomerAccount =>
                    StatusCode(StatusCodes.Status403Forbidden, new { message = result.Message, errorCode = result.ErrorCode }),

                GoogleOAuthErrorCodes.CustomerAlreadyLinked =>
                    Conflict(new { message = result.Message, errorCode = result.ErrorCode }),

                _ => BadRequest(new { message = result.Message, errorCode = result.ErrorCode })
            };
        }

        return Ok(result);
    }

    //------------------------------------------------------------------ 

    /// <summary>
    /// Disconnects (deactivates) only the specified Dashboard Client's Google Ads account association.
    /// Does NOT revoke the user's Google OAuth tokens, does NOT delete the user's OAuthConnection,
    /// and does NOT affect any other Dashboard Client's Google Ads association.
    /// </summary>
    [HttpDelete("clients/{clientId:int}/disconnect")]
    public async Task<IActionResult> DisconnectClientAccount(
        [FromRoute] int clientId,
        CancellationToken cancellationToken = default)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(new { message = "User identity not found in token." });
        }

        if (_googleAdsService is null)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new { message = "Google Ads service is not available." });
        }

        var result = await _googleAdsService.DisconnectClientAccountAsync(
            userId,
            clientId,
            cancellationToken);

        if (!result.Success)
        {
            return result.ErrorCode switch
            {
                GoogleOAuthErrorCodes.ClientNotFound =>
                    NotFound(new { message = result.Message, errorCode = result.ErrorCode }),

                GoogleOAuthErrorCodes.UnauthorizedClient =>
                    StatusCode(StatusCodes.Status403Forbidden, new { message = result.Message, errorCode = result.ErrorCode }),

                _ => BadRequest(new { message = result.Message, errorCode = result.ErrorCode })
            };
        }

        return Ok(result);
    }

    //------------------------------------------------------------------ 

    /// <summary>
    /// Disconnects the authenticated Dashboard user's Google Ads OAuth connection,
    /// revoking tokens with Google (best-effort) and removing stored credentials.
    /// </summary>
    [HttpDelete("disconnect")]
    public async Task<IActionResult> Disconnect(CancellationToken cancellationToken = default)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(new { message = "User identity not found in token." });
        }

        var disconnected = await _googleOAuthService.DisconnectAsync(userId, cancellationToken);
        if (!disconnected)
        {
            return NotFound(new
            {
                message = "No active Google Ads connection found for this user.",
                connected = false
            });
        }

        return Ok(new
        {
            message = "Google Ads connection disconnected successfully.",
            connected = false
        });
    }



    private static string GetErrorMessage(string? errorCode) => errorCode switch
    {
        GoogleOAuthErrorCodes.AlreadyConnected => "Your account is already connected to Google Ads. Reconnecting is not allowed.",
        GoogleOAuthErrorCodes.AccessDenied => "Google Ads authorization was canceled or permission was declined.",
        GoogleOAuthErrorCodes.MissingRefreshToken => "Google did not return a refresh token. Please try again and grant offline access.",
        GoogleOAuthErrorCodes.InvalidGrant => "The authorization code was invalid, expired, or already used.",
        GoogleOAuthErrorCodes.InvalidState => "Security verification failed (invalid or expired OAuth state). Please try again.",
        GoogleOAuthErrorCodes.ScopeNotGranted => "Required Google Ads permissions were not granted during consent.",
        GoogleOAuthErrorCodes.NotConfigured => "Google OAuth is not properly configured on the server.",
        GoogleOAuthErrorCodes.RedirectUriMismatch => "OAuth redirect URI mismatch with Google Cloud Console configuration.",
        _ => "Failed to complete Google Ads authorization. Please try again."
    };
}
