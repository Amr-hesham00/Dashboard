using System.ComponentModel.DataAnnotations;
using Dashboard.Domain.Enums;

namespace Dashboard.Application.DTOs;

public class AssociateTeamDTO
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
    public AssociateTeamStatus Status { get; set; }
    public string ManagerId { get; set; } = null!;
}

public class CreateAssociateTeamDTO
{
    [Required]
    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    public AssociateTeamStatus Status { get; set; }

    [Required]
    public string ManagerId { get; set; } = null!;
}

public class UpdateAssociateTeamDTO
{
    [Required]
    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    public AssociateTeamStatus Status { get; set; }

    [Required]
    public string ManagerId { get; set; } = null!;
}
