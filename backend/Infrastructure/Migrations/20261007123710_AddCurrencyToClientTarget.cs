using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Dashboard.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCurrencyToClientTarget : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Currency",
                table: "Clients",
                newName: "UnitCurrency");

            migrationBuilder.AddColumn<int>(
                name: "Currency",
                table: "ClientTargets",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Currency",
                table: "ClientTargets");

            migrationBuilder.RenameColumn(
                name: "UnitCurrency",
                table: "Clients",
                newName: "Currency");
        }
    }
}
