using Dashboard.Application.DTOs;
using Dashboard.Application.Interfaces;
using Dashboard.Application.Interfaces.Services;
using Dashboard.Domain.Entities;
using Dashboard.Domain.Enums;
using Microsoft.Extensions.Configuration;
using System.Net.Http.Json;
using System.Text.Json;

namespace Dashboard.Application.Services;

/// <summary>
/// Service responsible for communicating with the external ExchangeRate-API provider,
/// filtering exchange rates for supported application currencies, and persisting live rates.
/// </summary>
public class ExchangeRateApiService : IExchangeRateApiService
{
    private readonly HttpClient _httpClient;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IConfiguration _configuration;


    private const string DefaultBaseCurrency = "USD";

    public ExchangeRateApiService(HttpClient httpClient, IUnitOfWork unitOfWork, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _unitOfWork = unitOfWork;
        _configuration = configuration;
    }

    // main
    public async Task<ExternalExchangeRateDataDto> FetchLatestRatesAsync(CancellationToken cancellationToken = default)
    {
        string baseCurrency = _configuration["ExchangeRateApi:BaseCurrency"] ?? DefaultBaseCurrency;

        var requestUri = BuildRequestUri(baseCurrency);

        using var response = await _httpClient.GetAsync(requestUri, cancellationToken); // actual external API call

        // validate status code
        if (!response.IsSuccessStatusCode)
        {
            var errorBody = await response.Content.ReadAsStringAsync(cancellationToken);
            throw new HttpRequestException($"Exchange rate provider returned HTTP {(int)response.StatusCode} ({response.ReasonPhrase}): {errorBody}");
        }

        // reading response body
        var apiResponse = await response.Content.ReadFromJsonAsync<ExchangeRateApiResponseDto>(
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true },
            cancellationToken);

        // validate API response
        if (apiResponse == null)
        {
            throw new InvalidOperationException("Failed to deserialize the exchange rate provider response.");
        }

        // error from external API response(not from us)
        if (!string.Equals(apiResponse.Result, "success", StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException($"Exchange rate provider error: {apiResponse.ErrorType ?? "Unknown error"}.");
        }

        // Calculate rate snapshot date from the provider's UTC string
        DateOnly rateDate =
            DateOnly.FromDateTime(
            DateTimeOffset.FromUnixTimeSeconds(apiResponse.time_last_update_utc).UtcDateTime);


        // add new currencies and their rates to "supportedRates"
        var supportedRates = new Dictionary<Currency, double>();
        foreach (var currency in Enum.GetValues<Currency>())
        {
            var code = currency.ToString();
            if (apiResponse.ConversionRates.TryGetValue(code, out var rate))
            {
                supportedRates[currency] = rate;
            }
            else if (currency == Currency.USD && string.Equals(baseCurrency, "USD", StringComparison.OrdinalIgnoreCase))
            {
                supportedRates[currency] = 1.0;
            }
        }

        return new ExternalExchangeRateDataDto
        {
            Date = rateDate,
            AllRates = supportedRates
        };
    }

    // general
    public async Task<bool> SyncLatestRatesAsync(CancellationToken cancellationToken = default)
    {
        // if rates are up to date, skip syncing
        var latestCreatedAt =
            await _unitOfWork.ExchangeRate.GetLatestCreatedAtAsync(cancellationToken);

        if (latestCreatedAt.HasValue)
        {
            var age = DateTimeOffset.UtcNow - latestCreatedAt.Value;

            if (age < TimeSpan.FromHours(24))
                return false;

        }

        var externalData = await FetchLatestRatesAsync(cancellationToken);

        var Now = DateTimeOffset.UtcNow;

        // upsert rates from api response
        foreach (var (currency, rate) in externalData.AllRates)
        {
            var existing = await _unitOfWork.ExchangeRate.GetByDateAndCurrencyAsync(externalData.Date, currency);

            // updating due to the unique index on [Date, Currency] cols
            if (existing != null)
            {
                existing.Rate = rate;
                existing.CreatedAt = Now;
                _unitOfWork.ExchangeRate.Update(existing);
            }
            else
            {
                var newRate = new ExchangeRate
                {
                    Date = externalData.Date,
                    Currency = currency,
                    Rate = rate,
                    CreatedAt = Now
                };
                await _unitOfWork.ExchangeRate.Create(newRate);
            }
        }

        await _unitOfWork.Complete();
        return true;
    }

    private string BuildRequestUri(string baseCode)
    {
        var apiKey = _configuration["ExchangeRateApi:ApiKey"];
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            throw new InvalidOperationException(
                "ExchangeRate API key is not configured.");
        }

        var baseUrl = _configuration["ExchangeRateApi:BaseUrl"];
        if (string.IsNullOrWhiteSpace(baseUrl))
        {
            throw new InvalidOperationException(
                "ExchangeRate Url is not configured.");
        }

        if (!baseUrl.EndsWith('/'))
        {
            baseUrl += "/";
        }

        return $"{baseUrl}{apiKey}/latest/{baseCode}";
    }

}
