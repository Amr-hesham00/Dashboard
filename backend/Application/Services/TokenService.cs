using Dashboard.Application.Interfaces.Services;
using Dashboard.Infrastructure;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Dashboard.Application.Services;

public class TokenService : ITokenService
{
    private readonly IConfiguration _configuration;

    public TokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }


    /// <summary>
    /// Generates a JWT token for the specified user.
    /// </summary>
    /// <remarks>Returns the Token string</remarks>
    public string GenerateToken(AppUser user)
    {
        // Retrieve the secret key from configuration
        var secretKey = _configuration["JWT:SecretKey"]
            ?? throw new InvalidOperationException("JWT SecretKey is not configured.");

        // Create a symmetric security key using the secret key
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        // Create claims for the token
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id),
            new(ClaimTypes.Name, user.UserName ?? string.Empty),
            new(ClaimTypes.Email, user.Email ?? string.Empty),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        // Add the user's role as a claim 
        if (user.Role.HasValue)
        {
            claims.Add(new Claim(ClaimTypes.Role, user.Role.Value.ToString()));
        }

        int expiryMinutes = _configuration.GetValue("JWT:ExpiryInMinutes", 10);

        // Create the JWT token descriptor
        var tokenDescriptor = new JwtSecurityToken(
            issuer: _configuration["JWT:Issuer"],
            audience: _configuration["JWT:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
            signingCredentials: creds
        );

        // Generate the JWT token string
        return new JwtSecurityTokenHandler().WriteToken(tokenDescriptor);
    }
}
