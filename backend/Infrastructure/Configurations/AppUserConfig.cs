using Dashboard.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Dashboard.Infrastructure.Configurations;
public class AppUserConfig : IEntityTypeConfiguration<AppUser>
{
    public void Configure(EntityTypeBuilder<AppUser> builder)
    {
        builder.Property(u => u.FirstName)
               .IsRequired()
               .HasMaxLength(100);

        builder.Property(u => u.LastName)
               .IsRequired()
               .HasMaxLength(100);

        builder.Property(u => u.ProfileImage)
               .HasMaxLength(500);

        builder.Property(u => u.Role)
               .HasMaxLength(50)
               .HasConversion<string>();

        // user has associates
        builder.HasOne(u => u.AssociateProfile)
               .WithOne()
               .HasForeignKey<AssociateProfile>(p => p.Id)
               .OnDelete(DeleteBehavior.Cascade);

        // Managers has many clients
        builder.HasMany(u => u.ManagedClients)
               .WithOne()
               .HasForeignKey(c => c.ManagerId)
               .OnDelete(DeleteBehavior.Restrict); // can't delete to parents have children

        // Managers has many teams
        builder.HasMany(u => u.ManagedTeams)
               .WithOne()
               .HasForeignKey(t => t.ManagerId)
               .OnDelete(DeleteBehavior.Restrict);


    }
}
