using Dashboard.Application.DTOs;

namespace Dashboard.Application.Interfaces.Services;
public interface ICampaignService
{
    Task<IEnumerable<CampaignDTO>> GetAllCampaignsAsync();
    Task<CampaignDTO?> GetCampaignByIdAsync(int id);
    Task<(bool Success, string Message, CampaignDTO? Campaign)> CreateCampaignAsync(CreateCampaignDTO dto);
    Task<(bool Success, string Message)> UpdateCampaignAsync(int id, UpdateCampaignDTO dto);
    Task<(bool Success, string Message)> DeleteCampaignAsync(int id);
}
