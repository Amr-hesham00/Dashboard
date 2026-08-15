using Dashboard.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Dashboard.Infrastructure.Configurations;
public class CampaignConfig : IEntityTypeConfiguration<Campaign>
{
    public void Configure(EntityTypeBuilder<Campaign> builder)
    {
        builder.ToTable("Campaigns");

        builder.HasKey(x => x.Id);

        builder.Property(c => c.Name)
               .IsRequired()
               .HasMaxLength(200);

        builder.Property(c => c.Objective)
               .HasConversion<string>();

        builder.Property(c => c.Status)
               .HasConversion<string>();

        // Platforms has many Campaigns
        builder.HasOne(c => c.Platform)
               .WithMany(p => p.Campaigns)
               .HasForeignKey(c => c.PlatformId)
               .OnDelete(DeleteBehavior.Cascade);

    }
}
