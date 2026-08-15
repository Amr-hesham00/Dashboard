using Dashboard.Application.Interfaces.Repositories;
using Dashboard.Domain.Entities;

namespace Dashboard.Infrastructure.Repositories;
public class AssociateTeamRepo : GenericRepo<AssociateTeam>, IAssociateTeamRepo
{
    public AssociateTeamRepo(AppDbContext context) : base(context)
    {
    }
}
