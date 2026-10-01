using Dashboard.Domain.Entities;

namespace Dashboard.Application.Interfaces.Repositories;

public interface ISearchTermRepo : IGenericRepo<SearchTerm>
{
    Task<IEnumerable<SearchTerm>> GetByAdSetIdAndDateRangeAsync(int adSetId, DateOnly startDate, DateOnly endDate);
    Task<IEnumerable<SearchTerm>> GetByAdSetIdAsync(int adSetId);
    Task<IEnumerable<SearchTerm>> GetByCampaignIdAndDateRangeAsync(int campaignId, DateOnly startDate, DateOnly endDate);
    Task<IEnumerable<SearchTerm>> GetByPlatformAndDateRangeAsync(int clientId, int platformId, DateOnly startDate, DateOnly endDate);
    Task<IEnumerable<SearchTerm>> GetByAdSetIdAsync(int adSetId, DateOnly start, DateOnly end);
}
