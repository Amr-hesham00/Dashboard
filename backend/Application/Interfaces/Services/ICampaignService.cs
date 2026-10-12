using Dashboard.Application.DTOs;

namespace Dashboard.Application.Interfaces.Services;
public interface ICampaignService
{
    public Task<ClientPageDTO?> GetForOverviewAsync(int clientId, DateOnly startDate, DateOnly endDate);
    public Task<PlatformPageDTO?> GetCampaignsByPlatformAsync(int clientId, int platformid, DateOnly startDate, DateOnly endDate);
}
