using Dashboard.Domain.Entities;

namespace Dashboard.Application.Interfaces.Repositories;
public interface ICampaignRepo : IGenericRepo<Campaign>
{
    public Task<IEnumerable<Campaign>> GetByClientIdAsync(int clientId, DateOnly startDate, DateOnly endDate);
    public Task<IEnumerable<Campaign>> GetByPlatformAsync(int clientId, int platformid, DateOnly startDate, DateOnly endDate);
}
