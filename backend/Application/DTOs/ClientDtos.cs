using Dashboard.Domain.Enums;
using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace Dashboard.Application.DTOs;


public class ClientDTO
{
    public int ClientId { get; set; }
    public string CompanyName { get; set; } = null!;
    public string? Logo { get; set; }
    public BusinessModel Model { get; set; }
    public int ActiveCampaigns { get; set; }
    public ClientStatus Status { get; set; }

    // Detail fields — populated by GetClientByIdAsync
    public string? Website { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Country { get; set; }
    public string? Currency { get; set; }
    public string? Notes { get; set; }
    public string? ManagerId { get; set; }
    public DateTimeOffset? CreatedAt { get; set; }
    public List<ClientPlatformDTO>? Platforms { get; set; }

    // Aggregated metrics
    public double Spend { get; set; }
    public double Revenue { get; set; }
    public int Impressions { get; set; }
    public int Clicks { get; set; }
    public int Conversions { get; set; }
    public double ROAS { get; set; }
    public double? TargetROAS { get; set; }
    public double? AchievedROAS { get; set; }
    public int? TargetConversions { get; set; }
}
public class ManagerClientsDTO
{

    //KPIs
    public int TotalClients { get; set; }
    public int ActiveCampaigns { get; set; }


    //clients table
    public IEnumerable<ManagerClientsTable>? Row { get; set; }


}
public class ClientPlatformDTO
{
    public int Id { get; set; }
    public string PlatformType { get; set; } = null!;
    public string Key { get; set; } = null!;
    public string Status { get; set; } = null!;
    public bool Connected { get; set; }
}

public class AdminClientsDTO
{
    public int TotalClients { get; set; }
    public int ActiveCampaigns { get; set; }
    public IEnumerable<ManagerClientsTable>? Row { get; set; }
    public string? Name { set; get; }
    public string? Email { set; get; }
    public string? Role { set; get; }
    public string? Phone { set; get; }
    public ClientStatus? Status { set; get; }
}

public class AssociateClientsDTO
{
    public int TotalClients { get; set; }
    public int ActiveCampaigns { get; set; }
    public IEnumerable<ManagerClientsTable>? Row { get; set; }
}

public class ManagerClientsTable
{
    public int ClientId { get; set; }
    public string CompanyName { get; set; } = null!;
    public string? Logo { get; set; }
    public string? Website { get; set; }
    public string? Country { get; set; }
    public string? Currency { get; set; }
    public BusinessModel Model { get; set; }

    public int ActiveCampaigns { get; set; }
    public ClientStatus Status { get; set; }

    public List<ClientPlatformDTO> Platforms { get; set; } = new();

    public double Spend { get; set; }
    public double Revenue { get; set; }
    public int Conversions { get; set; }
    public int TargetConversions { get; set; }

    public double ROAS { get; set; }
    public double TargetROAS { get; set; }
    public double AchievedROAS { get; set; }
}


public class CreateClientDTO
{
    public int ClientId { get; set; }

    [Required]
    public string CompanyName { get; set; } = null!;

    public IFormFile? LogoFile { get; set; }

    public string? Logo { get; set; }

    [Required]
    public string Website { get; set; } = null!;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = null!;

    [Required]
    [Length(8, 20, ErrorMessage = "Phone number must be between 8 and 20 characters.")]
    public string Phone { get; set; } = null!;

    [Required]
    public string Country { get; set; } = null!;

    [Required]
    public Currency Currency { get; set; }

    public ClientStatus Status { get; set; }
    public BusinessModel BusinessModel { get; set; }

    public string? Notes { get; set; }

    public string? ManagerId { get; set; }
}

public class UpdateClientDTO
{
    public int? ClientId { get; set; }

    [Required]
    public string CompanyName { get; set; } = null!;

    public IFormFile? LogoFile { get; set; }

    public string? Logo { get; set; }

    [Required]
    public string Website { get; set; } = null!;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = null!;

    [Required]
    [Length(8, 20, ErrorMessage = "Phone number must be between 8 and 20 characters.")]
    public string Phone { get; set; } = null!;

    [Required]
    public string Country { get; set; } = null!;

    [Required]
    public Currency Currency { get; set; }

    [Required]
    public ClientStatus Status { get; set; }

    [Required]
    public BusinessModel BusinessModel { get; set; }

    public string? Notes { get; set; }

    public string? ManagerId { get; set; }
}

public class ClientLookupDTO
{
    public int ClientId { get; set; }
    public string CompanyName { get; set; } = null!;
}


