using Dashboard.API.Controllers;
using Dashboard.Application.DTOs;
using Dashboard.Application.Interfaces;
using Dashboard.Application.Interfaces.Services;
using Dashboard.Application.Services;
using Dashboard.Domain.Entities;
using Dashboard.Domain.Enums;
using Dashboard.Infrastructure;
using Dashboard.Infrastructure.Repositories;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;

namespace Dashboard.Tests;

public class ClientReportingCurrencyTests
{
    private (AppDbContext Db, IUnitOfWork Uow) CreateTestContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        var db = new AppDbContext(options);

        var adRepo = new AdRepo(db);
        var adSetRepo = new AdSetRepo(db);
        var assignmentRepo = new AssignmentRepo(db);
        var associateProfileRepo = new AssociateProfileRepo(db);
        var associateTeamRepo = new AssociateTeamRepo(db);
        var campaignRepo = new CampaignRepo(db);
        var clientRepo = new ClientRepo(db);
        var platformRepo = new PlatformRepo(db);
        var userRepo = new UserRepo(db);
        var refreshTokenRepo = new RefreshTokenRepo(db);
        var clientTargetRepo = new ClientTargetRepo(db);
        var adDailyMetricsRepo = new AdDailyMetricsRepo(db);
        var searchTermRepo = new SearchTermRepo(db);
        var exchangeRateRepo = new ExchangeRateRepo(db);
        var oauthConnectionRepo = new OAuthConnectionRepo(db);
        var assetGroupRepo = new AssetGroupRepo(db);
        var dailyAssetGroupMetricsRepo = new DailyAssetGroupMetricsRepo(db);

        var uow = new UnitOfWork(
            db,
            adRepo,
            adSetRepo,
            assignmentRepo,
            associateProfileRepo,
            associateTeamRepo,
            campaignRepo,
            clientRepo,
            platformRepo,
            userRepo,
            refreshTokenRepo,
            clientTargetRepo,
            adDailyMetricsRepo,
            searchTermRepo,
            exchangeRateRepo,
            oauthConnectionRepo,
            assetGroupRepo,
            dailyAssetGroupMetricsRepo
        );

        return (db, uow);
    }

    [Fact]
    public async Task UpdateReportingCurrencyAsync_UpdatesClientUnitCurrency_WithoutModifyingClientTargetCurrency()
    {
        // Arrange
        var (db, uow) = CreateTestContext();
        var client = new Client
        {
            CompanyName = "Acme Test Corp",
            Website = "https://acme.test",
            Email = "contact@acme.test",
            Phone = "+15551234567",
            Country = "United States",
            UnitCurrency = Currency.USD,
            Status = ClientStatus.Active,
            BusinessModel = BusinessModel.Ecommerce,
            ManagerId = "mgr-1",
            CreatedAt = DateTimeOffset.UtcNow
        };
        db.client.Add(client);
        await db.SaveChangesAsync();
        db.ChangeTracker.Clear();

        var target = new ClientTarget
        {
            ClientId = client.Id,
            Currency = Currency.SAR, // target currency SAR
            MonthlyBudget = 50000,
            TargetROAS = 4.5,
            TargetCPA = 25
        };
        db.ClientTargets.Add(target);
        await db.SaveChangesAsync();
        db.ChangeTracker.Clear();

        var clientService = new ClientService(uow);

        // Act - change reporting currency to EUR via UpdateReportingCurrencyAsync
        var (success, message, newCurrency) = await clientService.UpdateReportingCurrencyAsync(client.Id, Currency.EUR);

        // Assert
        Assert.True(success);
        Assert.Equal("EUR", newCurrency);

        var refreshedClient = await db.client.Include(c => c.Target).SingleAsync(c => c.Id == client.Id);
        Assert.Equal(Currency.EUR, refreshedClient.UnitCurrency); // Changed to EUR
        Assert.NotNull(refreshedClient.Target);
        Assert.Equal(Currency.SAR, refreshedClient.Target!.Currency); // Untouched SAR
        Assert.Equal(50000, refreshedClient.Target.MonthlyBudget);
    }

    [Fact]
    public async Task UpdateClientAsync_UpdatesClientUnitCurrency_WithoutModifyingClientTargetCurrency()
    {
        // Arrange
        var (db, uow) = CreateTestContext();
        var client = new Client
        {
            CompanyName = "Global Ventures",
            Website = "https://global.test",
            Email = "info@global.test",
            Phone = "+15559876543",
            Country = "United States",
            UnitCurrency = Currency.USD,
            Status = ClientStatus.Active,
            BusinessModel = BusinessModel.Ecommerce,
            ManagerId = "mgr-2",
            CreatedAt = DateTimeOffset.UtcNow
        };
        db.client.Add(client);
        await db.SaveChangesAsync();
        db.ChangeTracker.Clear();

        var target = new ClientTarget
        {
            ClientId = client.Id,
            Currency = Currency.KWD, // target currency KWD
            MonthlyBudget = 3000,
            TargetROAS = 3.2
        };
        db.ClientTargets.Add(target);
        await db.SaveChangesAsync();
        db.ChangeTracker.Clear();

        var clientService = new ClientService(uow);

        var updateDto = new UpdateClientDTO
        {
            CompanyName = "Global Ventures Updated",
            Website = "https://global.test",
            Email = "info@global.test",
            Phone = "+15559876543",
            Country = "United States",
            Currency = Currency.AED, // update to AED in edit client modal
            Status = ClientStatus.Active,
            BusinessModel = BusinessModel.Ecommerce,
            ManagerId = "mgr-2"
        };

        // Act
        var (success, message) = await clientService.UpdateClientAsync(client.Id, updateDto);

        // Assert
        Assert.True(success);

        var refreshedClient = await db.client.Include(c => c.Target).SingleAsync(c => c.Id == client.Id);
        Assert.Equal(Currency.AED, refreshedClient.UnitCurrency); // Changed to AED
        Assert.NotNull(refreshedClient.Target);
        Assert.Equal(Currency.KWD, refreshedClient.Target!.Currency); // Untouched KWD
    }

    [Fact]
    public async Task UpdateReportingCurrency_ViaController_ReturnsOkAndPersistsCurrency()
    {
        // Arrange
        var (db, uow) = CreateTestContext();
        var client = new Client
        {
            CompanyName = "Controller Test Client",
            Website = "https://controller.test",
            Email = "test@controller.test",
            Phone = "+15551112233",
            Country = "United States",
            UnitCurrency = Currency.USD,
            Status = ClientStatus.Active,
            BusinessModel = BusinessModel.Lead,
            ManagerId = "mgr-3",
            CreatedAt = DateTimeOffset.UtcNow
        };
        db.client.Add(client);
        await db.SaveChangesAsync();
        db.ChangeTracker.Clear();

        var clientService = new ClientService(uow);
        var controller = new ClientController(clientService, null!);

        var dto = new UpdateReportingCurrencyDTO
        {
            Currency = Currency.QAR
        };

        // Act
        var result = await controller.UpdateReportingCurrency(client.Id, dto);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var refreshedClient = await db.client.FindAsync(client.Id);
        Assert.NotNull(refreshedClient);
        Assert.Equal(Currency.QAR, refreshedClient!.UnitCurrency);
    }
}
