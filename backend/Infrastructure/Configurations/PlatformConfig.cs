using Dashboard.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Dashboard.Infrastructure.Configurations;
public class PlatformConfig : IEntityTypeConfiguration<Platform>
{
    public void Configure(EntityTypeBuilder<Platform> builder)
    {
        builder.ToTable("Platforms");

        builder.HasKey(x => x.Id);

        builder.Property(p => p.PlatformType)
               .HasConversion<string>();

        builder.Property(p => p.Status)
               .HasConversion<string>();

        builder.Property(p => p.Currency)
               .IsRequired()
               .HasConversion<string>();

        builder.Property(p => p.ExternalAccountId)
               .HasMaxLength(64);

        builder.Property(p => p.AccountName)
               .HasMaxLength(250);

        builder.Property(p => p.ManagerAccountId)
               .HasMaxLength(64);

        builder.HasIndex(p => new { p.PlatformType, p.ExternalAccountId });

        // Clients has many Platforms
        builder.HasOne(p => p.Client)
               .WithMany(c => c.Platforms)
               .HasForeignKey(p => p.ClientId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(p => p.OAuthConnection)
               .WithMany(c => c.Platforms)
               .HasForeignKey(p => p.OAuthConnectionId)
               .OnDelete(DeleteBehavior.SetNull);
    }
}
