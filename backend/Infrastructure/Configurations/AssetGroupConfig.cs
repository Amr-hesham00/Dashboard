using Dashboard.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Dashboard.Infrastructure.Configurations;

public class AssetGroupConfig : IEntityTypeConfiguration<AssetGroup>
{
    public void Configure(EntityTypeBuilder<AssetGroup> builder)
    {
        builder.ToTable("AssetGroups");

        builder.HasKey(x => x.Id);

        builder.Property(a => a.Name)
               .IsRequired()
               .HasMaxLength(200);

        builder.Property(a => a.ExternalId)
               .HasMaxLength(100);

        builder.HasIndex(a => new { a.CampaignId, a.ExternalId })
               .IsUnique()
               .HasFilter("[ExternalId] IS NOT NULL");

        builder.Property(a => a.Status)
               .HasConversion<string>();

        // Campaigns has many AssetGroups
        builder.HasOne(a => a.Campaign)
               .WithMany(c => c.AssetGroups)
               .HasForeignKey(a => a.CampaignId)
               .OnDelete(DeleteBehavior.Cascade);

        // AssetGroups has many DailyMetrics
        builder.HasMany(a => a.DailyMetrics)
               .WithOne(m => m.AssetGroup)
               .HasForeignKey(m => m.AssetGroupId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}

