using Dashboard.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Dashboard.Infrastructure.Configurations;

public class SearchTermConfig : IEntityTypeConfiguration<SearchTerm>
{
    public void Configure(EntityTypeBuilder<SearchTerm> builder)
    {
        builder.ToTable("SearchTerms");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Term)
               .IsRequired()
               .HasMaxLength(500);

        builder.Property(x => x.Keyword)
               .HasMaxLength(250);

        builder.Property(x => x.MatchType)
               .IsRequired()
               .HasConversion<string>()
               .HasMaxLength(50);

        builder.Property(x => x.Date)
               .HasColumnType("date")
               .IsRequired();

        builder.HasIndex(x => new { x.AdSetId, x.Date });

        builder.HasOne(x => x.AdSet)
               .WithMany(a => a.SearchTerms)
               .HasForeignKey(x => x.AdSetId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}
