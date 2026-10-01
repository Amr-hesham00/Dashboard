using Dashboard.Application.Interfaces.Repositories;
using Dashboard.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Dashboard.Infrastructure.Repositories;

public class ClientRepo : GenericRepo<Client>, IClientRepo
{
    public ClientRepo(AppDbContext context) : base(context)
    {
    }

    public override async Task<Client?> GetById(int clientId)
    {
        return await dbset
            .AsNoTracking()
            .Include(client => client.Target)
            .Include(client => client.Platforms)
            .FirstOrDefaultAsync(client => client.Id == clientId);
    }
    /// <summary>
    /// returns a list of clients based on the user's role.
    /// </summary>
    public async Task<List<Client>> GetClientsByUserAsync(string userId, string? role)
    {
        var query = dbset
            .Include(c => c.Platforms)
                .ThenInclude(p => p.Campaigns)
            .Include(c => c.Target)
            .Include(c => c.Assignments)
            .AsQueryable();

        if (string.Equals(role, "Admin", StringComparison.OrdinalIgnoreCase))
            return await query.ToListAsync();

        if (string.Equals(role, "Manager", StringComparison.OrdinalIgnoreCase))
            return await query.Where(c => c.ManagerId == userId).ToListAsync();


        // Default / Associate: clients assigned to this associate or managed by this user
        return await query
            .Where(c => c.Assignments != null && c.Assignments.Any(a => a.AssociateId == userId))
            .ToListAsync();
    }

    public async Task<List<Client>> GetAllWithDetailsAsync()
    {
        return await dbset
            .Include(c => c.Platforms)
                .ThenInclude(p => p.Campaigns)
            .Include(c => c.Target)
            .Include(c => c.Assignments)
            .ToListAsync();
    }

    public async Task<Client?> GetByIdWithDetailsAsync(int id)
    {
        return await dbset
            .Include(c => c.Platforms)
                .ThenInclude(p => p.Campaigns)
            .Include(c => c.Target)
            .Include(c => c.Assignments)
            .FirstOrDefaultAsync(c => c.Id == id);
    }
}
