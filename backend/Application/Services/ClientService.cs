using Dashboard.Application.DTOs;
using Dashboard.Application.Interfaces;
using Dashboard.Application.Interfaces.Services;
using Dashboard.Domain.Entities;
using Dashboard.Domain.Enums;

namespace Dashboard.Application.Services;
public class ClientService : IClientService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IExchangeRateService? _exchangeRateService;
    private readonly ILogoService? _logoService;

    public ClientService(IUnitOfWork unitOfWork, IExchangeRateService? exchangeRateService = null, ILogoService? logoService = null)
    {
        _unitOfWork = unitOfWork;
        _exchangeRateService = exchangeRateService;
        _logoService = logoService;
    }

    public async Task<List<ClientDTO>> GetAllClientsAsync()
    {
        var clients = await _unitOfWork.Client.GetAllWithDetailsAsync();
        return clients.Select(c => new ClientDTO
        {
            ClientId = c.Id,
            CompanyName = c.CompanyName,
            Logo = c.Logo,
            Model = c.BusinessModel,
            Status = c.Status,
            ActiveCampaigns = c.Platforms?.SelectMany(p => p.Campaigns ?? Enumerable.Empty<Campaign>()).Count(camp => camp.Status == CampaignStatus.Active) ?? 0
        }).ToList();
    }

    public async Task<ClientDTO?> GetClientByIdAsync(int id)
    {
        var client = await _unitOfWork.Client.GetByIdWithDetailsAsync(id);
        if (client == null) return null;

        int clientActiveCampaigns = 0;
        int clientConversions = 0;
        int clientImpressions = 0;
        int clientClicks = 0;
        double clientSpend = 0;
        double clientRevenue = 0;
        var platformsList = new List<ClientPlatformDTO>();
        var rateCache = new Dictionary<(Currency, Currency), double>();

        if (client.Platforms != null)
        {
            foreach (var platform in client.Platforms)
            {
                var platformKey = platform.PlatformType switch
                {
                    PlatformType.MetaAds => "meta",
                    PlatformType.GoogleAds => "google",
                    PlatformType.TikTokAds => "tiktok",
                    PlatformType.SnapchatAds => "snapchat",
                    _ => platform.PlatformType.ToString().ToLower()
                };

                platformsList.Add(new ClientPlatformDTO
                {
                    Id = platform.Id,
                    PlatformType = platform.PlatformType.ToString(),
                    Key = platformKey,
                    Status = platform.Status.ToString(),
                    Connected = platform.Status == PlatformStatus.Connected
                });

                if (platform.Campaigns == null) continue;

                foreach (var campaign in platform.Campaigns)
                {
                    if (campaign.Status == CampaignStatus.Active)
                        clientActiveCampaigns++;

                    if (campaign.AdSets == null) continue;

                    foreach (var adSet in campaign.AdSets)
                    {
                        if (adSet.Ads == null) continue;

                        foreach (var ad in adSet.Ads)
                        {
                            if (ad.DailyMetrics == null) continue;

                            foreach (var metric in ad.DailyMetrics)
                            {
                                clientImpressions += metric.Impressions;
                                clientClicks += metric.Clicks;
                                clientConversions += metric.Conversions;

                                double crossRate = 1.0;
                                if (_exchangeRateService != null && platform.Currency != client.UnitCurrency)
                                {
                                    crossRate = await GetCrossRateAsync(platform.Currency, client.UnitCurrency, rateCache);
                                }

                                clientSpend += metric.Spend * crossRate;
                                clientRevenue += metric.Revenue * crossRate;
                            }
                        }
                    }
                }
            }
        }

        double roas = clientSpend > 0 ? Math.Round(clientRevenue / clientSpend, 2) : 0;
        double targetRoas = client.Target?.TargetROAS.HasValue == true
            ? Math.Round(client.Target.TargetROAS.Value, 2) : 0;
        double achievedRoas = targetRoas > 0
            ? Math.Round((roas * 100.0) / targetRoas, 1) : 0;
        int targetConversions = client.Target?.TargetConversions ?? 0;

        return new ClientDTO
        {
            ClientId = client.Id,
            CompanyName = client.CompanyName,
            Logo = client.Logo,
            Model = client.BusinessModel,
            Status = client.Status,
            ActiveCampaigns = clientActiveCampaigns,
            Website = client.Website,
            Email = client.Email,
            Phone = client.Phone,
            Country = client.Country,
            Currency = client.UnitCurrency.ToString(),
            Notes = client.Notes,
            ManagerId = client.ManagerId,
            CreatedAt = client.CreatedAt,
            Platforms = platformsList,
            Spend = Math.Round(clientSpend, 2),
            Revenue = Math.Round(clientRevenue, 2),
            Impressions = clientImpressions,
            Clicks = clientClicks,
            Conversions = clientConversions,
            ROAS = roas,
            TargetROAS = targetRoas > 0 ? targetRoas : null,
            AchievedROAS = achievedRoas > 0 ? achievedRoas : null,
            TargetConversions = targetConversions > 0 ? targetConversions : null,
        };
    }

    public async Task<(bool Success, string Message, CreateClientDTO? Client)> CreateClientAsync(CreateClientDTO dto)
    {
        var client = new Client
        {
            CompanyName = dto.CompanyName,
            Logo = dto.Logo,
            Website = dto.Website,
            Email = dto.Email,
            Phone = dto.Phone,
            Country = dto.Country,
            UnitCurrency = dto.Currency,
            Status = dto.Status,
            BusinessModel = dto.BusinessModel,
            Notes = dto.Notes,
            ManagerId = dto.ManagerId,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Client.Create(client);
        await _unitOfWork.Complete();

        return (true, "Client created successfully.", new CreateClientDTO
        {
            ClientId = client.Id,
            CompanyName = dto.CompanyName,
            Logo = dto.Logo,
            Website = dto.Website,
            Email = dto.Email,
            Phone = dto.Phone,
            Country = dto.Country,
            Currency = dto.Currency,
            Status = dto.Status,
            BusinessModel = dto.BusinessModel,
            Notes = dto.Notes,
            ManagerId = dto.ManagerId
        });
    }

    public async Task<(bool Success, string Message)> UpdateClientAsync(int id, UpdateClientDTO dto)
    {
        var client = await _unitOfWork.Client.GetById(id);
        if (client == null)
        {
            return (false, "Client not found.");
        }

        client.CompanyName = dto.CompanyName;
        client.Logo = dto.Logo;
        client.Website = dto.Website;
        client.Email = dto.Email;
        client.Phone = dto.Phone;
        client.Country = dto.Country;
        client.UnitCurrency = dto.Currency;
        client.Status = dto.Status;
        client.BusinessModel = dto.BusinessModel;
        client.Notes = dto.Notes;
        if (!string.IsNullOrEmpty(dto.ManagerId))
        {
            client.ManagerId = dto.ManagerId;
        }

        _unitOfWork.Client.Update(client);
        await _unitOfWork.Complete();

        return (true, "Client updated successfully.");
    }

    public async Task<(bool Success, string Message)> DeleteClientAsync(int id)
    {
        var client = await _unitOfWork.Client.GetById(id);
        if (client == null)
        {
            return (false, "Client not found.");
        }

        if (client.Logo is not null && _logoService is not null)
            await _logoService.DeleteAsync(client.Logo); // delete logo img


        _unitOfWork.Client.Delete(client);
        await _unitOfWork.Complete();

        return (true, "Client deleted successfully.");
    }

    public async Task<ManagerClientsDTO> GetManagerClientasync(string userId)
    {
        var clients = await _unitOfWork.Client.GetClientsByUserAsync(userId, "Manager");
        if (clients == null || clients.Count == 0)
        {
            return new ManagerClientsDTO
            {
                TotalClients = 0,
                ActiveCampaigns = 0,
                Row = new List<ManagerClientsTable>()
            };
        }

        var rows = await MapClientsToTableAsync(clients);

        return new ManagerClientsDTO
        {
            TotalClients = clients.Count,
            ActiveCampaigns = rows.Sum(r => r.ActiveCampaigns),
            Row = rows
        };
    }

    public async Task<AssociateClientsDTO> GetAssociateClientasync(string userId)
    {
        var clients = await _unitOfWork.Client.GetClientsByUserAsync(userId, "Associate");
        if (clients == null || clients.Count == 0)
        {
            return new AssociateClientsDTO
            {
                TotalClients = 0,
                ActiveCampaigns = 0,
                Row = new List<ManagerClientsTable>()
            };
        }

        var rows = await MapClientsToTableAsync(clients);

        return new AssociateClientsDTO
        {
            TotalClients = clients.Count,
            ActiveCampaigns = rows.Sum(r => r.ActiveCampaigns),
            Row = rows
        };
    }

    public async Task<AdminClientsDTO> GetAdminClientasync(string userId)
    {
        var clients = await _unitOfWork.Client.GetClientsByUserAsync(userId, "Admin");
        if (clients == null || clients.Count == 0)
        {
            return new AdminClientsDTO
            {
                TotalClients = 0,
                ActiveCampaigns = 0,
                Row = new List<ManagerClientsTable>()
            };
        }

        var rows = await MapClientsToTableAsync(clients); // no date filter (get all data)

        return new AdminClientsDTO
        {
            TotalClients = clients.Count,
            ActiveCampaigns = rows.Sum(r => r.ActiveCampaigns),
            Row = rows
        };
    }



    private async Task<List<ManagerClientsTable>> MapClientsToTableAsync(List<Client> clients)
    {
        var rateCache = new Dictionary<(Currency, Currency), double>();
        var rows = new List<ManagerClientsTable>();

        foreach (var client in clients)
        {
            int clientActiveCampaigns = 0;
            int clientConversions = 0;
            double clientSpend = 0;
            double clientRevenue = 0;
            var platformsList = new List<ClientPlatformDTO>();

            if (client.Platforms != null)
            {
                foreach (var platform in client.Platforms)
                {
                    var platformKey = platform.PlatformType switch
                    {
                        PlatformType.MetaAds => "meta",
                        PlatformType.GoogleAds => "google",
                        PlatformType.TikTokAds => "tiktok",
                        PlatformType.SnapchatAds => "snapchat",
                        _ => platform.PlatformType.ToString().ToLower()
                    };

                    platformsList.Add(new ClientPlatformDTO
                    {
                        Id = platform.Id,
                        PlatformType = platform.PlatformType.ToString(),
                        Key = platformKey,
                        Status = platform.Status.ToString(),
                        Connected = platform.Status == PlatformStatus.Connected
                    });

                    if (platform.Campaigns == null) continue;

                    foreach (var campaign in platform.Campaigns)
                    {
                        if (campaign.Status == CampaignStatus.Active)
                        {
                            clientActiveCampaigns++;
                        }

                        if (campaign.AdSets == null) continue;

                        foreach (var adSet in campaign.AdSets)
                        {
                            if (adSet.Ads == null) continue;

                            foreach (var ad in adSet.Ads)
                            {
                                if (ad.DailyMetrics == null) continue;

                                foreach (var metric in ad.DailyMetrics)
                                {
                                    clientConversions += metric.Conversions;

                                    double crossRate = 1.0;
                                    if (_exchangeRateService != null && platform.Currency != client.UnitCurrency)
                                    {
                                        crossRate = await GetCrossRateAsync(platform.Currency, client.UnitCurrency, rateCache);
                                    }

                                    clientSpend += metric.Spend * crossRate;
                                    clientRevenue += metric.Revenue * crossRate;
                                }
                            }
                        }
                    }
                }
            }

            double roas = clientSpend > 0 ? Math.Round(clientRevenue / clientSpend, 2) : 0;
            double targetRoas = client.Target?.TargetROAS.HasValue == true
                ? Math.Round(client.Target.TargetROAS.Value, 2)
                : 0;
            double achievedRoas = targetRoas > 0
                ? Math.Round((roas * 100.0) / targetRoas, 1)
                : 0;
            int targetConversions = client.Target?.TargetConversions ?? 0;

            rows.Add(new ManagerClientsTable
            {
                ClientId = client.Id,
                CompanyName = client.CompanyName,
                Logo = client.Logo,
                Website = client.Website,
                Country = client.Country,
                Currency = client.UnitCurrency.ToString(),
                Model = client.BusinessModel,
                Platforms = platformsList,
                Spend = Math.Round(clientSpend, 2),
                Revenue = Math.Round(clientRevenue, 2),
                Conversions = clientConversions,
                TargetConversions = targetConversions,
                Status = client.Status,
                ROAS = roas,
                TargetROAS = targetRoas,
                AchievedROAS = achievedRoas,
                ActiveCampaigns = clientActiveCampaigns
            });
        }

        return rows;
    }
    private async Task<double> GetCrossRateAsync(
        Currency from,
        Currency to,
        Dictionary<(Currency, Currency), double> cache)
    {
        if (from == to) return 1.0;
        if (cache.TryGetValue((from, to), out var cachedRate))
            return cachedRate;

        double rate = 1.0;
        if (_exchangeRateService != null)
        {
            try
            {
                rate = await _exchangeRateService.ConvertAmountAsync(1.0, from, to);
            }
            catch
            {
                rate = 1.0;
            }
        }

        cache[(from, to)] = rate;
        return rate;
    }



}

