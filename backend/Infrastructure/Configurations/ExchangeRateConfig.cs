using Dashboard.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Dashboard.Infrastructure.Configurations;

public class ExchangeRateConfig : IEntityTypeConfiguration<ExchangeRate>
{
    public void Configure(EntityTypeBuilder<ExchangeRate> builder)
    {
        builder.ToTable("ExchangeRates");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Date)
               .HasColumnType("date")
               .IsRequired();

        builder.Property(x => x.Currency)
               .HasConversion<string>()
               .HasMaxLength(20)
               .IsRequired();

        builder.Property(x => x.Rate)
               .HasColumnType("float")
               .IsRequired();

        builder.Property(x => x.CreatedAt)
               .HasColumnType("datetimeoffset")
               .IsRequired();

        // Unique index per date and currency to avoid duplicate rates for the same day
        builder.HasIndex(x => new { x.Date, x.Currency })
               .IsUnique();
    }
}
