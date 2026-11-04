using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Dashboard.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddGoogleAdsSyncTracking : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Campaigns_PlatformId",
                table: "Campaigns");

            migrationBuilder.DropIndex(
                name: "IX_AdSets_CampaignId",
                table: "AdSets");

            migrationBuilder.DropIndex(
                name: "IX_Ads_AdSetId",
                table: "Ads");

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "LastBackfillAt",
                table: "Platforms",
                type: "datetimeoffset",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LastSyncError",
                table: "Platforms",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LastSyncStatus",
                table: "Platforms",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "LastSyncedAt",
                table: "Platforms",
                type: "datetimeoffset",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TimeZone",
                table: "Platforms",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Campaigns_PlatformId_ExternalId",
                table: "Campaigns",
                columns: new[] { "PlatformId", "ExternalId" },
                unique: true,
                filter: "[ExternalId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_AdSets_CampaignId_ExternalId",
                table: "AdSets",
                columns: new[] { "CampaignId", "ExternalId" },
                unique: true,
                filter: "[ExternalId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Ads_AdSetId_ExternalId",
                table: "Ads",
                columns: new[] { "AdSetId", "ExternalId" },
                unique: true,
                filter: "[ExternalId] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Campaigns_PlatformId_ExternalId",
                table: "Campaigns");

            migrationBuilder.DropIndex(
                name: "IX_AdSets_CampaignId_ExternalId",
                table: "AdSets");

            migrationBuilder.DropIndex(
                name: "IX_Ads_AdSetId_ExternalId",
                table: "Ads");

            migrationBuilder.DropColumn(
                name: "LastBackfillAt",
                table: "Platforms");

            migrationBuilder.DropColumn(
                name: "LastSyncError",
                table: "Platforms");

            migrationBuilder.DropColumn(
                name: "LastSyncStatus",
                table: "Platforms");

            migrationBuilder.DropColumn(
                name: "LastSyncedAt",
                table: "Platforms");

            migrationBuilder.DropColumn(
                name: "TimeZone",
                table: "Platforms");

            migrationBuilder.CreateIndex(
                name: "IX_Campaigns_PlatformId",
                table: "Campaigns",
                column: "PlatformId");

            migrationBuilder.CreateIndex(
                name: "IX_AdSets_CampaignId",
                table: "AdSets",
                column: "CampaignId");

            migrationBuilder.CreateIndex(
                name: "IX_Ads_AdSetId",
                table: "Ads",
                column: "AdSetId");
        }
    }
}
