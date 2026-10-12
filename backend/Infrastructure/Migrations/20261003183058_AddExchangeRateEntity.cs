using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Dashboard.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddExchangeRateEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Clients') AND name = 'Currency')
BEGIN
    ALTER TABLE [Clients] ADD [Currency] nvarchar(max) NOT NULL DEFAULT '';
END
");

            migrationBuilder.CreateTable(
                name: "ExchangeRates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    Currency = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Rate = table.Column<double>(type: "float", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExchangeRates", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ExchangeRates_Date_Currency",
                table: "ExchangeRates",
                columns: new[] { "Date", "Currency" },
                unique: true);

            migrationBuilder.Sql(@"
IF OBJECT_ID('SearchTerms', 'U') IS NULL
BEGIN
    CREATE TABLE [SearchTerms] (
        [Id] int NOT NULL IDENTITY,
        [Term] nvarchar(500) NOT NULL,
        [Keyword] nvarchar(250) NULL,
        [MatchType] nvarchar(50) NOT NULL,
        [Date] date NOT NULL,
        [Impressions] int NOT NULL,
        [Clicks] int NOT NULL,
        [Spend] float NOT NULL,
        [Conversions] int NOT NULL,
        [AdSetId] int NOT NULL,
        CONSTRAINT [PK_SearchTerms] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_SearchTerms_AdSets_AdSetId] FOREIGN KEY ([AdSetId]) REFERENCES [AdSets] ([Id]) ON DELETE CASCADE
    );
    CREATE INDEX [IX_SearchTerms_AdSetId_Date] ON [SearchTerms] ([AdSetId], [Date]);
END
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ExchangeRates");

            migrationBuilder.DropTable(
                name: "SearchTerms");

            migrationBuilder.DropColumn(
                name: "Currency",
                table: "Clients");
        }
    }
}
