using Dashboard.Application.Interfaces.Repositories;
using Dashboard.Domain.Entities;

namespace Dashboard.Infrastructure.Repositories;
public class AdSetRepo : GenericRepo<AdSet>, IAdSetRepo
{
    public AdSetRepo(AppDbContext context) : base(context)
    {
    }
}
