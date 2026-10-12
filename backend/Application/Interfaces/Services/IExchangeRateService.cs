using Dashboard.Application.DTOs;
using Dashboard.Domain.Enums;

namespace Dashboard.Application.Interfaces.Services;

public interface IExchangeRateService
{
    /// <summary>
    /// converts  a moentry amoount from currence to another.
    /// </summary>
    Task<ConvertCurrencyResponseDto> ConvertAsync(ConvertCurrencyRequestDto request);
    Task<double> ConvertAmountAsync(double amount, Currency fromCurrency, Currency toCurrency, DateOnly? date = null);

    /// <summary>
    /// Builds a cross-rate lookup for a currency pair across a date range.
    /// For each date in the range, the dictionary maps DateOnly → crossRate (toRate / fromRate).
    /// If an exact date is missing, the nearest available date (before or after) is used.
    /// </summary>
    Task<Dictionary<DateOnly, double>> GetCrossRateLookupAsync(
        Currency fromCurrency, Currency toCurrency, DateOnly startDate, DateOnly endDate);
}
