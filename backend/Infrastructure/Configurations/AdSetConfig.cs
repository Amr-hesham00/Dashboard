using Dashboard.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Dashboard.Infrastructure.Configurations;
public class AdSetConfig : IEntityTypeConfiguration<AdSet>
{
    public void Configure(EntityTypeBuilder<AdSet> builder)
    {
        builder.ToTable("AdSets");

        builder.HasKey(x => x.Id);

        builder.Property(a => a.Name)
               .IsRequired()
               .HasMaxLength(200);

        builder.Property(a => a.ExternalId)
               .HasMaxLength(100);

        builder.Property(a => a.AudienceType)
               .IsRequired()
               .HasMaxLength(100);

        builder.Property(a => a.AgeRange)
               .IsRequired()
               .HasMaxLength(50);

        builder.Property(a => a.Location)
               .HasMaxLength(200);

        builder.Property(a => a.Gender)
               .HasConversion<string>();

        builder.Property(a => a.Status)
               .HasConversion<string>();

        // Campaigns has many AdSets
        builder.HasOne(a => a.Campaign)
               .WithMany(c => c.AdSets)
               .HasForeignKey(a => a.CampaignId)
               .OnDelete(DeleteBehavior.Cascade);

        // AdSets has many Ads
        builder.HasMany(a => a.Ads)
               .WithOne(ad => ad.Adset)
               .HasForeignKey(ad => ad.AdSetId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}
