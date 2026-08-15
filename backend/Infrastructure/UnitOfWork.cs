using Dashboard.Application.Interfaces;
using Dashboard.Application.Interfaces.Repositories;

namespace Dashboard.Infrastructure;
public class UnitOfWork : IUnitOfWork
{

    private readonly AppDbContext _context;
    public IAdRepo Ad { get; private set; }
    public IAdSetRepo AdSet { get; private set; }
    public IAssignmentRepo Assignment { get; private set; }
    public IAssociateProfileRepo AssociateProfile { get; private set; }
    public IAssociateTeamRepo AssociateTeam { get; private set; }
    public ICampaignRepo Campaign { get; private set; }
    public IClientRepo Client { get; private set; }
    public IPlatformRepo Platform { get; private set; }
    public IUserRepo User { get; private set; }

    public UnitOfWork(AppDbContext context, IAdRepo ad, IAdSetRepo adSet, IAssignmentRepo assignment, IAssociateProfileRepo associateProfile, IAssociateTeamRepo associateTeam, ICampaignRepo campaign, IClientRepo client, IPlatformRepo platform, IUserRepo user)
    {
        _context = context;
        Ad = ad;
        AdSet = adSet;
        Assignment = assignment;
        AssociateProfile = associateProfile;
        AssociateTeam = associateTeam;
        Campaign = campaign;
        Client = client;
        Platform = platform;
        User = user;
    }
    public async Task Complete()
    {
        await _context.SaveChangesAsync();
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}
