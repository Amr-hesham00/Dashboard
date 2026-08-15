using Dashboard.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Dashboard.Infrastructure.Configurations;
public class AssociateTeamConfig : IEntityTypeConfiguration<AssociateTeam>
{
    public void Configure(EntityTypeBuilder<AssociateTeam> builder)
    {
        builder.ToTable("AssociateTeams");

        builder.HasKey(x => x.Id);

        builder.Property(t => t.Name)
               .IsRequired()
               .HasMaxLength(150);

        builder.Property(t => t.Description)
               .HasMaxLength(500);

        builder.Property(t => t.Status)
               .HasMaxLength(50)
               .HasConversion<string>();

        // AssociateTeams has many AssociateProfiles
        builder.HasMany(t => t.AssociateProfiles)
               .WithOne(p => p.Team)
               .HasForeignKey(p => p.TeamId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}
