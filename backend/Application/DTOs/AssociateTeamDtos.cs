using Dashboard.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace Dashboard.Application.DTOs;

public class AssociateTeamDTO
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
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
