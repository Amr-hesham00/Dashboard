using Dashboard.Domain.Entities;
using Dashboard.Domain.Enums;

namespace Dashboard.Application.Interfaces.Repositories;

public interface IOAuthConnectionRepo : IGenericRepo<OAuthConnection>
{
    Task<OAuthConnection?> GetByUserAndPlatformAsync(string userId, PlatformType platformType);
    Task<OAuthConnection?> GetByUserIdAsync(string userId, PlatformType platformType = PlatformType.GoogleAds);
    Task<bool> IsValidAccessToken(string userId, PlatformType platformType = PlatformType.GoogleAds);
    Task<IReadOnlyList<OAuthConnection>> GetAllByUserIdAsync(string userId);
}
