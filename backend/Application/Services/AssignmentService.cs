using Dashboard.Application.Interfaces;
using Dashboard.Application.Interfaces.Services;

namespace Dashboard.Application.Services;
public class AssignmentService : IAssignmentService
{
    private readonly IUnitOfWork unitOfWork;

    public AssignmentService(IUnitOfWork unitOfWork)
    {
        this.unitOfWork = unitOfWork;
    }
}
