using Dashboard.Domain.Entities;

namespace Dashboard.Application.Interfaces.Repositories;

public interface IAssetGroupRepo : IGenericRepo<AssetGroup>
{
    Task<AssetGroup?> GetByIdWithMetricsAsync(int id, DateOnly startDate, DateOnly endDate);
    Task<IEnumerable<AssetGroup>> GetByCampaignIdAsync(int campaignId, DateOnly startDate, DateOnly endDate);
    Task<IEnumerable<AssetGroup>> GetByClientIdAsync(int clientId);
    Task<List<AssetGroup>> GetTrackedByPlatformIdAsync(int platformId);
}

