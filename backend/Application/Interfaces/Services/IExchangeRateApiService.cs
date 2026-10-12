using Dashboard.Application.DTOs;

namespace Dashboard.Application.Interfaces.Services;

/// <summary>
/// Service interface for fetching live and historical exchange rates from an external exchange rate API
/// and synchronizing supported currency rates into the application database.
/// </summary>
public interface IExchangeRateApiService
{

    Task<ExternalExchangeRateDataDto> FetchLatestRatesAsync(CancellationToken cancellationToken = default);

    Task<bool> SyncLatestRatesAsync(CancellationToken cancellationToken = default);
}
