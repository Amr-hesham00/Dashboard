using System.ComponentModel.DataAnnotations;
using Dashboard.Domain.Enums;

namespace Dashboard.Application.DTOs;

public class AssociateProfileDTO
{
    public string Id { get; set; } = null!;
    public AssociateStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public int TeamId { get; set; }
}

public class CreateAssociateProfileDTO
{
    [Required]
    public string Id { get; set; } = null!; // AppUser.Id

    public AssociateStatus Status { get; set; }

    [Required]
    public int TeamId { get; set; }
}

public class UpdateAssociateProfileDTO
{
    public AssociateStatus Status { get; set; }

    [Required]
    public int TeamId { get; set; }
}
