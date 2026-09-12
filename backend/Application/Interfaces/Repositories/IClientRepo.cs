using Dashboard.Domain.Entities;

namespace Dashboard.Application.Interfaces.Repositories;

public interface IClientRepo : IGenericRepo<Client>
{
    Task<List<Client>> GetClientsByUserAsync(string userId, string? role);
    Task<List<Client>> GetAllWithDetailsAsync();
    Task<Client?> GetByIdWithDetailsAsync(int id);
}
