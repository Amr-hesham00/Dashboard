namespace Dashboard.Domain.Entities;

public class ClientTarget
{
    public int Id { get; set; }


    public double? TargetROAS { get; set; }
    public double? TargetCPA { get; set; }
    public double? MonthlyBudget { get; set; }

    public double? TargetRevenue { get; set; }
    public int? TargetConversions { get; set; }
    public double? TargetCTR { get; set; }
    public double? TargetCPC { get; set; }

    public int ClientId { get; set; }
    public Client Client { get; set; } = null!;
}
