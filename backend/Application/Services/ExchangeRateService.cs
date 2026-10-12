using Dashboard.Application.DTOs;
using Dashboard.Application.Interfaces;
using Dashboard.Application.Interfaces.Services;
using Dashboard.Domain.Entities;
using Dashboard.Domain.Enums;

namespace Dashboard.Application.Services;

public class ExchangeRateService : IExchangeRateService
{
    private readonly IUnitOfWork _unitOfWork;

    public ExchangeRateService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ConvertCurrencyResponseDto> ConvertAsync(ConvertCurrencyRequestDto request)
    {
        if (request.Amount < 0)
        {
            throw new ArgumentException("Amount cannot be negative.", nameof(request.Amount));
        }

        if (request.FromCurrency == request.ToCurrency)
        {
            return new ConvertCurrencyResponseDto
            {
                FromCurrency = request.FromCurrency,
                ToCurrency = request.ToCurrency,
                OriginalAmount = request.Amount,
                ConvertedAmount = request.Amount,
                CrossRate = 1.0,
                DateUsed = request.Date ?? DateOnly.FromDateTime(DateTime.UtcNow),
                RateTimestamp = DateTimeOffset.UtcNow
            };
        }

        // Rates are stored as 1 USD = Rate units of Currency
        // To convert from A to B: Converted = Amount * (RateB / RateA)
        var (fromRate, fromDate, fromTimestamp) = await ResolveRateAsync(request.FromCurrency, request.Date);
        var (toRate, toDate, toTimestamp) = await ResolveRateAsync(request.ToCurrency, request.Date);

        var crossRate = fromRate > 0 ? toRate / fromRate : 1.0;
        var convertedAmount = request.Amount * crossRate;

        return new ConvertCurrencyResponseDto
        {
            FromCurrency = request.FromCurrency,
            ToCurrency = request.ToCurrency,
            OriginalAmount = request.Amount,
            ConvertedAmount = convertedAmount,
            CrossRate = crossRate,
            DateUsed = toDate ?? fromDate ?? request.Date,
            RateTimestamp = toTimestamp ?? fromTimestamp ?? DateTimeOffset.UtcNow
        };
    }

    /// <summary>
    /// Converts a monetary amount from one currency to another using the exchange rates applicable on the given date or the latest available rates.
    /// </summary>
    public async Task<double> ConvertAmountAsync(double amount, Currency fromCurrency, Currency toCurrency, DateOnly? date = null)
    {
        if (fromCurrency == toCurrency)
        {
            return amount;
        }

        var (fromRate, _, _) = await ResolveRateAsync(fromCurrency, date);
        var (toRate, _, _) = await ResolveRateAsync(toCurrency, date);

        var crossRate = fromRate > 0 ? toRate / fromRate : 1.0;
        return amount * crossRate;
    }

    /// <summary>
    /// Builds a per-day cross-rate lookup dictionary for converting from one currency to another
    /// across a date range. Uses bulk-loaded rates with nearest-date fallback when an exact
    /// match is missing, guaranteeing no error is returned.
    /// </summary>
    public async Task<Dictionary<DateOnly, double>> GetCrossRateLookupAsync(
        Currency fromCurrency, Currency toCurrency, DateOnly startDate, DateOnly endDate)
    {
        var lookup = new Dictionary<DateOnly, double>();
        int dayCount = endDate.DayNumber - startDate.DayNumber + 1;

        // Same currency → all rates are 1.0
        if (fromCurrency == toCurrency)
        {
            for (int i = 0; i < dayCount; i++)
                lookup[startDate.AddDays(i)] = 1.0;
            return lookup;
        }

        // Bulk-load rates for both currencies in the range
        var fromRates = fromCurrency == Currency.USD
            ? new List<ExchangeRate>()
            : await _unitOfWork.ExchangeRate.GetRatesForCurrencyInRangeAsync(fromCurrency, startDate, endDate);

        var toRates = toCurrency == Currency.USD
            ? new List<ExchangeRate>()
            : await _unitOfWork.ExchangeRate.GetRatesForCurrencyInRangeAsync(toCurrency, startDate, endDate);

        // Currency and Date are unique, so map directly by Date
        var fromByDate = fromRates.ToDictionary(r => r.Date, r => r.Rate);
        var toByDate = toRates.ToDictionary(r => r.Date, r => r.Rate);

        for (int i = 0; i < dayCount; i++)
        {
            DateOnly date = startDate.AddDays(i);

            double fromRate = ResolveRateFromLookup(fromCurrency, fromByDate, date); // rate of fromCurrency relative to USD at requested date
            double toRate = ResolveRateFromLookup(toCurrency, toByDate, date);

            if (fromRate > 0 && toRate > 0)
            {
                lookup[date] = toRate / fromRate;
            }
            else
            {
                lookup[date] = 0; // Needs fallback
            }
        }

        // If any day couldn't be resolved from bulk data, fall back to nearest rate queries from DB
        var missingDates = new List<DateOnly>();
        for (int i = 0; i < dayCount; i++)
        {
            var date = startDate.AddDays(i);

            if (!lookup.ContainsKey(date) || lookup[date] <= 0)
                missingDates.Add(date);
        }

        foreach (var date in missingDates)
        {
            var fromRate = await ResolveNearestRateValueAsync(fromCurrency, date);
            var toRate = await ResolveNearestRateValueAsync(toCurrency, date);
            lookup[date] = fromRate > 0 ? toRate / fromRate : 1.0;
        }

        return lookup;
    }

    /// <summary>
    /// Resolves the exchange rate for a given currency relative to USD on a specific date, falling back to the nearest or latest available rate.
    /// Never returns null or throws an error.
    /// </summary>
    private async Task<(double Rate, DateOnly? Date, DateTimeOffset? Timestamp)> ResolveRateAsync(Currency currency, DateOnly? date)
    {
        // USD is the base currency (1 USD = 1 USD)
        if (currency == Currency.USD)
        {
            return (1.0, date, DateTimeOffset.UtcNow);
        }

        ExchangeRate? rate = null;

        if (date.HasValue)
        {
            rate = await _unitOfWork.ExchangeRate.GetNearestRateAsync(date.Value, currency);
        }

        // Fallback to latest rate
        rate ??= await _unitOfWork.ExchangeRate.GetLatestRateAsync(currency);

        if (rate == null)
        {
            // Fallback default so no unhandled error is thrown
            return (1.0, date, DateTimeOffset.UtcNow);
        }

        return (rate.Rate, rate.Date, rate.CreatedAt);
    }

    /// <summary>
    /// Resolves a rate value from a pre-loaded dictionary, falling back to nearest available date in the map.
    /// Returns 1.0 for USD (base currency).
    /// </summary>
    private static double ResolveRateFromLookup(Currency currency, Dictionary<DateOnly, double> ratesByDate, DateOnly date)
    {
        if (currency == Currency.USD)
            return 1.0;

        if (ratesByDate.TryGetValue(date, out var rate))
            return rate;


        // if requested date = 10/5:
        //        10/4 = 3.75   // 1 day, choose this
        //        10/7 = 3.80   // 2 days
        if (ratesByDate.Count > 0)
        {
            // Pick closest date in the loaded dictionary
            var nearest = ratesByDate.Keys
                .OrderBy(d => Math.Abs(d.DayNumber - date.DayNumber))
                .First();

            return ratesByDate[nearest];
        }

        return 0; // Signals fallback to DB query
    }

    /// <summary>
    /// Resolves the rate value for a currency on a specific date using nearest-date repo query, then latest rate fallback.
    /// </summary>
    private async Task<double> ResolveNearestRateValueAsync(Currency currency, DateOnly date)
    {
        if (currency == Currency.USD)
            return 1.0;

        var rate = await _unitOfWork.ExchangeRate.GetNearestRateAsync(date, currency);
        rate ??= await _unitOfWork.ExchangeRate.GetLatestRateAsync(currency);

        return rate?.Rate ?? 1.0;
    }
}
