using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Dashboard.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RedesignPlatformOAuthFlow : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Platforms_GoogleAdsConnections_GoogleAdsConnectionId",
                table: "Platforms");

            migrationBuilder.RenameColumn(
                name: "LoginCustomerId",
                table: "Platforms",
                newName: "ManagerAccountId");

            migrationBuilder.RenameColumn(
                name: "GoogleAdsConnectionId",
                table: "Platforms",
                newName: "OAuthConnectionId");

            migrationBuilder.RenameIndex(
                name: "IX_Platforms_GoogleAdsConnectionId",
                table: "Platforms",
                newName: "IX_Platforms_OAuthConnectionId");

            migrationBuilder.AddForeignKey(
                name: "FK_Platforms_GoogleAdsConnections_OAuthConnectionId",
                table: "Platforms",
                column: "OAuthConnectionId",
                principalTable: "GoogleAdsConnections",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Platforms_GoogleAdsConnections_OAuthConnectionId",
                table: "Platforms");

            migrationBuilder.RenameColumn(
                name: "OAuthConnectionId",
                table: "Platforms",
                newName: "GoogleAdsConnectionId");

            migrationBuilder.RenameColumn(
                name: "ManagerAccountId",
                table: "Platforms",
                newName: "LoginCustomerId");

            migrationBuilder.RenameIndex(
                name: "IX_Platforms_OAuthConnectionId",
                table: "Platforms",
                newName: "IX_Platforms_GoogleAdsConnectionId");

            migrationBuilder.AddForeignKey(
                name: "FK_Platforms_GoogleAdsConnections_GoogleAdsConnectionId",
                table: "Platforms",
                column: "GoogleAdsConnectionId",
                principalTable: "GoogleAdsConnections",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }
    }
}
