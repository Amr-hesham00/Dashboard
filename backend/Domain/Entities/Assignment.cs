namespace Dashboard.Domain.Entities;
public class Assignment
{

    public int Id { get; set; }  // PK
    public string AssociateId { get; set; } = null!; // FK -> AssociateProfile
    public int ClientId { get; set; }                // FK -> Client
    public DateTime AssignedAt { get; set; }

    public AssociateProfile Associate { get; set; } = null!;
    public Client Client { get; set; } = null!;

}
