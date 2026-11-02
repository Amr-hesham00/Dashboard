using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Dashboard.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UnifyOAuthConnectionTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Platforms_GoogleAdsConnections_OAuthConnectionId",
                table: "Platforms");

            migrationBuilder.DropForeignKey(
                name: "FK_GoogleAdsConnections_AspNetUsers_UserId",
                table: "GoogleAdsConnections");

            migrationBuilder.DropIndex(
                name: "IX_GoogleAdsConnections_UserId",
                table: "GoogleAdsConnections");

            migrationBuilder.RenameTable(
                name: "GoogleAdsConnections",
                newName: "OAuthConnections");

            migrationBuilder.AddColumn<string>(
                name: "PlatformType",
                table: "OAuthConnections",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "GoogleAds");

            migrationBuilder.AddForeignKey(
                name: "FK_OAuthConnections_AspNetUsers_UserId",
                table: "OAuthConnections",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.CreateIndex(
                name: "IX_OAuthConnections_UserId_PlatformType",
                table: "OAuthConnections",
                columns: new[] { "UserId", "PlatformType" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Platforms_OAuthConnections_OAuthConnectionId",
                table: "Platforms",
                column: "OAuthConnectionId",
                principalTable: "OAuthConnections",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Platforms_OAuthConnections_OAuthConnectionId",
                table: "Platforms");

            migrationBuilder.DropForeignKey(
                name: "FK_OAuthConnections_AspNetUsers_UserId",
                table: "OAuthConnections");

            migrationBuilder.DropIndex(
                name: "IX_OAuthConnections_UserId_PlatformType",
                table: "OAuthConnections");

            migrationBuilder.DropColumn(
                name: "PlatformType",
                table: "OAuthConnections");

            migrationBuilder.RenameTable(
                name: "OAuthConnections",
                newName: "GoogleAdsConnections");

            migrationBuilder.CreateIndex(
                name: "IX_GoogleAdsConnections_UserId",
                table: "GoogleAdsConnections",
                column: "UserId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_GoogleAdsConnections_AspNetUsers_UserId",
                table: "GoogleAdsConnections",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Platforms_GoogleAdsConnections_OAuthConnectionId",
                table: "Platforms",
                column: "OAuthConnectionId",
                principalTable: "GoogleAdsConnections",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }
    }
}
