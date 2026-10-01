using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Dashboard.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class entites : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Clicks",
                table: "Campaigns");

            migrationBuilder.DropColumn(
                name: "Conversions",
                table: "Campaigns");

            migrationBuilder.DropColumn(
                name: "Impressions",
                table: "Campaigns");

            migrationBuilder.DropColumn(
                name: "Revenue",
                table: "Campaigns");

            migrationBuilder.DropColumn(
                name: "Spend",
                table: "Campaigns");

            migrationBuilder.DropColumn(
                name: "Clicks",
                table: "Ads");

            migrationBuilder.DropColumn(
                name: "Conversions",
                table: "Ads");

            migrationBuilder.DropColumn(
                name: "Impressions",
                table: "Ads");

            migrationBuilder.DropColumn(
                name: "Revenue",
                table: "Ads");

            migrationBuilder.DropColumn(
                name: "Spend",
                table: "Ads");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Clicks",
                table: "Campaigns",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Conversions",
                table: "Campaigns",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Impressions",
                table: "Campaigns",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<double>(
                name: "Revenue",
                table: "Campaigns",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "Spend",
                table: "Campaigns",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<int>(
                name: "Clicks",
                table: "Ads",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Conversions",
                table: "Ads",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Impressions",
                table: "Ads",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<double>(
                name: "Revenue",
                table: "Ads",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "Spend",
                table: "Ads",
                type: "float",
                nullable: false,
                defaultValue: 0.0);
        }
    }
}
