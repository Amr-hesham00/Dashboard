using Dashboard.Application.Interfaces.Repositories;
using Dashboard.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Dashboard.Infrastructure.Repositories;

public class ClientTargetRepo : GenericRepo<ClientTarget>, IClientTargetRepo
{
    public ClientTargetRepo(AppDbContext context) : base(context)
    {
    }

    public async Task<ClientTarget?> GetByClientIdAsync(int clientId)
    {
        return await dbset
            .Include(t => t.Client)
            .FirstOrDefaultAsync(t => t.ClientId == clientId);
    }

    public async Task<List<ClientTarget>> GetAllWithClientAsync()
    {
        return await dbset
            .Include(t => t.Client)
            .ToListAsync();
    }
}
