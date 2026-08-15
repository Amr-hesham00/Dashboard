using Dashboard.Infrastructure;

namespace Dashboard.Application.Interfaces.Services;

public interface ITokenService
{
    string GenerateToken(AppUser user);
}
