using Dashboard.Domain.Enums;
using System.Text.Json.Serialization;

namespace Dashboard.Application.DTOs;


public class ExchangeRateApiResponseDto
{
    [JsonPropertyName("result")]
    public string Result { get; set; } = string.Empty;


    [JsonPropertyName("time_last_update_unix")]
    public long time_last_update_utc { get; set; }



    [JsonPropertyName("base_code")]
    public string BaseCode { get; set; } = string.Empty;


    [JsonPropertyName("conversion_rates")]
    public Dictionary<string, double> ConversionRates { get; set; } = new(StringComparer.OrdinalIgnoreCase);


    [JsonPropertyName("error-type")]
    public string? ErrorType { get; set; }
}

public class ExternalExchangeRateDataDto
{
    public DateOnly Date { get; set; }

    public IReadOnlyDictionary<Currency, double>? AllRates { get; set; } = new Dictionary<Currency, double>();
}


