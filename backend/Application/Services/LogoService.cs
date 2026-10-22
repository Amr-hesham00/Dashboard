using Dashboard.Application.Interfaces;
using Dashboard.Application.Interfaces.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;

namespace Dashboard.Application.Services;
public class LogoService : ILogoService
{
    private readonly IWebHostEnvironment _environment;
    public string[] allowed = { ".jpg", ".jpeg", ".png", ".gif" };


    public LogoService(IWebHostEnvironment environment, IUnitOfWork unitOfWork)
    {
        _environment = environment;
    }

    public async Task<string?> SaveAsync(IFormFile? file)
    {
        if (file == null || file.Length == 0)
            return null;

        var extension = Path.GetExtension(file.FileName)
            .ToLowerInvariant();


        if (!allowed.Contains(extension))
            throw new ArgumentException("Invalid image format.");

        if (file.Length > 5 * 1024 * 1024)
            throw new ArgumentException("Image exceeds 5 MB.");

        var folder = GetLogosFolder();
        Directory.CreateDirectory(folder);

        var fileName = $"{Guid.NewGuid():N}{extension}";
        var filePath = Path.Combine(folder, fileName);

        try
        {
            await using (var stream = new FileStream(filePath, FileMode.CreateNew, FileAccess.Write, FileShare.None))
            {
                await file.CopyToAsync(stream);
            }
        }
        catch
        {
            if (File.Exists(filePath))
                File.Delete(filePath);

            throw;
        }

        return $"/Logos/{fileName}";
    }
    public Task DeleteAsync(string? logoUrl)
    {
        if (string.IsNullOrWhiteSpace(logoUrl))
            return Task.CompletedTask;

        // Only delete files managed by this service.
        if (!logoUrl.StartsWith("/Logos/", StringComparison.Ordinal))
            return Task.CompletedTask;

        var fileName = logoUrl["/Logos/".Length..];

        if (string.IsNullOrWhiteSpace(fileName) || fileName != Path.GetFileName(fileName) || fileName is "." or "..")
            return Task.CompletedTask;

        var filePath = Path.Combine(GetLogosFolder(), fileName);

        if (File.Exists(filePath))
            File.Delete(filePath);

        return Task.CompletedTask;
    }

    private string GetLogosFolder()
    {
        var webRoot = _environment.WebRootPath
            ?? Path.Combine(_environment.ContentRootPath, "wwwroot");

        return Path.Combine(webRoot, "Logos");
    }
}
