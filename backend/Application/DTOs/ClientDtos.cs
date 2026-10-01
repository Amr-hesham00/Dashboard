using Dashboard.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace Dashboard.Application.DTOs;

public class ClientDTO
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
    public string ManagerId { get; set; } = null!;
    public ClientTargetDTO? Target { get; set; }
    public List<PlatformDTO> Platforms { get; set; } = new();

    // Performance & ROAS Target Metrics (Calculated on Backend)
    public decimal Spend { get; set; }
    public decimal Revenue { get; set; }
    public int Conversions { get; set; }
    public int Impressions { get; set; }
    public int Clicks { get; set; }
    public double CTR { get; set; }
    public double CPC { get; set; }
    public double CPM { get; set; }
    public double CPA { get; set; }
    public double ActualROAS { get; set; }
    public double TargetROAS { get; set; }
    public double AchievedROAS { get; set; }

    // Target Progress Percentages (Calculated on Backend)
    public double BudgetProgress { get; set; }
    public double RevenueProgress { get; set; }
    public double ConversionsProgress { get; set; }
    public double CPAProgress { get; set; }
}

public class ManagerClientsDTO : ClientDTO { }
public class AdminClientsDTO : ClientDTO { }
public class AssociateClientsDTO : ClientDTO { }
public class CreateClientDTO
{
    [Required]
    public string CompanyName { get; set; } = null!;

    public string? Logo { get; set; }

    [Required]
    [Url]
    public string Website { get; set; } = null!;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = null!;

    [Required]
    [Phone]
    public string Phone { get; set; } = null!;

    [Required]
    public string Country { get; set; } = null!;

    [Required]
    public Currency Currency { get; set; }

    public ClientStatus Status { get; set; }
    public BusinessModel BusinessModel { get; set; }

    public string? Notes { get; set; }

    [Required]
    public string ManagerId { get; set; } = null!;
}

public class UpdateClientDTO
{
    [Required]
    public string CompanyName { get; set; } = null!;

    public string? Logo { get; set; }

    [Required]
    [Url]
    public string Website { get; set; } = null!;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = null!;

    [Required]
    [Phone]
    public string Phone { get; set; } = null!;

    [Required]
    public string Country { get; set; } = null!;

    [Required]
    public Currency Currency { get; set; }

    public ClientStatus Status { get; set; }
    public BusinessModel BusinessModel { get; set; }

    public string? Notes { get; set; }

    [Required]
    public string ManagerId { get; set; } = null!;
}
