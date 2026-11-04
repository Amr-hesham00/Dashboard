using Dashboard.Application.Interfaces.Repositories;
using Dashboard.Domain.Entities;
using Dashboard.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Dashboard.Infrastructure.Repositories;
public class PlatformRepo : GenericRepo<Platform>, IPlatformRepo
{
    public PlatformRepo(AppDbContext context) : base(context)
    {
    }

    public async Task<Platform?> GetByClientAndTypeAsync(int clientId, PlatformType platformType)
    {
        return await dbset
            .Include(p => p.Client)
            .Include(p => p.OAuthConnection)
            .FirstOrDefaultAsync(p => p.ClientId == clientId && p.PlatformType == platformType);
    }

    public async Task<Platform?> GetByExternalAccountIdAsync(PlatformType platformType, string externalAccountId)
    {
        return await dbset
            .Include(p => p.Client)
            .FirstOrDefaultAsync(p =>
                p.PlatformType == platformType &&
                p.ExternalAccountId == externalAccountId &&
                p.Status == PlatformStatus.Connected);
    }

    public async Task<List<Platform>> GetByOAuthConnectionIdAsync(int oauthConnectionId)
    {
        return await dbset
            .Include(p => p.Client)
            .Where(p => p.OAuthConnectionId == oauthConnectionId)
            .ToListAsync();
    }

    public async Task<Platform?> GetByIdWithDetailsAsync(int platformId)
    {
        return await dbset
            .Include(p => p.Client)
            .Include(p => p.OAuthConnection)
            .FirstOrDefaultAsync(p => p.Id == platformId);
    }

    public async Task<List<Platform>> GetByClientIdAsync(int clientId)
    {
        return await dbset
            .Include(p => p.Client)
            .Include(p => p.OAuthConnection)
            .Where(p => p.ClientId == clientId)
            .ToListAsync();
    }

    public async Task<List<Platform>> GetConnectedByTypeAsync(PlatformType platformType)
    {
        return await dbset
            .Include(p => p.Client)
            .Include(p => p.OAuthConnection)
            .Where(p => p.PlatformType == platformType &&
                        p.Status == PlatformStatus.Connected &&
                        p.ExternalAccountId != null)
            .ToListAsync();
    }
}
