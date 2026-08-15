using Dashboard.Domain.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Dashboard.Infrastructure;
public class AppDbContext : IdentityDbContext
{
    public AppDbContext(DbContextOptions options) : base(options)
    {

    }


    //public DbSet<AppUser> appuser { get; set; }
    public DbSet<Ad> ad { get; set; }
    public DbSet<AdSet> adset { get; set; }
    public DbSet<AssociateProfile> associateprofile { get; set; }
    public DbSet<AssociateTeam> associateteam { get; set; }
    public DbSet<Campaign> campaign { get; set; }
    public DbSet<Client> client { get; set; }
    public DbSet<Platform> platform { get; set; }
    public DbSet<Assignment> Assignment { get; set; }

    //protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    //{
    //    base.OnConfiguring(optionsBuilder);
    //    var config = new ConfigurationBuilder().AddJsonFile("appsettings.json").Build();

    //    var constr = config.GetSection("connectionstring").Value;

    //    optionsBuilder.UseSqlServer(constr);

    //}
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);


    }
}
