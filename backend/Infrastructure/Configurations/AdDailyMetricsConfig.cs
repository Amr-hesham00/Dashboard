using Dashboard.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Dashboard.Infrastructure.Configurations;

public class AdDailyMetricsConfig : IEntityTypeConfiguration<AdDailyMetrics>
{
    public void Configure(EntityTypeBuilder<AdDailyMetrics> builder)
    {
        builder.ToTable("AdDailyMetrics");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Date)
               .HasColumnType("date")
               .IsRequired();

        builder.HasIndex(x => new { x.AdId, x.Date })
               .IsUnique();

        builder.HasOne(x => x.Ad)
               .WithMany(a => a.DailyMetrics)
               .HasForeignKey(x => x.AdId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}
