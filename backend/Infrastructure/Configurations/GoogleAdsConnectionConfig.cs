using Dashboard.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Dashboard.Infrastructure.Configurations;

public class GoogleAdsConnectionConfig : IEntityTypeConfiguration<GoogleAdsConnection>
{
    public void Configure(EntityTypeBuilder<GoogleAdsConnection> builder)
    {
        builder.ToTable("GoogleAdsConnections");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.UserId)
            .IsRequired();

        // One Google connection per Dashboard user
        builder.HasIndex(c => c.UserId)
            .IsUnique();

        // Encrypted payloads; Google tokens have no fixed maximum size
        builder.Property(c => c.AccessTokenEncrypted)
            .IsRequired();

        builder.Property(c => c.RefreshTokenEncrypted)
            .IsRequired();

        builder.Property(c => c.AccessTokenExpiresAt)
            .IsRequired();

        builder.Property(c => c.Scopes)
            .HasMaxLength(1024);

        builder.Property(c => c.CreatedAt)
            .IsRequired();

        builder.Property(c => c.UpdatedAt)
            .IsRequired();

        builder.HasOne(c => c.User)
            .WithMany()
            .HasForeignKey(c => c.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
