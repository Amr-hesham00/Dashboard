using Dashboard.Application.Interfaces.Repositories;
using Dashboard.Domain.Entities;

namespace Dashboard.Infrastructure.Repositories;
public class AssignmentRepo : GenericRepo<Assignment>, IAssignmentRepo
{
    public AssignmentRepo(AppDbContext context) : base(context)
    {
    }
}
