using Dashboard.Domain.Enums;

namespace Dashboard.Domain.Entities;

public class ExchangeRate
{
    public int Id { get; set; }
    public DateOnly Date { get; set; }
    public Currency Currency { get; set; }
    public double Rate { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
