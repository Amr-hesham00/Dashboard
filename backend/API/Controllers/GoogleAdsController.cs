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

    public GoogleAdsController(IGoogleOAuthService googleOAuthService)
    {
        _googleOAuthService = googleOAuthService;
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

        if (result.AlreadyConnected || result.HasToken)
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
    /// Step C: OAuth callback endpoint matching the registered redirect URI:
    /// https://localhost:3000/api/google-ads/callback
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
}
