using Dashboard.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Dashboard.Infrastructure.Configurations;

public class ClientTargetConfig : IEntityTypeConfiguration<ClientTarget>
{
    public void Configure(EntityTypeBuilder<ClientTarget> builder)
    {
        builder.ToTable("ClientTargets");

        builder.HasKey(x => x.Id);

        builder.HasIndex(x => x.ClientId)
               .IsUnique();

        builder.HasOne(x => x.Client)
               .WithOne(c => c.Target)
               .HasForeignKey<ClientTarget>(x => x.ClientId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}
