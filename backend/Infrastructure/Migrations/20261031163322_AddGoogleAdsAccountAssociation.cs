using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Dashboard.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddGoogleAdsAccountAssociation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "PlatformType",
                table: "Platforms",
                type: "nvarchar(450)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<string>(
                name: "AccountName",
                table: "Platforms",
                type: "nvarchar(250)",
                maxLength: 250,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ExternalAccountId",
                table: "Platforms",
                type: "nvarchar(64)",
                maxLength: 64,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "GoogleAdsConnectionId",
                table: "Platforms",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LoginCustomerId",
                table: "Platforms",
                type: "nvarchar(64)",
                maxLength: 64,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Platforms_GoogleAdsConnectionId",
                table: "Platforms",
                column: "GoogleAdsConnectionId");

            migrationBuilder.CreateIndex(
                name: "IX_Platforms_PlatformType_ExternalAccountId",
                table: "Platforms",
                columns: new[] { "PlatformType", "ExternalAccountId" });

            migrationBuilder.AddForeignKey(
                name: "FK_Platforms_GoogleAdsConnections_GoogleAdsConnectionId",
                table: "Platforms",
                column: "GoogleAdsConnectionId",
                principalTable: "GoogleAdsConnections",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Platforms_GoogleAdsConnections_GoogleAdsConnectionId",
                table: "Platforms");

            migrationBuilder.DropIndex(
                name: "IX_Platforms_GoogleAdsConnectionId",
                table: "Platforms");

            migrationBuilder.DropIndex(
                name: "IX_Platforms_PlatformType_ExternalAccountId",
                table: "Platforms");

            migrationBuilder.DropColumn(
                name: "AccountName",
                table: "Platforms");

            migrationBuilder.DropColumn(
                name: "ExternalAccountId",
                table: "Platforms");

            migrationBuilder.DropColumn(
                name: "GoogleAdsConnectionId",
                table: "Platforms");

            migrationBuilder.DropColumn(
                name: "LoginCustomerId",
                table: "Platforms");

            migrationBuilder.AlterColumn<string>(
                name: "PlatformType",
                table: "Platforms",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");
        }
    }
}
