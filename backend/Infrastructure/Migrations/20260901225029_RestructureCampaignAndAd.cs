using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Dashboard.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RestructureCampaignAndAd : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ROAS",
                table: "Campaigns");

            migrationBuilder.DropColumn(
                name: "CPC",
                table: "Ads");

            migrationBuilder.DropColumn(
                name: "CTR",
                table: "Ads");

            migrationBuilder.DropColumn(
                name: "ROAS",
                table: "Ads");

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

            migrationBuilder.AddColumn<string>(
                name: "ExternalId",
                table: "Ads",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
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
                name: "ExternalId",
                table: "Ads");

            migrationBuilder.AddColumn<float>(
                name: "ROAS",
                table: "Campaigns",
                type: "real",
                nullable: false,
                defaultValue: 0f);

            migrationBuilder.AddColumn<float>(
                name: "CPC",
                table: "Ads",
                type: "real",
                nullable: false,
                defaultValue: 0f);

            migrationBuilder.AddColumn<float>(
                name: "CTR",
                table: "Ads",
                type: "real",
                nullable: false,
                defaultValue: 0f);

            migrationBuilder.AddColumn<float>(
                name: "ROAS",
                table: "Ads",
                type: "real",
                nullable: false,
                defaultValue: 0f);
        }
    }
}
