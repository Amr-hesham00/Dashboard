using Dashboard.Domain.Enums;

namespace Dashboard.Domain.Entities;
public class Client
{
    public int Id { get; set; }
    public string CompanyName { get; set; } = null!;
    public string? Logo { get; set; }
    public string Website { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Phone { get; set; } = null!;
    public string Country { get; set; } = null!;
    public Currency Currency { get; set; }
    public ClientStatus Status { get; set; }
    public BusinessModel BusinessModel { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? Notes { get; set; }

    public string ManagerId { get; set; } = null!; // FK
    public ICollection<Assignment>? Assignments { get; set; }
    public ICollection<Platform> Platforms { get; set; }


}
