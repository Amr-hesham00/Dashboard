using Dashboard.Domain.Enums;

namespace Dashboard.Domain.Entities;
public class AssociateTeam
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public AssociateTeamStatus Status { get; set; }

    public string ManagerId { get; set; } = null!; // FK
    public ICollection<AssociateProfile>? AssociateProfiles { get; set; }

}
