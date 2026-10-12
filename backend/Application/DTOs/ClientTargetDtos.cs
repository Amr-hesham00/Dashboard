using System.ComponentModel.DataAnnotations;
using Dashboard.Domain.Enums;

namespace Dashboard.Application.DTOs;

public class ClientTargetDTO
{
    public int Id { get; set; }
    public Currency Currency { get; set; }
    public double? TargetROAS { get; set; }
    public double? TargetCPA { get; set; }
    public double? MonthlyBudget { get; set; }
    public double? TargetRevenue { get; set; }
    public int? TargetConversions { get; set; }
    public double? TargetCTR { get; set; }
    public double? TargetCPC { get; set; }
}

public class CreateClientTargetDTO
{
    [Required]
    public int ClientId { get; set; }

    public Currency Currency { get; set; } = Currency.USD;

    public double? TargetROAS { get; set; }
    public double? TargetCPA { get; set; }
    public double? MonthlyBudget { get; set; }

    public double? TargetRevenue { get; set; }
    public int? TargetConversions { get; set; }
    public double? TargetCTR { get; set; }
    public double? TargetCPC { get; set; }
}

public class UpdateClientTargetDTO
{
    public Currency Currency { get; set; } = Currency.USD;

    public double? TargetROAS { get; set; }
    public double? TargetCPA { get; set; }
    public double? MonthlyBudget { get; set; }

    public double? TargetRevenue { get; set; }
    public int? TargetConversions { get; set; }
    public double? TargetCTR { get; set; }
    public double? TargetCPC { get; set; }
}
