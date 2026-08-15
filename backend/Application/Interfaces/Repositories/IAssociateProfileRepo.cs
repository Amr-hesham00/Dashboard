using Dashboard.Domain.Entities;


namespace Dashboard.Application.Interfaces.Repositories;
public interface IAssociateProfileRepo : IGenericRepo<AssociateProfile>
{
    Task<AssociateProfile?> GetByStringId(string id);
}
