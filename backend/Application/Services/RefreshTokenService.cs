using Dashboard.Application.Interfaces.Services;
using System.Security.Cryptography;
using System.Text;

namespace Dashboard.Application.Services;

public class RefreshTokenService : IRefreshTokenService
{
    public string GenerateToken()
    {
        var randomBytes = RandomNumberGenerator.GetBytes(64);
        return Convert.ToBase64String(randomBytes);
    }

    public string HashToken(string token)
    {
           using var sha256 = SHA256.Create();

        var bytes = Encoding.UTF8.GetBytes(token);
        var hash = sha256.ComputeHash(bytes);

        return Convert.ToBase64String(hash);
    }
}
