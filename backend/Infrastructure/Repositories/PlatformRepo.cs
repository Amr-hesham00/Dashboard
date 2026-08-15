using Dashboard.Application.Interfaces.Repositories;
using Dashboard.Domain.Entities;

namespace Dashboard.Infrastructure.Repositories;
public class PlatformRepo : GenericRepo<Platform>, IPlatformRepo
{
    public PlatformRepo(AppDbContext context) : base(context)
    {
    }
}
