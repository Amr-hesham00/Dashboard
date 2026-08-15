using Dashboard.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Dashboard.Infrastructure.Configurations;

public class ClientConfig : IEntityTypeConfiguration<Client>
{
    public void Configure(EntityTypeBuilder<Client> builder)
    {
        builder.ToTable("Clients");

        builder.HasKey(x => x.Id);

        builder.Property(c => c.CompanyName)
               .IsRequired()
               .HasMaxLength(200);

        builder.Property(c => c.Logo)
               .HasMaxLength(500);

        builder.Property(c => c.Website)
               .IsRequired()
               .HasMaxLength(500);

        builder.Property(c => c.Email)
               .IsRequired()
               .HasMaxLength(150);

        builder.Property(c => c.Phone)
               .IsRequired()
               .HasMaxLength(50);

        builder.Property(c => c.Country)
               .IsRequired()
               .HasMaxLength(100);

        builder.Property(c => c.Currency)
               .HasConversion<string>();

        builder.Property(c => c.Status)
               .HasConversion<string>();

        builder.Property(c => c.Notes)
               .HasMaxLength(1000);

        // Clients has many AssociateProfiles (via Assignments)
        builder.HasMany(c => c.Assignments)
               .WithOne(a => a.Client)
               .HasForeignKey(a => a.ClientId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}
