using Dashboard.Application.Interfaces.Repositories;

namespace Dashboard.Infrastructure.Repositories;
public class UserRepo : GenericRepo<AppUser>, IUserRepo
{
    public UserRepo(AppDbContext context) : base(context)
    {
    }
}
