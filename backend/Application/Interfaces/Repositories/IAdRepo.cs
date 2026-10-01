using Dashboard.Domain.Entities;

namespace Dashboard.Application.Interfaces.Repositories;
public interface IAdRepo : IGenericRepo<Ad>
{
    Task<IEnumerable<Ad>> GetByClientIdAsync(int clientId);
    /// <returns>
    /// returns all ads of the specified AdSet within the date range
    /// </returns>
    Task<IEnumerable<Ad>> GetByAdSetIdAsync(int adSetId, DateOnly start, DateOnly end);
}
