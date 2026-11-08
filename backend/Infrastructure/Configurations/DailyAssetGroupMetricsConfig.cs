using Dashboard.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Dashboard.Infrastructure.Configurations;

public class DailyAssetGroupMetricsConfig : IEntityTypeConfiguration<DailyAssetGroupMetrics>
{
    public void Configure(EntityTypeBuilder<DailyAssetGroupMetrics> builder)
    {
        builder.ToTable("DailyAssetGroupMetrics");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Date)
               .HasColumnType("date")
               .IsRequired();

        builder.HasIndex(x => new { x.AssetGroupId, x.Date })
               .IsUnique();

        builder.HasOne(x => x.AssetGroup)
               .WithMany(a => a.DailyMetrics)
               .HasForeignKey(x => x.AssetGroupId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}

