using Dashboard.Domain.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Dashboard.Infrastructure;
public class AppDbContext : IdentityDbContext
{
    public AppDbContext(DbContextOptions options) : base(options)
    {

    }

    public DbSet<Ad> ad { get; set; }
    public DbSet<AdSet> adset { get; set; }
    public DbSet<AssociateProfile> associateprofile { get; set; }
    public DbSet<AssociateTeam> associateteam { get; set; }
    public DbSet<Campaign> campaign { get; set; }
    public DbSet<Client> client { get; set; }
    public DbSet<Platform> platform { get; set; }
    public DbSet<Assignment> Assignment { get; set; }
    public DbSet<RefreshToken> RefreshTokens { get; set; }
    public DbSet<ClientTarget> ClientTargets { get; set; }
    public DbSet<AdDailyMetrics> AdDailyMetrics { get; set; }
    public DbSet<SearchTerm> SearchTerms { get; set; }
    public DbSet<ExchangeRate> ExchangeRates { get; set; }
    public DbSet<OAuthConnection> OAuthConnections { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
