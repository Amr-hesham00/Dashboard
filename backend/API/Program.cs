using Dashboard.Application.Interfaces;
using Dashboard.Application.Interfaces.Repositories;
using Dashboard.Application.Interfaces.Services;
using Dashboard.Application.Services;
using Dashboard.Domain.Enums;
using Dashboard.Infrastructure;
using Dashboard.Infrastructure.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

//-----------------------------------Repositories------------------------------------
#region Repos
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

builder.Services.AddScoped<IClientRepo, ClientRepo>();
builder.Services.AddScoped<ICampaignRepo, CampaignRepo>();
builder.Services.AddScoped<IPlatformRepo, PlatformRepo>();
builder.Services.AddScoped<IAdSetRepo, AdSetRepo>();
builder.Services.AddScoped<IAdRepo, AdRepo>();
builder.Services.AddScoped<IAssociateProfileRepo, AssociateProfileRepo>();
builder.Services.AddScoped<IAssociateTeamRepo, AssociateTeamRepo>();
builder.Services.AddScoped<IAssignmentRepo, AssignmentRepo>();
builder.Services.AddScoped<IUserRepo, UserRepo>();
builder.Services.AddScoped<IRefreshTokenRepo, RefreshTokenRepo>();
builder.Services.AddScoped<IClientTargetRepo, ClientTargetRepo>();
#endregion
//-----------------------------------Services------------------------------------
#region Services
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IRefreshTokenService, RefreshTokenService>();
builder.Services.AddScoped<IClientService, ClientService>();
builder.Services.AddScoped<IClientTargetService, ClientTargetService>();
builder.Services.AddScoped<ICampaignService, CampaignService>();
builder.Services.AddScoped<IPlatformService, PlatformService>();
builder.Services.AddScoped<IAdSetService, AdSetService>();
builder.Services.AddScoped<IAdService, AdService>();
builder.Services.AddScoped<IAssociateProfileService, AssociateProfileService>();
builder.Services.AddScoped<IAssociateTeamService, AssociateTeamService>();
builder.Services.AddScoped<IAssignmentService, AssignmentService>();
builder.Services.AddScoped<IUserService, UserService>();
#endregion
//-----------------------------------DbContext, Identity------------------------------------
builder.Services.AddDbContext<AppDbContext>(
    options => options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))
);

builder.Services.AddIdentity<AppUser, IdentityRole>(
    options =>
    {
        options.Password.RequiredLength = 3;
        options.Password.RequireDigit = false;
        options.Password.RequireUppercase = false;
        options.Password.RequireNonAlphanumeric = false;
    }
).AddEntityFrameworkStores<AppDbContext>();

//-----------------------------------JWT Auth----------------------------------------------
var secretKey = builder.Configuration["Jwt:SecretKey"] ?? "SUPER_SECRET_KEY_DASHBOARD_APP_2026_JWT_TOKEN!";
var issuer = builder.Configuration["Jwt:Issuer"] ?? "DashboardAPI";
var audience = builder.Configuration["Jwt:Audience"] ?? "DashboardClient";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidIssuer = issuer,
        ValidateAudience = true,
        ValidAudience = audience,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

//-----------------------------------CORS------------------------------------
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:3001")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

//-----------------------------------Controllers & Swagger------------------------------------
builder.Services.AddControllers();

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Dashboard API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token in the text input below.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});


var app = builder.Build();
//--------------------------------------- Seeding Admin -----------------------------
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;

    var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
    var userManager = services.GetRequiredService<UserManager<AppUser>>();

    // 1. Create roles
    foreach (var role in Enum.GetNames<Roles>())
    {
        if (!await roleManager.RoleExistsAsync(role))
        {
            var result = await roleManager.CreateAsync(
                new IdentityRole(role));

            if (!result.Succeeded)
            {
                var errors = string.Join(
                    ", ",
                    result.Errors.Select(e => e.Description));

                throw new Exception(
                    $"Failed to create role '{role}': {errors}");
            }
        }
    }


    // 2. Get initial Admin credentials
    var adminEmail =
        builder.Configuration["Admin Account:Email"];

    var adminPassword =
        builder.Configuration["Admin Account:Password"];

    var fname =
        builder.Configuration["Admin Account:FName"];

    var lname =
        builder.Configuration["Admin Account:LName"];

    if (string.IsNullOrWhiteSpace(adminEmail) ||
        string.IsNullOrWhiteSpace(adminPassword))
    {
        throw new InvalidOperationException(
            "Initial Admin credentials are not configured.");
    }


    // 3. find or create Admin
    var admin = await userManager.FindByEmailAsync(adminEmail);

    if (admin == null)
    {
        admin = new AppUser
        {
            FirstName = fname!,
            LastName = lname!,
            UserName = adminEmail,
            Email = adminEmail,
            EmailConfirmed = true,
            Role = Roles.Admin
        };

        var result = await userManager.CreateAsync(
            admin,
            adminPassword);

        if (!result.Succeeded)
        {
            var errors = string.Join(
                ", ",
                result.Errors.Select(e => e.Description));

            throw new Exception(
                $"Failed to create initial Admin: {errors}");
        }
    }


    // 4. Make sure Admin has Admin role
    if (!await userManager.IsInRoleAsync(admin, Roles.Admin.ToString()))
    {
        var result = await userManager.AddToRoleAsync(
            admin,
            Roles.Admin.ToString());

        if (!result.Succeeded)
        {
            var errors = string.Join(
                ", ",
                result.Errors.Select(e => e.Description));

            throw new Exception(
                $"Failed to assign Admin role: {errors}");
        }
    }
}//---------------------------------------------------------------------------------

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.Run();



/*
 I need to build a private web dashboard for my performance marketing clients.

The product idea is a **client reporting and optimization dashboard** where I can add multiple clients, connect their ad platforms later, visualize performance, and generate actionable recommendations.

Initial clients:
1. Client 1 
2. Client 2
3. client 3
4. Client 4
The system should allow me to add any new client in the future.

Each client should have these tabs:
1. Overview
2. Meta Ads Performance
3. Google Ads Performance
4. Snapchat Ads Performance
5. TikTok Ads Performance
6. Insights & Recommendations

Main features needed:
* Add / edit / delete clients
* Add ad account details per client
* Date range selector
* Refresh all data button
* Refresh data per platform button
* KPI cards
* Charts and visualizations
* Campaign performance tables
* Search terms analysis for Google Ads ( the process of reviewing the exact words and phrases real users typed into Google that actually triggered your ads to show)
* Insights & recommendations based on actual performance
* Share report button for clients
* Client-safe report link
* Internal notes that only I can see
* Export report to PDF if possible

Important:
I do not want to start with all API integrations at once.

I want the project built in phases.
Phase 1: UI MVP with mock data only
Build the full dashboard experience using fake/sample data first, so I can review the structure, design, charts, and reporting flow before connecting real ad accounts.

Phase 1 should include:
* Login page if simple
* Clients list page
* Add client button
* Client details page
* The 6 tabs mentioned above
* Overview dashboard with KPI cards
* Spend vs revenue chart
* ROAS by platform chart
* Platform comparison
* Campaign performance table
* Google Search Terms table
* Insights & Recommendations page
* Share report button as UI only
* Refresh button as UI only


Phase 2: Database
Add real database structure for clients, platform accounts, dashboard settings, stored performance data, recommendations, and shared reports.

Phase 3: Google Ads API integration
Start with Google Ads first, including campaign performance and search terms.

Phase 4: Meta Ads API integration

Phase 5: Snapchat and TikTok integrations

Phase 6: Shareable client reports and PDF export

Recommendation logic:
At first, recommendations can be rule-based, not AI-based.

Examples:

* Scale campaigns with ROAS above target and stable conversions
* Reduce campaigns with high spend and weak ROAS
* Flag search terms with high spend and zero conversions
* Suggest exact match keywords from winning search terms
* Suggest negative keywords from wasted search terms
* Flag tracking issues when spend exists but conversion value is missing
* Flag creative fatigue when frequency is high and CTR is dropping

Each client should have target settings, such as:

* Target ROAS
* Target CPA
* Monthly budget
* Currency
* Business model: ecommerce / lead generation
* Main conversion event

I need the dashboard to be very visual and decision-friendly, not just tables.

Design direction:
* Clean SaaS dashboard style
* Executive-friendly
* Easy to scan
* KPI cards at the top
* Clear charts
* Conditional colors:

  * Green = strong performance
  * Yellow = needs attention
  * Red = weak / wasted spend

For the client share report:
The client should only see the clean report view, not my internal notes or sensitive optimization comments.

Please send me:

1. Estimated timeline for Phase 1 only
2. Cost estimate
3. Recommended tech stack
4. What you need from me to start
5. Whether you can later handle Google Ads, Meta Ads, Snapchat, and TikTok API integrations

Important note:
I want to start with a working MVP first. Please do not over-engineer the first version.*/

