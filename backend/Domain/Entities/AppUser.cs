using Dashboard.Domain.Entities;
using Dashboard.Domain.Enums;
using Microsoft.AspNetCore.Identity;

namespace Dashboard.Infrastructure;

public class AppUser : IdentityUser
{
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string? ProfileImage { get; set; }
    public Roles? Role { get; set; }

    // Manager role
    public ICollection<Client> ManagedClients { get; set; } = new List<Client>();
    public ICollection<AssociateTeam> ManagedTeams { get; set; } = new List<AssociateTeam>();

    // Associate role
    public AssociateProfile? AssociateProfile { get; set; }
}
