using Dashboard.Domain.Entities;
using Dashboard.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using MatchType = Dashboard.Domain.Enums.MatchType;

namespace Dashboard.Infrastructure;

public static class DataSeeder
{
    public static async Task SeedClientDataAsync(AppDbContext context, string managerId)
    {
        // Only seed if no clients exist in the database
        if (await context.client.AnyAsync())
        {
            return;
        }

        var now = DateTimeOffset.UtcNow;
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        // =========================================================================
        // CLIENT 1: Acme Global Tech (E-Commerce, USD, High-growth Tech Brand)
        // Connected: Meta Ads (USD), Google Ads (USD), TikTok Ads (USD)
        // Pending: Snapchat Ads (USD)
        // =========================================================================
        var client1 = new Client
        {
            CompanyName = "Acme Global Tech",
            Logo = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&q=80",
            Website = "https://acmeglobal.tech",
            Email = "marketing@acmeglobal.tech",
            Phone = "+1 (800) 555-0199",
            Country = "United States",
            UnitCurrency = Currency.USD,
            Status = ClientStatus.Active,
            BusinessModel = BusinessModel.Ecommerce,
            CreatedAt = now.AddDays(-60),
            Notes = "High-priority enterprise account. Scaled e-commerce retail with multichannel marketing.",
            ManagerId = managerId,
            Target = new ClientTarget
            {
                Currency = Currency.USD,
                MonthlyBudget = 60000,
                TargetROAS = 3.8,
                TargetCPA = 35.0,
                TargetRevenue = 228000,
                TargetConversions = 1600,
                TargetCTR = 2.4,
                TargetCPC = 1.25
            },
            Platforms = new List<Platform>()
        };

        // Platform 1.1: Meta Ads (Connected, USD)
        var p1_meta = new Platform
        {
            PlatformType = PlatformType.MetaAds,
            Status = PlatformStatus.Connected,
            Currency = Currency.USD,
            CreatedAt = now.AddDays(-60),
            Campaigns = new List<Campaign>()
        };

        var camp1_meta_1 = new Campaign
        {
            Name = "US - Q3 Retargeting - High Intent Cart",
            Objective = CampaignObjective.Sales,
            Currency = Currency.USD,
            Status = CampaignStatus.Active,
            StartDate = now.AddDays(-30),
            CreatedAt = now.AddDays(-30),
            AdSets = new List<AdSet>()
        };

        var adset1_meta_1 = new AdSet
        {
            Name = "Website Visitors 30D + AddToCart",
            AudienceType = "Custom Audience - Cart Abandoners",
            AgeRange = "22-55",
            Gender = AdSetGender.All,
            Location = "United States",
            Status = AdSetStatus.Active,
            StartDate = now.AddDays(-30),
            Ads = new List<Ad>()
        };

        var ad1_meta_1 = new Ad
        {
            Name = "Dynamic Carousel - Tech Essentials",
            Headline = "Finish Your Setup | Extra 15% Off Today",
            Description = "Grab your favorite smart gadgets before stock runs out. Free 2-day delivery.",
            CTA = "Shop Now",
            MediaType = MediaType.Carousel,
            MediaURL = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
            Status = AdStatus.Active,
            CreatedAt = now.AddDays(-30),
            DailyMetrics = GenerateDailyMetrics(today, 14, 
                baseImpressions: 12500, baseClicks: 420, baseConversions: 32, baseSpend: 480.0, baseRevenue: 2200.0)
        };

        var ad1_meta_2 = new Ad
        {
            Name = "Video Spotlight - Noise Cancelling Pro",
            Headline = "Hear Pure Focus | Ergonomic Audio",
            Description = "Award-winning noise isolation for creators and devs.",
            CTA = "Order Now",
            MediaType = MediaType.Video,
            MediaURL = "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80",
            Status = AdStatus.Active,
            CreatedAt = now.AddDays(-25),
            DailyMetrics = GenerateDailyMetrics(today, 14, 
                baseImpressions: 9800, baseClicks: 310, baseConversions: 18, baseSpend: 340.0, baseRevenue: 1350.0)
        };

        adset1_meta_1.Ads.Add(ad1_meta_1);
        adset1_meta_1.Ads.Add(ad1_meta_2);
        camp1_meta_1.AdSets.Add(adset1_meta_1);
        p1_meta.Campaigns.Add(camp1_meta_1);

        // Platform 1.2: Google Ads (Connected, USD)
        var p1_google = new Platform
        {
            PlatformType = PlatformType.GoogleAds,
            Status = PlatformStatus.Connected,
            Currency = Currency.USD,
            CreatedAt = now.AddDays(-60),
            Campaigns = new List<Campaign>()
        };

        var camp1_google_1 = new Campaign
        {
            Name = "Search - Top Tier Brand & Products",
            Objective = CampaignObjective.Sales,
            Currency = Currency.USD,
            Status = CampaignStatus.Active,
            StartDate = now.AddDays(-45),
            CreatedAt = now.AddDays(-45),
            AdSets = new List<AdSet>()
        };

        var adset1_google_1 = new AdSet
        {
            Name = "Search - Smart Desk Gear",
            AudienceType = "In-Market - Consumer Electronics",
            AgeRange = "25-54",
            Gender = AdSetGender.All,
            Location = "United States, Canada",
            Status = AdSetStatus.Active,
            StartDate = now.AddDays(-45),
            Ads = new List<Ad>(),
            SearchTerms = new List<SearchTerm>()
        };

        var ad1_google_1 = new Ad
        {
            Name = "Responsive Search Ad - Smart Workstation",
            Headline = "Premium Smart Desk Gear | Acme Official",
            Description = "Modular ergonomic workstations crafted for productivity. 30-day money back guarantee.",
            CTA = "Learn More",
            MediaType = MediaType.Image,
            MediaURL = "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80",
            Status = AdStatus.Active,
            CreatedAt = now.AddDays(-45),
            DailyMetrics = GenerateDailyMetrics(today, 14, 
                baseImpressions: 16400, baseClicks: 650, baseConversions: 45, baseSpend: 620.0, baseRevenue: 3100.0)
        };

        adset1_google_1.Ads.Add(ad1_google_1);

        // Add Google Search Terms
        adset1_google_1.SearchTerms.Add(new SearchTerm
        {
            Term = "best motorized standing desk 2026",
            Keyword = "motorized standing desk",
            MatchType = MatchType.Phrase,
            Date = today.AddDays(-1),
            Impressions = 4200,
            Clicks = 310,
            Spend = 290.50,
            Conversions = 26
        });
        adset1_google_1.SearchTerms.Add(new SearchTerm
        {
            Term = "acme global desk accessories",
            Keyword = "acme global tech",
            MatchType = MatchType.Exact,
            Date = today.AddDays(-1),
            Impressions = 5800,
            Clicks = 540,
            Spend = 310.00,
            Conversions = 44
        });
        adset1_google_1.SearchTerms.Add(new SearchTerm
        {
            Term = "cheap standing desks under $100",
            Keyword = "standing desk",
            MatchType = MatchType.Broad,
            Date = today.AddDays(-2),
            Impressions = 1950,
            Clicks = 82,
            Spend = 95.00,
            Conversions = 0
        });
        adset1_google_1.SearchTerms.Add(new SearchTerm
        {
            Term = "ergonomic workstation setup guide",
            Keyword = "ergonomic workstation",
            MatchType = MatchType.Phrase,
            Date = today.AddDays(-3),
            Impressions = 2600,
            Clicks = 175,
            Spend = 135.00,
            Conversions = 11
        });

        camp1_google_1.AdSets.Add(adset1_google_1);
        p1_google.Campaigns.Add(camp1_google_1);

        // Platform 1.3: TikTok Ads (Connected, USD)
        var p1_tiktok = new Platform
        {
            PlatformType = PlatformType.TikTokAds,
            Status = PlatformStatus.Connected,
            Currency = Currency.USD,
            CreatedAt = now.AddDays(-40),
            Campaigns = new List<Campaign>()
        };

        var camp1_tiktok_1 = new Campaign
        {
            Name = "TikTok - Viral Desk Setup Challenge",
            Objective = CampaignObjective.Traffic,
            Currency = Currency.USD,
            Status = CampaignStatus.Active,
            StartDate = now.AddDays(-20),
            CreatedAt = now.AddDays(-20),
            AdSets = new List<AdSet>()
        };

        var adset1_tiktok_1 = new AdSet
        {
            Name = "Gen Z & Millennial Techies (18-34)",
            AudienceType = "Interests: Gaming & Productivity Hacks",
            AgeRange = "18-34",
            Gender = AdSetGender.All,
            Location = "United States",
            Status = AdSetStatus.Active,
            StartDate = now.AddDays(-20),
            Ads = new List<Ad>()
        };

        var ad1_tiktok_1 = new Ad
        {
            Name = "Spark Ad - 10s Desk Cable Setup Hack",
            Headline = "Cleanest Desk Setup You Will Ever See ⚡",
            Description = "Clean cable management in under 60 seconds with Acme Hub.",
            CTA = "Shop Now",
            MediaType = MediaType.Video,
            MediaURL = "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&q=80",
            Status = AdStatus.Active,
            CreatedAt = now.AddDays(-20),
            DailyMetrics = GenerateDailyMetrics(today, 14, 
                baseImpressions: 28000, baseClicks: 890, baseConversions: 22, baseSpend: 310.0, baseRevenue: 1050.0)
        };

        adset1_tiktok_1.Ads.Add(ad1_tiktok_1);
        camp1_tiktok_1.AdSets.Add(adset1_tiktok_1);
        p1_tiktok.Campaigns.Add(camp1_tiktok_1);

        // Platform 1.4: Snapchat Ads (Pending, USD)
        var p1_snapchat = new Platform
        {
            PlatformType = PlatformType.SnapchatAds,
            Status = PlatformStatus.Pending,
            Currency = Currency.USD,
            CreatedAt = now.AddDays(-10),
            Campaigns = new List<Campaign>()
        };

        client1.Platforms.Add(p1_meta);
        client1.Platforms.Add(p1_google);
        client1.Platforms.Add(p1_tiktok);
        client1.Platforms.Add(p1_snapchat);


        // =========================================================================
        // CLIENT 2: Nexus Fashion Apparel (E-Commerce, EUR, European Luxury Apparel)
        // Connected: Meta Ads (EUR), Google Ads (EUR)
        // NotConnected: TikTok Ads (EUR), Snapchat Ads (EUR)
        // =========================================================================
        var client2 = new Client
        {
            CompanyName = "Nexus Fashion Apparel",
            Logo = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=128&q=80",
            Website = "https://nexus-apparel.eu",
            Email = "contact@nexus-apparel.eu",
            Phone = "+49 30 555 4920",
            Country = "Germany",
            UnitCurrency = Currency.EUR,
            Status = ClientStatus.Active,
            BusinessModel = BusinessModel.Ecommerce,
            CreatedAt = now.AddDays(-75),
            Notes = "Sustainable couture & seasonal luxury wear with stores in Berlin, Paris, and Milan.",
            ManagerId = managerId,
            Target = new ClientTarget
            {
                Currency = Currency.EUR,
                MonthlyBudget = 42000,
                TargetROAS = 4.2,
                TargetCPA = 48.0,
                TargetRevenue = 176400,
                TargetConversions = 900,
                TargetCTR = 2.8,
                TargetCPC = 1.40
            },
            Platforms = new List<Platform>()
        };

        var p2_meta = new Platform
        {
            PlatformType = PlatformType.MetaAds,
            Status = PlatformStatus.Connected,
            Currency = Currency.EUR,
            CreatedAt = now.AddDays(-75),
            Campaigns = new List<Campaign>()
        };

        var camp2_meta_1 = new Campaign
        {
            Name = "EU - Autumn Elegance Capsule Collection",
            Objective = CampaignObjective.Sales,
            Currency = Currency.EUR,
            Status = CampaignStatus.Active,
            StartDate = now.AddDays(-28),
            CreatedAt = now.AddDays(-28),
            AdSets = new List<AdSet>()
        };

        var adset2_meta_1 = new AdSet
        {
            Name = "High Net Worth & Luxury Fashion Lookalikes 2%",
            AudienceType = "Lookalike Audience 2%",
            AgeRange = "25-50",
            Gender = AdSetGender.Female,
            Location = "Germany, France, Italy, Austria",
            Status = AdSetStatus.Active,
            StartDate = now.AddDays(-28),
            Ads = new List<Ad>()
        };

        var ad2_meta_1 = new Ad
        {
            Name = "Lookbook Reel - Sustainable Silk Overcoats",
            Headline = "Effortless Luxury | 100% Recycled Italian Silk",
            Description = "Handcrafted in Milan. Complimentary bespoke fitting on all orders.",
            CTA = "Shop Now",
            MediaType = MediaType.Video,
            MediaURL = "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80",
            Status = AdStatus.Active,
            CreatedAt = now.AddDays(-28),
            DailyMetrics = GenerateDailyMetrics(today, 14, 
                baseImpressions: 14200, baseClicks: 520, baseConversions: 35, baseSpend: 540.0, baseRevenue: 2750.0)
        };

        adset2_meta_1.Ads.Add(ad2_meta_1);
        camp2_meta_1.AdSets.Add(adset2_meta_1);
        p2_meta.Campaigns.Add(camp2_meta_1);

        var p2_google = new Platform
        {
            PlatformType = PlatformType.GoogleAds,
            Status = PlatformStatus.Connected,
            Currency = Currency.EUR,
            CreatedAt = now.AddDays(-75),
            Campaigns = new List<Campaign>()
        };

        var camp2_google_1 = new Campaign
        {
            Name = "Google Shopping - Designer Coats & Knitwear",
            Objective = CampaignObjective.Sales,
            Currency = Currency.EUR,
            Status = CampaignStatus.Active,
            StartDate = now.AddDays(-40),
            CreatedAt = now.AddDays(-40),
            AdSets = new List<AdSet>()
        };

        var adset2_google_1 = new AdSet
        {
            Name = "Performance Max - Luxury Outerwear",
            AudienceType = "Luxury Shoppers",
            AgeRange = "25-60",
            Gender = AdSetGender.All,
            Location = "Germany, France",
            Status = AdSetStatus.Active,
            StartDate = now.AddDays(-40),
            Ads = new List<Ad>(),
            SearchTerms = new List<SearchTerm>()
        };

        var ad2_google_1 = new Ad
        {
            Name = "PMax Asset Group - Cashmere Coats",
            Headline = "Designer Cashmere Outerwear | Nexus Couture",
            Description = "Limited edition autumn release. Sustainable certified European tailoring.",
            CTA = "Explore Collection",
            MediaType = MediaType.Image,
            MediaURL = "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80",
            Status = AdStatus.Active,
            CreatedAt = now.AddDays(-40),
            DailyMetrics = GenerateDailyMetrics(today, 14, 
                baseImpressions: 11000, baseClicks: 410, baseConversions: 24, baseSpend: 420.0, baseRevenue: 2100.0)
        };

        adset2_google_1.Ads.Add(ad2_google_1);
        adset2_google_1.SearchTerms.Add(new SearchTerm
        {
            Term = "sustainable cashmere trench coat designer",
            Keyword = "sustainable cashmere coat",
            MatchType = MatchType.Phrase,
            Date = today.AddDays(-1),
            Impressions = 3200,
            Clicks = 210,
            Spend = 195.0,
            Conversions = 16
        });
        adset2_google_1.SearchTerms.Add(new SearchTerm
        {
            Term = "nexus apparel berlin",
            Keyword = "nexus apparel",
            MatchType = MatchType.Exact,
            Date = today.AddDays(-1),
            Impressions = 4100,
            Clicks = 380,
            Spend = 160.0,
            Conversions = 29
        });

        camp2_google_1.AdSets.Add(adset2_google_1);
        p2_google.Campaigns.Add(camp2_google_1);

        var p2_tiktok = new Platform
        {
            PlatformType = PlatformType.TikTokAds,
            Status = PlatformStatus.NotConnected,
            Currency = Currency.EUR,
            CreatedAt = now.AddDays(-20)
        };

        var p2_snapchat = new Platform
        {
            PlatformType = PlatformType.SnapchatAds,
            Status = PlatformStatus.NotConnected,
            Currency = Currency.EUR,
            CreatedAt = now.AddDays(-20)
        };

        client2.Platforms.Add(p2_meta);
        client2.Platforms.Add(p2_google);
        client2.Platforms.Add(p2_tiktok);
        client2.Platforms.Add(p2_snapchat);


        // =========================================================================
        // CLIENT 3: Gulf Real Estate Holdings (Lead Generation, AED, Dubai Luxury Estates)
        // Connected: Meta Ads (AED), Google Ads (AED), Snapchat Ads (AED)
        // NotConnected: TikTok Ads (AED)
        // =========================================================================
        var client3 = new Client
        {
            CompanyName = "Gulf Real Estate Holdings",
            Logo = "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=128&q=80",
            Website = "https://gulfrealestate.ae",
            Email = "vip@gulfrealestate.ae",
            Phone = "+971 4 398 2210",
            Country = "United Arab Emirates",
            UnitCurrency = Currency.AED,
            Status = ClientStatus.Active,
            BusinessModel = BusinessModel.Lead,
            CreatedAt = now.AddDays(-90),
            Notes = "High-ticket prime residential villas and penthouses in Dubai Marina & Palm Jumeirah.",
            ManagerId = managerId,
            Target = new ClientTarget
            {
                Currency = Currency.AED,
                MonthlyBudget = 85000,
                TargetROAS = 6.5,
                TargetCPA = 120.0,
                TargetRevenue = 552500,
                TargetConversions = 650,
                TargetCTR = 3.2,
                TargetCPC = 4.50
            },
            Platforms = new List<Platform>()
        };

        var p3_meta = new Platform
        {
            PlatformType = PlatformType.MetaAds,
            Status = PlatformStatus.Connected,
            Currency = Currency.AED,
            CreatedAt = now.AddDays(-90),
            Campaigns = new List<Campaign>()
        };

        var camp3_meta_1 = new Campaign
        {
            Name = "Palm Villas - VIP Private Viewing Invitations",
            Objective = CampaignObjective.Leads,
            Currency = Currency.AED,
            Status = CampaignStatus.Active,
            StartDate = now.AddDays(-35),
            CreatedAt = now.AddDays(-35),
            AdSets = new List<AdSet>()
        };

        var adset3_meta_1 = new AdSet
        {
            Name = "GCC Investors - Ultra High Net Worth",
            AudienceType = "Investors, Real Estate Property Seekers",
            AgeRange = "30-65",
            Gender = AdSetGender.All,
            Location = "UAE, Saudi Arabia, Kuwait, Qatar",
            Status = AdSetStatus.Active,
            StartDate = now.AddDays(-35),
            Ads = new List<Ad>()
        };

        var ad3_meta_1 = new Ad
        {
            Name = "Instant Form - Palm Jumeirah Beachfront Mansions",
            Headline = "Own a Private Beachfront Villa in Palm Jumeirah",
            Description = "Direct sea access, infinity pools, and guaranteed 8% ROI. Schedule a VIP private tour.",
            CTA = "Sign Up",
            MediaType = MediaType.Image,
            MediaURL = "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
            Status = AdStatus.Active,
            CreatedAt = now.AddDays(-35),
            DailyMetrics = GenerateDailyMetrics(today, 14, 
                baseImpressions: 18500, baseClicks: 620, baseConversions: 42, baseSpend: 1100.0, baseRevenue: 7800.0)
        };

        adset3_meta_1.Ads.Add(ad3_meta_1);
        camp3_meta_1.AdSets.Add(adset3_meta_1);
        p3_meta.Campaigns.Add(camp3_meta_1);

        var p3_google = new Platform
        {
            PlatformType = PlatformType.GoogleAds,
            Status = PlatformStatus.Connected,
            Currency = Currency.AED,
            CreatedAt = now.AddDays(-90),
            Campaigns = new List<Campaign>()
        };

        var camp3_google_1 = new Campaign
        {
            Name = "Search - Dubai Luxury Villas For Sale",
            Objective = CampaignObjective.Leads,
            Currency = Currency.AED,
            Status = CampaignStatus.Active,
            StartDate = now.AddDays(-50),
            CreatedAt = now.AddDays(-50),
            AdSets = new List<AdSet>()
        };

        var adset3_google_1 = new AdSet
        {
            Name = "Search - High-Intent Keywords UAE",
            AudienceType = "In-Market Real Estate Buyers",
            AgeRange = "28-65",
            Gender = AdSetGender.All,
            Location = "United Arab Emirates",
            Status = AdSetStatus.Active,
            StartDate = now.AddDays(-50),
            Ads = new List<Ad>(),
            SearchTerms = new List<SearchTerm>()
        };

        var ad3_google_1 = new Ad
        {
            Name = "Search Text Ad - Palm Waterfront Mansions",
            Headline = "Luxury Villas in Dubai | Handover Q4 2026",
            Description = "Exclusive waterfront compounds with private berths. Flexible 5-year payment plan available.",
            CTA = "Book Tour",
            MediaType = MediaType.Image,
            MediaURL = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
            Status = AdStatus.Active,
            CreatedAt = now.AddDays(-50),
            DailyMetrics = GenerateDailyMetrics(today, 14, 
                baseImpressions: 8900, baseClicks: 410, baseConversions: 28, baseSpend: 850.0, baseRevenue: 5950.0)
        };

        adset3_google_1.Ads.Add(ad3_google_1);
        adset3_google_1.SearchTerms.Add(new SearchTerm
        {
            Term = "palm jumeirah villa for sale beachfront",
            Keyword = "palm jumeirah villas",
            MatchType = MatchType.Exact,
            Date = today.AddDays(-1),
            Impressions = 2100,
            Clicks = 195,
            Spend = 420.0,
            Conversions = 22
        });
        adset3_google_1.SearchTerms.Add(new SearchTerm
        {
            Term = "dubai marina penthouse price with private pool",
            Keyword = "dubai luxury penthouses",
            MatchType = MatchType.Phrase,
            Date = today.AddDays(-2),
            Impressions = 1850,
            Clicks = 140,
            Spend = 310.0,
            Conversions = 14
        });

        camp3_google_1.AdSets.Add(adset3_google_1);
        p3_google.Campaigns.Add(camp3_google_1);

        var p3_snap = new Platform
        {
            PlatformType = PlatformType.SnapchatAds,
            Status = PlatformStatus.Connected,
            Currency = Currency.AED,
            CreatedAt = now.AddDays(-30),
            Campaigns = new List<Campaign>()
        };

        var camp3_snap_1 = new Campaign
        {
            Name = "Snapchat - Story AR Filter & Tour Video",
            Objective = CampaignObjective.Leads,
            Currency = Currency.AED,
            Status = CampaignStatus.Active,
            StartDate = now.AddDays(-15),
            CreatedAt = now.AddDays(-15),
            AdSets = new List<AdSet>()
        };

        var adset3_snap_1 = new AdSet
        {
            Name = "UAE & KSA High Spenders",
            AudienceType = "Luxury Lifestyle, Investors",
            AgeRange = "25-50",
            Gender = AdSetGender.All,
            Location = "UAE, Saudi Arabia",
            Status = AdSetStatus.Active,
            StartDate = now.AddDays(-15),
            Ads = new List<Ad>()
        };

        var ad3_snap_1 = new Ad
        {
            Name = "Snap Story Ad - Villa Drone Showcase",
            Headline = "Step Inside Dubai's Most Coveted Villa",
            Description = "Swipe up to download our 2026 investment portfolio brochure.",
            CTA = "Swipe Up",
            MediaType = MediaType.Video,
            MediaURL = "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80",
            Status = AdStatus.Active,
            CreatedAt = now.AddDays(-15),
            DailyMetrics = GenerateDailyMetrics(today, 14, 
                baseImpressions: 22000, baseClicks: 750, baseConversions: 24, baseSpend: 620.0, baseRevenue: 3400.0)
        };

        adset3_snap_1.Ads.Add(ad3_snap_1);
        camp3_snap_1.AdSets.Add(adset3_snap_1);
        p3_snap.Campaigns.Add(camp3_snap_1);

        var p3_tiktok = new Platform
        {
            PlatformType = PlatformType.TikTokAds,
            Status = PlatformStatus.NotConnected,
            Currency = Currency.AED,
            CreatedAt = now.AddDays(-90)
        };

        client3.Platforms.Add(p3_meta);
        client3.Platforms.Add(p3_google);
        client3.Platforms.Add(p3_snap);
        client3.Platforms.Add(p3_tiktok);


        // =========================================================================
        // CLIENT 4: Nile Bloom Cosmetics (E-Commerce, EGP, Egyptian Organic Skincare)
        // Connected: Meta Ads (EGP), TikTok Ads (EGP)
        // Pending: Google Ads (EGP)
        // NotConnected: Snapchat Ads (EGP)
        // =========================================================================
        var client4 = new Client
        {
            CompanyName = "Nile Bloom Cosmetics",
            Logo = "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=128&q=80",
            Website = "https://nilebloom.eg",
            Email = "orders@nilebloom.eg",
            Phone = "+20 2 2459 8831",
            Country = "Egypt",
            UnitCurrency = Currency.EGP,
            Status = ClientStatus.Active,
            BusinessModel = BusinessModel.Ecommerce,
            CreatedAt = now.AddDays(-45),
            Notes = "Fast-growing clean beauty and botanical skincare brand with direct-to-consumer online distribution across Egypt.",
            ManagerId = managerId,
            Target = new ClientTarget
            {
                Currency = Currency.EGP,
                MonthlyBudget = 180000,
                TargetROAS = 3.6,
                TargetCPA = 85.0,
                TargetRevenue = 648000,
                TargetConversions = 2100,
                TargetCTR = 3.4,
                TargetCPC = 2.20
            },
            Platforms = new List<Platform>()
        };

        var p4_meta = new Platform
        {
            PlatformType = PlatformType.MetaAds,
            Status = PlatformStatus.Connected,
            Currency = Currency.EGP,
            CreatedAt = now.AddDays(-45),
            Campaigns = new List<Campaign>()
        };

        var camp4_meta_1 = new Campaign
        {
            Name = "EG - Summer Radiance Serum Promo",
            Objective = CampaignObjective.Sales,
            Currency = Currency.EGP,
            Status = CampaignStatus.Active,
            StartDate = now.AddDays(-25),
            CreatedAt = now.AddDays(-25),
            AdSets = new List<AdSet>()
        };

        var adset4_meta_1 = new AdSet
        {
            Name = "Women 20-40 Cairo & Alex - Skincare Enthusiasts",
            AudienceType = "Interests: Beauty, Cosmetics, Organic Lifestyle",
            AgeRange = "20-40",
            Gender = AdSetGender.Female,
            Location = "Cairo, Alexandria, Giza",
            Status = AdSetStatus.Active,
            StartDate = now.AddDays(-25),
            Ads = new List<Ad>()
        };

        var ad4_meta_1 = new Ad
        {
            Name = "Image Ad - Vitamin C Radiance Glow Serum",
            Headline = "Say Goodbye to Dull Skin | Pure Organic Serum",
            Description = "Enriched with Egyptian rosewater and botanical Vitamin C. Cash on delivery nationwide.",
            CTA = "Order Now",
            MediaType = MediaType.Image,
            MediaURL = "https://images.unsplash.com/photo-1608248597359-002778735234?w=800&q=80",
            Status = AdStatus.Active,
            CreatedAt = now.AddDays(-25),
            DailyMetrics = GenerateDailyMetrics(today, 14, 
                baseImpressions: 48000, baseClicks: 2100, baseConversions: 88, baseSpend: 3800.0, baseRevenue: 15200.0)
        };

        adset4_meta_1.Ads.Add(ad4_meta_1);
        camp4_meta_1.AdSets.Add(adset4_meta_1);
        p4_meta.Campaigns.Add(camp4_meta_1);

        var p4_tiktok = new Platform
        {
            PlatformType = PlatformType.TikTokAds,
            Status = PlatformStatus.Connected,
            Currency = Currency.EGP,
            CreatedAt = now.AddDays(-45),
            Campaigns = new List<Campaign>()
        };

        var camp4_tiktok_1 = new Campaign
        {
            Name = "TikTok - Before & After Glow Transformation",
            Objective = CampaignObjective.Sales,
            Currency = Currency.EGP,
            Status = CampaignStatus.Active,
            StartDate = now.AddDays(-20),
            CreatedAt = now.AddDays(-20),
            AdSets = new List<AdSet>()
        };

        var adset4_tiktok_1 = new AdSet
        {
            Name = "Egyptian Beauty Creators & UGC Audience",
            AudienceType = "UGC Video Viewers & Skincare Shoppers",
            AgeRange = "18-35",
            Gender = AdSetGender.Female,
            Location = "Egypt",
            Status = AdSetStatus.Active,
            StartDate = now.AddDays(-20),
            Ads = new List<Ad>()
        };

        var ad4_tiktok_1 = new Ad
        {
            Name = "UGC Reel - 7 Days Skincare Routine",
            Headline = "The Glow Up Everyone Is Talking About ✨",
            Description = "Watch real results in 7 days. Buy 1 Get 1 Free this weekend only!",
            CTA = "Shop Now",
            MediaType = MediaType.Video,
            MediaURL = "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&q=80",
            Status = AdStatus.Active,
            CreatedAt = now.AddDays(-20),
            DailyMetrics = GenerateDailyMetrics(today, 14, 
                baseImpressions: 72000, baseClicks: 3200, baseConversions: 115, baseSpend: 4200.0, baseRevenue: 17600.0)
        };

        adset4_tiktok_1.Ads.Add(ad4_tiktok_1);
        camp4_tiktok_1.AdSets.Add(adset4_tiktok_1);
        p4_tiktok.Campaigns.Add(camp4_tiktok_1);

        var p4_google = new Platform
        {
            PlatformType = PlatformType.GoogleAds,
            Status = PlatformStatus.Pending,
            Currency = Currency.EGP,
            CreatedAt = now.AddDays(-10)
        };

        var p4_snap = new Platform
        {
            PlatformType = PlatformType.SnapchatAds,
            Status = PlatformStatus.NotConnected,
            Currency = Currency.EGP,
            CreatedAt = now.AddDays(-45)
        };

        client4.Platforms.Add(p4_meta);
        client4.Platforms.Add(p4_tiktok);
        client4.Platforms.Add(p4_google);
        client4.Platforms.Add(p4_snap);


        // =========================================================================
        // CLIENT 5: Riyadh Desert Expeditions (Lead Generation, SAR, Saudi Tourism)
        // Connected: Snapchat Ads (SAR), TikTok Ads (SAR), Google Ads (SAR)
        // NotConnected: Meta Ads (SAR)
        // =========================================================================
        var client5 = new Client
        {
            CompanyName = "Riyadh Desert Expeditions",
            Logo = "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=128&q=80",
            Website = "https://riyadhexpeditions.sa",
            Email = "safari@riyadhexpeditions.sa",
            Phone = "+966 11 482 9900",
            Country = "Saudi Arabia",
            UnitCurrency = Currency.SAR,
            Status = ClientStatus.Active,
            BusinessModel = BusinessModel.Lead,
            CreatedAt = now.AddDays(-35),
            Notes = "Premium glamping, desert safaris, and corporate adventure packages in the Riyadh region.",
            ManagerId = managerId,
            Target = new ClientTarget
            {
                Currency = Currency.SAR,
                MonthlyBudget = 65000,
                TargetROAS = 4.5,
                TargetCPA = 95.0,
                TargetRevenue = 292500,
                TargetConversions = 680,
                TargetCTR = 3.6,
                TargetCPC = 2.80
            },
            Platforms = new List<Platform>()
        };

        var p5_snap = new Platform
        {
            PlatformType = PlatformType.SnapchatAds,
            Status = PlatformStatus.Connected,
            Currency = Currency.SAR,
            CreatedAt = now.AddDays(-35),
            Campaigns = new List<Campaign>()
        };

        var camp5_snap_1 = new Campaign
        {
            Name = "Winter Desert Nights - VIP Glamping",
            Objective = CampaignObjective.Leads,
            Currency = Currency.SAR,
            Status = CampaignStatus.Active,
            StartDate = now.AddDays(-20),
            CreatedAt = now.AddDays(-20),
            AdSets = new List<AdSet>()
        };

        var adset5_snap_1 = new AdSet
        {
            Name = "Saudi Youth & Families (21-45)",
            AudienceType = "Outdoor, Adventure, Weekend Trips",
            AgeRange = "21-45",
            Gender = AdSetGender.All,
            Location = "Riyadh, Eastern Province, Jeddah",
            Status = AdSetStatus.Active,
            StartDate = now.AddDays(-20),
            Ads = new List<Ad>()
        };

        var ad5_snap_1 = new Ad
        {
            Name = "Snap Lens - Campfire Star Gazing Experience",
            Headline = "Escape the City Under the Desert Stars 🌌",
            Description = "All-inclusive luxury tents, live campfire music, and dune bashing. Reserve early.",
            CTA = "Book Now",
            MediaType = MediaType.Video,
            MediaURL = "https://images.unsplash.com/photo-1542401886-65d6c61db217?w=800&q=80",
            Status = AdStatus.Active,
            CreatedAt = now.AddDays(-20),
            DailyMetrics = GenerateDailyMetrics(today, 14, 
                baseImpressions: 34000, baseClicks: 1400, baseConversions: 45, baseSpend: 950.0, baseRevenue: 4800.0)
        };

        adset5_snap_1.Ads.Add(ad5_snap_1);
        camp5_snap_1.AdSets.Add(adset5_snap_1);
        p5_snap.Campaigns.Add(camp5_snap_1);

        var p5_tiktok = new Platform
        {
            PlatformType = PlatformType.TikTokAds,
            Status = PlatformStatus.Connected,
            Currency = Currency.SAR,
            CreatedAt = now.AddDays(-35),
            Campaigns = new List<Campaign>()
        };

        var camp5_tiktok_1 = new Campaign
        {
            Name = "TikTok - Quad Bike Dune Rush",
            Objective = CampaignObjective.Traffic,
            Currency = Currency.SAR,
            Status = CampaignStatus.Active,
            StartDate = now.AddDays(-18),
            CreatedAt = now.AddDays(-18),
            AdSets = new List<AdSet>()
        };

        var adset5_tiktok_1 = new AdSet
        {
            Name = "Motorsports & Thrill Seekers",
            AudienceType = "Offroad Enthusiasts",
            AgeRange = "18-35",
            Gender = AdSetGender.All,
            Location = "Saudi Arabia",
            Status = AdSetStatus.Active,
            StartDate = now.AddDays(-18),
            Ads = new List<Ad>()
        };

        var ad5_tiktok_1 = new Ad
        {
            Name = "Ad Video - Red Sands Sunset Drift",
            Headline = "Feel the Adrenaline on Red Sands 🏎️",
            Description = "Guided ATV & quad biking tours with pro instructors. Safety equipment included.",
            CTA = "View Packages",
            MediaType = MediaType.Video,
            MediaURL = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80",
            Status = AdStatus.Active,
            CreatedAt = now.AddDays(-18),
            DailyMetrics = GenerateDailyMetrics(today, 14, 
                baseImpressions: 42000, baseClicks: 1750, baseConversions: 38, baseSpend: 820.0, baseRevenue: 3900.0)
        };

        adset5_tiktok_1.Ads.Add(ad5_tiktok_1);
        camp5_tiktok_1.AdSets.Add(adset5_tiktok_1);
        p5_tiktok.Campaigns.Add(camp5_tiktok_1);

        var p5_google = new Platform
        {
            PlatformType = PlatformType.GoogleAds,
            Status = PlatformStatus.Connected,
            Currency = Currency.SAR,
            CreatedAt = now.AddDays(-30),
            Campaigns = new List<Campaign>()
        };

        var camp5_google_1 = new Campaign
        {
            Name = "Search - Riyadh Safari & Desert Camp",
            Objective = CampaignObjective.Leads,
            Currency = Currency.SAR,
            Status = CampaignStatus.Active,
            StartDate = now.AddDays(-15),
            CreatedAt = now.AddDays(-15),
            AdSets = new List<AdSet>()
        };

        var adset5_google_1 = new AdSet
        {
            Name = "Search - Safari Keywords",
            AudienceType = "Tourism & Leisure Planners",
            AgeRange = "21-60",
            Gender = AdSetGender.All,
            Location = "Saudi Arabia",
            Status = AdSetStatus.Active,
            StartDate = now.AddDays(-15),
            Ads = new List<Ad>(),
            SearchTerms = new List<SearchTerm>()
        };

        var ad5_google_1 = new Ad
        {
            Name = "Search Ad - Best Riyadh Desert Safari",
            Headline = "Top-Rated Desert Safari In Riyadh | Instant Booking",
            Description = "5-star luxury desert camp with VIP dining and live shows. Group discounts available.",
            CTA = "Book Tour",
            MediaType = MediaType.Image,
            MediaURL = "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80",
            Status = AdStatus.Active,
            CreatedAt = now.AddDays(-15),
            DailyMetrics = GenerateDailyMetrics(today, 14, 
                baseImpressions: 11500, baseClicks: 620, baseConversions: 32, baseSpend: 740.0, baseRevenue: 3450.0)
        };

        adset5_google_1.Ads.Add(ad5_google_1);
        adset5_google_1.SearchTerms.Add(new SearchTerm
        {
            Term = "best desert safari riyadh red sand",
            Keyword = "desert safari riyadh",
            MatchType = MatchType.Phrase,
            Date = today.AddDays(-1),
            Impressions = 3100,
            Clicks = 280,
            Spend = 310.0,
            Conversions = 22
        });
        adset5_google_1.SearchTerms.Add(new SearchTerm
        {
            Term = "luxury glamping tent rental saudi arabia",
            Keyword = "luxury glamping saudi",
            MatchType = MatchType.Exact,
            Date = today.AddDays(-2),
            Impressions = 2400,
            Clicks = 190,
            Spend = 230.0,
            Conversions = 15
        });

        camp5_google_1.AdSets.Add(adset5_google_1);
        p5_google.Campaigns.Add(camp5_google_1);

        var p5_meta = new Platform
        {
            PlatformType = PlatformType.MetaAds,
            Status = PlatformStatus.NotConnected,
            Currency = Currency.SAR,
            CreatedAt = now.AddDays(-35)
        };

        client5.Platforms.Add(p5_snap);
        client5.Platforms.Add(p5_tiktok);
        client5.Platforms.Add(p5_google);
        client5.Platforms.Add(p5_meta);


        // =========================================================================
        // CLIENT 6: Apex Logistics & Freight (Lead Generation, KWD, Kuwait Freight)
        // Connected: Google Ads (KWD)
        // NotConnected: Meta Ads (KWD), TikTok Ads (KWD), Snapchat Ads (KWD)
        // =========================================================================
        var client6 = new Client
        {
            CompanyName = "Apex Logistics & Freight",
            Logo = "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=128&q=80",
            Website = "https://apexlogistics.kw",
            Email = "quote@apexlogistics.kw",
            Phone = "+965 2200 4811",
            Country = "Kuwait",
            UnitCurrency = Currency.KWD,
            Status = ClientStatus.Active,
            BusinessModel = BusinessModel.Lead,
            CreatedAt = now.AddDays(-25),
            Notes = "B2B commercial freight forwarding, customs clearance, and global air/ocean shipping.",
            ManagerId = managerId,
            Target = new ClientTarget
            {
                Currency = Currency.KWD,
                MonthlyBudget = 6000,
                TargetROAS = 5.2,
                TargetCPA = 18.0,
                TargetRevenue = 31200,
                TargetConversions = 330,
                TargetCTR = 4.1,
                TargetCPC = 0.85
            },
            Platforms = new List<Platform>()
        };

        var p6_google = new Platform
        {
            PlatformType = PlatformType.GoogleAds,
            Status = PlatformStatus.Connected,
            Currency = Currency.KWD,
            CreatedAt = now.AddDays(-25),
            Campaigns = new List<Campaign>()
        };

        var camp6_google_1 = new Campaign
        {
            Name = "Search - B2B Commercial Freight Kuwait",
            Objective = CampaignObjective.Leads,
            Currency = Currency.KWD,
            Status = CampaignStatus.Active,
            StartDate = now.AddDays(-14),
            CreatedAt = now.AddDays(-14),
            AdSets = new List<AdSet>()
        };

        var adset6_google_1 = new AdSet
        {
            Name = "Search - Corporate Importers & Exporters",
            AudienceType = "B2B Logistics & Supply Chain",
            AgeRange = "25-65",
            Gender = AdSetGender.All,
            Location = "Kuwait",
            Status = AdSetStatus.Active,
            StartDate = now.AddDays(-14),
            Ads = new List<Ad>(),
            SearchTerms = new List<SearchTerm>()
        };

        var ad6_google_1 = new Ad
        {
            Name = "Search Ad - Air & Sea Cargo Kuwait",
            Headline = "Fast Commercial Freight In Kuwait | Instant Quote",
            Description = "Door-to-door ocean & air forwarding with customs clearance. 24/7 dedicated cargo tracker.",
            CTA = "Request Quote",
            MediaType = MediaType.Image,
            MediaURL = "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&q=80",
            Status = AdStatus.Active,
            CreatedAt = now.AddDays(-14),
            DailyMetrics = GenerateDailyMetrics(today, 14, 
                baseImpressions: 4800, baseClicks: 280, baseConversions: 24, baseSpend: 85.0, baseRevenue: 510.0)
        };

        adset6_google_1.Ads.Add(ad6_google_1);
        adset6_google_1.SearchTerms.Add(new SearchTerm
        {
            Term = "sea freight forwarding kuwait to china rates",
            Keyword = "freight forwarding kuwait",
            MatchType = MatchType.Phrase,
            Date = today.AddDays(-1),
            Impressions = 1200,
            Clicks = 110,
            Spend = 35.0,
            Conversions = 14
        });

        camp6_google_1.AdSets.Add(adset6_google_1);
        p6_google.Campaigns.Add(camp6_google_1);

        var p6_meta = new Platform { PlatformType = PlatformType.MetaAds, Status = PlatformStatus.NotConnected, Currency = Currency.KWD, CreatedAt = now.AddDays(-25) };
        var p6_tiktok = new Platform { PlatformType = PlatformType.TikTokAds, Status = PlatformStatus.NotConnected, Currency = Currency.KWD, CreatedAt = now.AddDays(-25) };
        var p6_snap = new Platform { PlatformType = PlatformType.SnapchatAds, Status = PlatformStatus.NotConnected, Currency = Currency.KWD, CreatedAt = now.AddDays(-25) };

        client6.Platforms.Add(p6_google);
        client6.Platforms.Add(p6_meta);
        client6.Platforms.Add(p6_tiktok);
        client6.Platforms.Add(p6_snap);

        // Add all clients to DbContext
        await context.client.AddRangeAsync(client1, client2, client3, client4, client5, client6);
        await context.SaveChangesAsync();
    }

    /// <summary>
    /// Generates realistic consecutive daily performance metrics for an ad over the last N days.
    /// Introduces mild weekday/weekend variance to provide realistic chart fluctuations.
    /// </summary>
    private static List<AdDailyMetrics> GenerateDailyMetrics(
        DateOnly today, 
        int daysBack, 
        int baseImpressions, 
        int baseClicks, 
        int baseConversions, 
        double baseSpend, 
        double baseRevenue)
    {
        var list = new List<AdDailyMetrics>();
        var random = new Random(42); // deterministic seed for consistent, realistic numbers

        for (int i = daysBack; i >= 1; i--)
        {
            var date = today.AddDays(-i);
            
            // Random variance factor between 0.85 and 1.20
            double variance = 0.85 + (random.NextDouble() * 0.35);

            int impressions = Math.Max(100, (int)(baseImpressions * variance));
            int clicks = Math.Max(10, (int)(baseClicks * variance));
            int conversions = Math.Max(1, (int)(baseConversions * variance));
            double spend = Math.Round(baseSpend * variance, 2);
            double revenue = Math.Round(baseRevenue * variance, 2);

            list.Add(new AdDailyMetrics
            {
                Date = date,
                Impressions = impressions,
                Clicks = clicks,
                Conversions = conversions,
                Spend = spend,
                Revenue = revenue
            });
        }

        return list;
    }
}
