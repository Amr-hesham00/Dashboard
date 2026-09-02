using Dashboard.Application.Interfaces.Repositories;

namespace Dashboard.Application.Interfaces;
public interface IUnitOfWork : IDisposable
{

    IAdRepo Ad { get; }
    IAdSetRepo AdSet { get; }
    IAssignmentRepo Assignment { get; }
    IAssociateProfileRepo AssociateProfile { get; }
    IAssociateTeamRepo AssociateTeam { get; }
    ICampaignRepo Campaign { get; }
    IClientRepo Client { get; }
    IPlatformRepo Platform { get; }
    IUserRepo User { get; }
    IRefreshTokenRepo RefreshToken { get; }

    Task Complete();
}
