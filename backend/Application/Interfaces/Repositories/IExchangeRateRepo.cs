using Dashboard.Domain.Entities;
using Dashboard.Domain.Enums;

namespace Dashboard.Application.Interfaces.Repositories;

public interface IExchangeRateRepo : IGenericRepo<ExchangeRate>
{
    Task<ExchangeRate?> GetByDateAndCurrencyAsync(DateOnly date, Currency currency);
    Task<ExchangeRate?> GetLatestRateAsync(Currency currency);
    Task<DateTimeOffset?> GetLatestCreatedAtAsync(
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Returns the exchange rate with the closest date (before or after) for a given currency.
    /// </summary>
    Task<ExchangeRate?> GetNearestRateAsync(DateOnly date, Currency currency);

    /// <summary>
    /// Bulk-loads all exchange rates for a currency within a date range (inclusive).
    /// </summary>
    Task<List<ExchangeRate>> GetRatesForCurrencyInRangeAsync(Currency currency, DateOnly startDate, DateOnly endDate);
}
