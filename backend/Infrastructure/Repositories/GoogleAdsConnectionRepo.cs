using Dashboard.Application.Interfaces.Repositories;
using Dashboard.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Dashboard.Infrastructure.Repositories;

public class GoogleAdsConnectionRepo : GenericRepo<GoogleAdsConnection>, IGoogleAdsConnectionRepo
{
    public GoogleAdsConnectionRepo(AppDbContext context) : base(context)
    {
    }

    public async Task<GoogleAdsConnection?> GetByUserIdAsync(string userId)
    {
        return await dbset.FirstOrDefaultAsync(c => c.UserId == userId);
    }

    public async Task<bool> IsValidAccessToken(string userId)
    {
        var connection = await dbset.FirstOrDefaultAsync(c => c.UserId == userId);

        return connection != null && connection.AccessTokenExpiresAt > DateTimeOffset.UtcNow;
    }
}
