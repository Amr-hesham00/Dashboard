using Dashboard.Domain.Entities;

namespace Dashboard.Application.Interfaces.Repositories;

public interface IClientTargetRepo : IGenericRepo<ClientTarget>
{
    Task<ClientTarget?> GetByClientIdAsync(int clientId);
    Task<List<ClientTarget>> GetAllWithClientAsync();
}
