using Dashboard.Application.Interfaces.Repositories;
using Dashboard.Domain.Entities;
using Dashboard.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Dashboard.Infrastructure.Repositories;

public class ExchangeRateRepo : GenericRepo<ExchangeRate>, IExchangeRateRepo
{
    public ExchangeRateRepo(AppDbContext context) : base(context)
    {
    }

    public async Task<ExchangeRate?> GetByDateAndCurrencyAsync(DateOnly date, Currency currency)
    {
        return await dbset.FirstOrDefaultAsync(x => x.Date == date && x.Currency == currency);
    }

    public async Task<ExchangeRate?> GetLatestRateAsync(Currency currency)
    {
        // from recent to old
        return await dbset.AsNoTracking()
            .Where(x => x.Currency == currency)
            .OrderByDescending(x => x.Date)
            .ThenByDescending(x => x.CreatedAt)
            .FirstOrDefaultAsync();
    }

    public async Task<DateTimeOffset?> GetLatestCreatedAtAsync(
        CancellationToken cancellationToken = default)
    {
        return await dbset.MaxAsync(x => (DateTimeOffset?)x.CreatedAt, cancellationToken);
    }

    /// <summary>
    /// Finds the closest exchange rate (before or after the given date) for a currency.
    /// Prefers the closest date in either direction; ties go to the earlier date.
    /// </summary>
    public async Task<ExchangeRate?> GetNearestRateAsync(DateOnly date, Currency currency)
    {
        // Try exact match first
        var exact = await dbset.FirstOrDefaultAsync(x => x.Date == date && x.Currency == currency);
        if (exact is not null)
            return exact;

        // Find closest before
        var before = await dbset.AsNoTracking()
            .Where(x => x.Currency == currency && x.Date < date)
            .OrderByDescending(x => x.Date)
            .FirstOrDefaultAsync();

        // Find closest after
        var after = await dbset.AsNoTracking()
            .Where(x => x.Currency == currency && x.Date > date)
            .OrderBy(x => x.Date)
            .FirstOrDefaultAsync();

        if (before is null) return after;
        if (after is null) return before;

        // Pick whichever is closer; ties go to the earlier date
        var daysBefore = date.DayNumber - before.Date.DayNumber;
        var daysAfter = after.Date.DayNumber - date.DayNumber;

        return daysBefore <= daysAfter ? before : after;
    }

    /// <summary>
    /// Bulk-loads all exchange rates for a currency within a date range (inclusive).
    /// </summary>
    public async Task<List<ExchangeRate>> GetRatesForCurrencyInRangeAsync(
        Currency currency, DateOnly startDate, DateOnly endDate)
    {
        return await dbset.AsNoTracking()
            .Where(x => x.Currency == currency && x.Date >= startDate && x.Date <= endDate)
            .OrderBy(x => x.Date)
            .ToListAsync();
    }
}
