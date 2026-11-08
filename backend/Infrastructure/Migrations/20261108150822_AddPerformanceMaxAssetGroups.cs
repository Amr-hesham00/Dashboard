using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Dashboard.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPerformanceMaxAssetGroups : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ChannelType",
                table: "Campaigns",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "AssetGroups",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ExternalId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    StartDate = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    EndDate = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    CampaignId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AssetGroups", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AssetGroups_Campaigns_CampaignId",
                        column: x => x.CampaignId,
                        principalTable: "Campaigns",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DailyAssetGroupMetrics",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    Impressions = table.Column<int>(type: "int", nullable: false),
                    Clicks = table.Column<int>(type: "int", nullable: false),
                    Conversions = table.Column<int>(type: "int", nullable: false),
                    Spend = table.Column<double>(type: "float", nullable: false),
                    Revenue = table.Column<double>(type: "float", nullable: false),
                    AssetGroupId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DailyAssetGroupMetrics", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DailyAssetGroupMetrics_AssetGroups_AssetGroupId",
                        column: x => x.AssetGroupId,
                        principalTable: "AssetGroups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AssetGroups_CampaignId_ExternalId",
                table: "AssetGroups",
                columns: new[] { "CampaignId", "ExternalId" },
                unique: true,
                filter: "[ExternalId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_DailyAssetGroupMetrics_AssetGroupId_Date",
                table: "DailyAssetGroupMetrics",
                columns: new[] { "AssetGroupId", "Date" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DailyAssetGroupMetrics");

            migrationBuilder.DropTable(
                name: "AssetGroups");

            migrationBuilder.DropColumn(
                name: "ChannelType",
                table: "Campaigns");
        }
    }
}
