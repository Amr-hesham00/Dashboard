using Dashboard.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace Dashboard.Application.DTOs;

public class ExchangeRateDto
{
    public int Id { get; set; }
    public DateOnly Date { get; set; }
    public Currency Currency { get; set; }
    public double Rate { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}

public class ConvertCurrencyRequestDto
{
    [Required]
    public Currency FromCurrency { get; set; }

    [Required]
    public Currency ToCurrency { get; set; }

    [Required]
    [Range(0, double.MaxValue, ErrorMessage = "Amount must be non-negative.")]
    public double Amount { get; set; }

    public DateOnly? Date { get; set; }
}

public class ConvertCurrencyResponseDto
{
    public Currency FromCurrency { get; set; }
    public Currency ToCurrency { get; set; }
    public double OriginalAmount { get; set; }
    public double ConvertedAmount { get; set; }
    public double CrossRate { get; set; }
    public DateOnly? DateUsed { get; set; }
    public DateTimeOffset? RateTimestamp { get; set; }
}
