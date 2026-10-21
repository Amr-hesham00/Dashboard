using Dashboard.Domain.Entities;

namespace Dashboard.Application.Interfaces.Repositories;
public interface ICampaignRepo : IGenericRepo<Campaign>
{
    public Task<IEnumerable<Campaign>> GetByClientIdAsync(int clientId, DateOnly startDate, DateOnly endDate);
    /// <summary>
    /// returns campaigns for a given client and platform within the specified date range
    /// </summary>
    public Task<IEnumerable<Campaign>> GetByPlatformAsync(int clientId, int platformid, DateOnly startDate, DateOnly endDate);
}
