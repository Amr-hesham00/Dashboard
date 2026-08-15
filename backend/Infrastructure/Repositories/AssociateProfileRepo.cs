using Dashboard.Application.Interfaces.Repositories;
using Dashboard.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Dashboard.Infrastructure.Repositories;
public class AssociateProfileRepo : GenericRepo<AssociateProfile>, IAssociateProfileRepo
{
    public AssociateProfileRepo(AppDbContext context) : base(context)
    {
    }

    public async Task<AssociateProfile?> GetByStringId(string id)
    {
        return await dbset.FirstOrDefaultAsync(p => p.Id == id);
    }
}
