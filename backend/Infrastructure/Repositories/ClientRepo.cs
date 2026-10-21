using Dashboard.Application.DTOs;
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
    public async Task<List<Client>> GetClientsByUserAsync(string userId, string? role)
    {
        var query = dbset
            .AsNoTracking()
            .Include(c => c.Platforms)
                .ThenInclude(p => p.Campaigns)
                    .ThenInclude(camp => camp.AdSets)
                        .ThenInclude(adset => adset.Ads)
                            .ThenInclude(ad => ad.DailyMetrics)
            .Include(c => c.Target)
            .Include(c => c.Assignments)
            .AsSplitQuery()
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
            .AsNoTracking()
            .Include(c => c.Platforms)
                .ThenInclude(p => p.Campaigns)
                    .ThenInclude(camp => camp.AdSets)
                        .ThenInclude(adset => adset.Ads)
                            .ThenInclude(ad => ad.DailyMetrics)
            .Include(c => c.Target)
            .Include(c => c.Assignments)
            .AsSplitQuery()
            .ToListAsync();
    }

    public async Task<Client?> GetByIdWithDetailsAsync(int id)
    {
        return await dbset
            .AsNoTracking()
            .Include(c => c.Platforms)
                .ThenInclude(p => p.Campaigns)
                    .ThenInclude(camp => camp.AdSets)
                        .ThenInclude(adset => adset.Ads)
                            .ThenInclude(ad => ad.DailyMetrics)
            .Include(c => c.Target)
            .Include(c => c.Assignments)
            .AsSplitQuery()
            .FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<IEnumerable<ClientLookupDTO>?> GetClientLookupAsync(string userId)
    {
        return await dbset
            .AsNoTracking()
            .Where(c => c.ManagerId == userId)
            .OrderBy(c => c.CompanyName)
            .Select(c => new ClientLookupDTO
            {
                ClientId = c.Id,
                CompanyName = c.CompanyName
            })
            .ToListAsync();
    }
}
