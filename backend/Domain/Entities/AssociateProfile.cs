using Dashboard.Domain.Enums;

namespace Dashboard.Domain.Entities;

public class AssociateProfile
{
    public string Id { get; set; } = null!; // Pk & Fk => Appuser.Id
    public AssociateStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }

    // Navigation property for 1:1 relationship with AppUser

    // We can get every associate's manager id through its team's manager id
    public int TeamId { get; set; }
    public AssociateTeam Team { get; set; } = null!;
    public ICollection<Assignment>? Assignments { get; set; }
}