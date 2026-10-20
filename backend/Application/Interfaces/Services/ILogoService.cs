using Microsoft.AspNetCore.Http;

namespace Dashboard.Application.Interfaces.Services;
public interface ILogoService
{
    Task<string?> SaveAsync(IFormFile? file);
    Task DeleteAsync(string? logoUrl);
}
