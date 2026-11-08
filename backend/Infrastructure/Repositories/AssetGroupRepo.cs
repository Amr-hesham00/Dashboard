using Dashboard.Application.Interfaces.Repositories;
using Dashboard.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Dashboard.Infrastructure.Repositories;

public class AssetGroupRepo : GenericRepo<AssetGroup>, IAssetGroupRepo
{
    public AssetGroupRepo(AppDbContext context) : base(context)
    {
    }

    public override async Task<AssetGroup?> GetById(int id)
    {
        return await dbset
            .AsNoTracking()
            .Include(x => x.Campaign)
                .ThenInclude(c => c.Platform)
                    .ThenInclude(p => p.Client)
            .FirstOrDefaultAsync(x => x.Id == id);
    }

    public async Task<AssetGroup?> GetByIdWithMetricsAsync(int id, DateOnly startDate, DateOnly endDate)
    {
        return await dbset
            .AsNoTracking()
            .Include(x => x.Campaign)
                .ThenInclude(c => c.Platform)
                    .ThenInclude(p => p.Client)
            .Include(x => x.DailyMetrics.Where(metric => metric.Date >= startDate && metric.Date <= endDate))
            .FirstOrDefaultAsync(x => x.Id == id);
    }

    public async Task<IEnumerable<AssetGroup>> GetByCampaignIdAsync(int campaignId, DateOnly startDate, DateOnly endDate)
    {
        return await dbset
            .AsNoTracking()
            .Where(ag => ag.CampaignId == campaignId)
            .Include(ag => ag.DailyMetrics.Where(metric => metric.Date >= startDate && metric.Date <= endDate))
            .ToListAsync();
    }

    public async Task<IEnumerable<AssetGroup>> GetByClientIdAsync(int clientId)
    {
        return await dbset.AsNoTracking()
            .Where(x => x.Campaign.Platform.ClientId == clientId)
            .ToListAsync();
    }

    public async Task<List<AssetGroup>> GetTrackedByPlatformIdAsync(int platformId)
    {
        return await dbset
            .Where(x => x.Campaign.PlatformId == platformId)
            .ToListAsync();
    }
}

