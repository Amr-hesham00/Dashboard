using Dashboard.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Dashboard.Infrastructure.Configurations;

public class OAuthConnectionConfig : IEntityTypeConfiguration<OAuthConnection>
{
    public void Configure(EntityTypeBuilder<OAuthConnection> builder)
    {
        builder.ToTable("OAuthConnections");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.UserId)
            .IsRequired();

        builder.Property(c => c.PlatformType)
            .IsRequired()
            .HasConversion<string>();

        // One OAuth connection per Dashboard user per PlatformType (GoogleAds, MetaAds, etc.)
        builder.HasIndex(c => new { c.UserId, c.PlatformType })
            .IsUnique();

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
