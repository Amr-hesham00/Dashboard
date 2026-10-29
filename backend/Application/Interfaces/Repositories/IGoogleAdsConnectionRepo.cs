using Dashboard.Domain.Entities;

namespace Dashboard.Application.Interfaces.Repositories;

public interface IGoogleAdsConnectionRepo : IGenericRepo<GoogleAdsConnection>
{
    Task<GoogleAdsConnection?> GetByUserIdAsync(string userId);
    Task<bool> IsValidAccessToken(string userId);

}
