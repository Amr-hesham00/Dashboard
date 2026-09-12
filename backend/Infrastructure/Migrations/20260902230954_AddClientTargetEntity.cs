using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Dashboard.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddClientTargetEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ClientTargets",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ClientId = table.Column<int>(type: "int", nullable: false),
                    TargetROAS = table.Column<double>(type: "float", nullable: true),
                    TargetCPA = table.Column<double>(type: "float", nullable: true),
                    MonthlyBudget = table.Column<double>(type: "float", nullable: true),
                    TargetRevenue = table.Column<double>(type: "float", nullable: true),
                    TargetConversions = table.Column<int>(type: "int", nullable: true),
                    TargetCTR = table.Column<double>(type: "float", nullable: true),
                    TargetCPC = table.Column<double>(type: "float", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClientTargets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ClientTargets_Clients_ClientId",
                        column: x => x.ClientId,
                        principalTable: "Clients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ClientTargets_ClientId",
                table: "ClientTargets",
                column: "ClientId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ClientTargets");
        }
    }
}
