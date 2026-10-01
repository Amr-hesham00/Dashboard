using Dashboard.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Dashboard.Infrastructure.Configurations;
public class AdConfig : IEntityTypeConfiguration<Ad>
{
    public void Configure(EntityTypeBuilder<Ad> builder)
    {
        builder.ToTable("Ads");

        builder.HasKey(x => x.Id);

        builder.Property(a => a.Name)
               .IsRequired()
               .HasMaxLength(200);

        builder.Property(a => a.ExternalId)
               .HasMaxLength(100);

        builder.Property(a => a.Headline)
               .IsRequired()
               .HasMaxLength(200);

        builder.Property(a => a.Description)
               .HasMaxLength(1000);

        builder.Property(a => a.CTA)
               .HasMaxLength(100);

        builder.Property(a => a.MediaURL)
               .HasMaxLength(500);

        builder.Property(a => a.MediaType)
               .HasConversion<string>(); // store the enum as its name (string) instead.

        builder.Property(a => a.Status)
               .HasConversion<string>();


    }
}
