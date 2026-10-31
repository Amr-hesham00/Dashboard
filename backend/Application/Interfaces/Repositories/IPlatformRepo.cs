using Dashboard.Domain.Entities;
using Dashboard.Domain.Enums;

namespace Dashboard.Application.Interfaces.Repositories;
public interface IPlatformRepo : IGenericRepo<Platform>
{
    Task<Platform?> GetByClientAndTypeAsync(int clientId, PlatformType platformType);
    Task<Platform?> GetByExternalAccountIdAsync(PlatformType platformType, string externalAccountId);
    Task<List<Platform>> GetByGoogleAdsConnectionIdAsync(int googleAdsConnectionId);
}
