using Dashboard.Domain.Entities;

namespace Dashboard.Application.Interfaces.Repositories;
public interface IAdSetRepo : IGenericRepo<AdSet>
{
    Task<IEnumerable<AdSet>> GetByCampaignIdAsync(int campaignId, DateOnly startDate, DateOnly endDate);
    Task<IEnumerable<AdSet>> GetByClientIdAsync(int clientId);
}
