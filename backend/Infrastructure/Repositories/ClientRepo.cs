using Dashboard.Application.Interfaces.Repositories;
using Dashboard.Domain.Entities;

namespace Dashboard.Infrastructure.Repositories;
public class ClientRepo : GenericRepo<Client>, IClientRepo
{

    public ClientRepo(AppDbContext context) : base(context)
    {
    }
}
