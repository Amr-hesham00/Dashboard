-- Seed Mock Data Script for SQL Server
-- Location: backend/API/Scripts/SeedMockData.sql
-- Database: Dashboard

USE [Dashboard];
GO

-- 1. Seed Platforms
IF NOT EXISTS (SELECT 1 FROM [Platforms] WHERE [Name] = 'Meta Ads')
BEGIN
    INSERT INTO [Platforms] ([Name], [Code], [Status])
    VALUES 
    ('Meta Ads', 'META', 0),
    ('Google Search & Shopping', 'GOOG', 0),
    ('TikTok Ads Manager', 'TT', 0),
    ('LinkedIn Marketing Solutions', 'LNKD', 0);
END
GO

-- 2. Seed Clients
IF NOT EXISTS (SELECT 1 FROM [Clients] WHERE [CompanyName] = 'Acme Corporation')
BEGIN
    DECLARE @ManagerId NVARCHAR(450);
    SELECT TOP 1 @ManagerId = [Id] FROM [AspNetUsers];

    IF (@ManagerId IS NOT NULL)
    BEGIN
        INSERT INTO [Clients] ([CompanyName], [Website], [Email], [Phone], [Country], [Currency], [Status], [CreatedAt], [Notes], [ManagerId])
        VALUES 
        ('Acme Corporation', 'https://acmeglobal.com', 'contact@acmeglobal.com', '+1 (800) 555-0199', 'United States', 0, 0, GETDATE(), 'Enterprise Tech Client', @ManagerId),
        ('Nexus Wear Ltd.', 'https://nexusfashion.com', 'marketing@nexusfashion.com', '+1 (800) 555-0244', 'United Kingdom', 0, 0, GETDATE(), 'Retail Apparel Account', @ManagerId),
        ('BioHealth Labs Inc.', 'https://biohealth.com', 'support@biohealth.com', '+1 (800) 555-0811', 'Canada', 0, 0, GETDATE(), 'Health Supplement Retargeting', @ManagerId);
    END
END
GO

-- 3. Seed Campaigns
IF NOT EXISTS (SELECT 1 FROM [Campaigns] WHERE [Name] = 'Summer Mega Sales 2026')
BEGIN
    DECLARE @PlatformId INT;
    SELECT TOP 1 @PlatformId = [Id] FROM [Platforms];

    IF (@PlatformId IS NOT NULL)
    BEGIN
        INSERT INTO [Campaigns] ([Name], [Objective], [Status], [Spend], [Revenue], [ROAS], [StartDate], [EndDate], [CreatedAt], [PlatformId])
        VALUES 
        ('Summer Mega Sales 2026', 0, 0, 24500, 98000, 4.0, '2026-05-01', '2026-08-31', GETDATE(), @PlatformId),
        ('Black Friday Early Bird Retargeting', 0, 0, 18200, 63700, 3.5, '2026-06-15', '2026-09-30', GETDATE(), @PlatformId),
        ('Brand Awareness & Viral Push', 1, 0, 12000, 38400, 3.2, '2026-07-01', '2026-10-15', GETDATE(), @PlatformId);
    END
END
GO
