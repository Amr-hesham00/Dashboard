using Dashboard.Application.DTOs;

namespace Dashboard.Application.Interfaces.Services;

public interface ISearchTermService
{
    Task<IEnumerable<SearchTermDTO>?> GetSearchTermsByAdSetIdAsync(int adSetId, DateOnly startDate, DateOnly endDate);
    Task<IEnumerable<SearchTermDTO>?> GetSearchTermsByCampaignIdAsync(int campaignId, DateOnly startDate, DateOnly endDate);
    Task<(bool Success, string Message, SearchTermDTO? Result)> CreateAsync(CreateSearchTermDTO dto);
}
