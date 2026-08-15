using Dashboard.Application.Interfaces.Repositories;
using Dashboard.Domain.Entities;

namespace Dashboard.Infrastructure.Repositories;
public class AdRepo : GenericRepo<Ad>, IAdRepo
{
    public AdRepo(AppDbContext context) : base(context)
    {
    }
}
