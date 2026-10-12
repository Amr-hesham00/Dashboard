using Dashboard.Application.Interfaces.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Dashboard.Infrastructure.Workers;

/// <summary>
/// Hosted background service that periodically fetches the latest exchange rates for supported currencies
/// from the external provider and updates the <see cref="Dashboard.Domain.Entities.ExchangeRate"/> table every 24 hours.
/// </summary>
public class ExchangeRateSyncWorker : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IConfiguration _configuration;
    private readonly ILogger<ExchangeRateSyncWorker> _logger;

    private const int DefaultIntervalHours = 24;
    private const int DefaultInitialDelaySeconds = 10;

    public ExchangeRateSyncWorker(
        IServiceScopeFactory scopeFactory,
        IConfiguration configuration,
        ILogger<ExchangeRateSyncWorker> logger)
    {
        _scopeFactory = scopeFactory;
        _configuration = configuration;
        _logger = logger;
    }

    /// <summary>
    /// Executes the recurring 24-hour background task. Performs an initial synchronization upon startup
    /// followed by periodic syncs on the configured interval.
    /// </summary>
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var isEnabled = _configuration.GetValue("ExchangeRateApi:EnableAutoSync", false);
        if (!isEnabled)
        {
            _logger.LogInformation("ExchangeRateSyncWorker is disabled in configuration.");
            return;
        }

        var interval = _configuration.GetValue("ExchangeRateApi:SyncIntervalHours", DefaultIntervalHours);
        var intervalHours = TimeSpan.FromHours(interval);

        var initialDelaySeconds = _configuration.GetValue("ExchangeRateApi:InitialDelaySeconds", DefaultInitialDelaySeconds);

        // Initial delay to allow the application and database connections to fully warm up
        try
        {
            await Task.Delay(TimeSpan.FromSeconds(initialDelaySeconds), stoppingToken);
        }
        catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
        {
            return;
        }

        // syncing process
        await ExecuteSyncAsync(stoppingToken);

        // Recurring 24-hour periodic timer
        using var timer = new PeriodicTimer(intervalHours);
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                if (!await timer.WaitForNextTickAsync(stoppingToken))
                {
                    break;
                }

                await ExecuteSyncAsync(stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error in ExchangeRateSyncWorker loop.");
            }
        }

        _logger.LogInformation("ExchangeRateSyncWorker is stopping gracefully.");
    }

    /// <summary>
    /// Executes a single exchange rate synchronization cycle, catching and logging any errors
    /// to ensure continuous background operation without crashing the worker.
    /// </summary>
    private async Task ExecuteSyncAsync(CancellationToken cancellationToken)
    {
        if (cancellationToken.IsCancellationRequested)
            return;

        try
        {
            _logger.LogInformation("Starting automated 24-hour syncing...");

            using var scope = _scopeFactory.CreateScope();
            var exchangeRateApiService = scope.ServiceProvider.GetRequiredService<IExchangeRateApiService>();

            bool wasSynced =
                await exchangeRateApiService.SyncLatestRatesAsync(cancellationToken);

            if (!wasSynced)
            {
                _logger.LogInformation(
                    "Exchange rate sync skipped because rates are already up to date.");
                return;
            }

            _logger.LogInformation("Automated exchange rate sync succeeded.");
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            _logger.LogWarning(" synchronization was canceled due to host shutdown.");
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "HTTP failure contacting external ExchangeRate-API provider. Will retry on next scheduled interval.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to synchronize exchange rates in background worker.");
        }
    }
}
