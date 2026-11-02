using Dashboard.Application.Interfaces.Repositories;
using Dashboard.Domain.Entities;
using Dashboard.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Dashboard.Infrastructure.Repositories;

public class OAuthConnectionRepo : GenericRepo<OAuthConnection>, IOAuthConnectionRepo
{
    public OAuthConnectionRepo(AppDbContext context) : base(context)
    {
    }

    public async Task<OAuthConnection?> GetByUserAndPlatformAsync(string userId, PlatformType platformType)
    {
        return await dbset.FirstOrDefaultAsync(c => c.UserId == userId && c.PlatformType == platformType);
    }

    public async Task<OAuthConnection?> GetByUserIdAsync(string userId, PlatformType platformType = PlatformType.GoogleAds)
    {
        return await GetByUserAndPlatformAsync(userId, platformType);
    }

    public async Task<bool> IsValidAccessToken(string userId, PlatformType platformType = PlatformType.GoogleAds)
    {
        var connection = await GetByUserAndPlatformAsync(userId, platformType);
        return connection != null && connection.AccessTokenExpiresAt > DateTimeOffset.UtcNow;
    }

    public async Task<IReadOnlyList<OAuthConnection>> GetAllByUserIdAsync(string userId)
    {
        return await dbset.Where(c => c.UserId == userId).ToListAsync();
    }
}
