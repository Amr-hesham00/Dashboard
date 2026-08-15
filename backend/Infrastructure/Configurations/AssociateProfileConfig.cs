using Dashboard.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Dashboard.Infrastructure.Configurations;
public class AssociateProfileConfig : IEntityTypeConfiguration<AssociateProfile>
{
    public void Configure(EntityTypeBuilder<AssociateProfile> builder)
    {
        builder.ToTable("AssociateProfiles");

        builder.HasKey(x => x.Id);

        builder.Property(p => p.Status)
               .HasConversion<string>();

        // AssociateTeams has many AssociateProfiles
        builder.HasOne(p => p.Team)
               .WithMany(t => t.AssociateProfiles)
               .HasForeignKey(p => p.TeamId)
               .OnDelete(DeleteBehavior.Restrict);

        // AssociateProfiles has many assignments (junction table to Clients)
        builder.HasMany(p => p.Assignments)
               .WithOne(a => a.Associate)
               .HasForeignKey(a => a.AssociateId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}
