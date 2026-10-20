using Dashboard.Application.Interfaces;
using Dashboard.Application.Interfaces.Repositories;
using Dashboard.Application.Interfaces.Services;
using Dashboard.Application.Services;
using Dashboard.Domain.Enums;
using Dashboard.Infrastructure;
using Dashboard.Infrastructure.Repositories;
using Dashboard.Infrastructure.Workers;
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
builder.Services.AddScoped<IAdDailyMetricsRepo, AdDailyMetricsRepo>();
builder.Services.AddScoped<ISearchTermRepo, SearchTermRepo>();
builder.Services.AddScoped<IExchangeRateRepo, ExchangeRateRepo>();
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
builder.Services.AddScoped<IAdDailyMetricsService, AdDailyMetricsService>();
builder.Services.AddScoped<ISearchTermService, SearchTermService>();
builder.Services.AddScoped<IAssociateProfileService, AssociateProfileService>();
builder.Services.AddScoped<IAssociateTeamService, AssociateTeamService>();
builder.Services.AddScoped<IAssignmentService, AssignmentService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IExchangeRateService, ExchangeRateService>();
builder.Services.AddHostedService<ExchangeRateSyncWorker>();
builder.Services.AddScoped<ILogoService, LogoService>();
builder.Services.AddHttpClient<IExchangeRateApiService, ExchangeRateApiService>(client =>
{
    var baseUrl = builder.Configuration["ExchangeRateApi:BaseUrl"] ?? "https://v6.exchangerate-api.com/v6/";
    if (!baseUrl.EndsWith('/')) baseUrl += "/";
    client.BaseAddress = new Uri(baseUrl);
    client.Timeout = TimeSpan.FromSeconds(30);
});
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

    // 5. Seed sample client-level data (platforms, campaigns, adsets, ads, metrics, search terms)
    //var dbContext = services.GetRequiredService<AppDbContext>();
    //await DataSeeder.SeedClientDataAsync(dbContext, admin.Id);
}
//---------------------------------------------------------------------------------

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

#region URLs hierarchy
/*
 Page                        frontend URL

Dashboard home	            /dashboard

Clients table	            /clients
Client overview	            /client/:clientId/overview
platform tab	            /client/:clientId/:platformId
Client insights	            /client/:clientId/insights
Client notes	            /client/:clientId/notes

Campaign	                /campaigns/:campaignId

ad set          	        /adsets/:adSetId

Ad modal	                /adsets/:adSetId
*/


/*
 Data needed	         API route
Clients             	GET /api/client
Client information	    GET /api/client/:clientId
Client’s platforms	    GET /api/client/:clientId/platforms

Platform’s campaigns	GET /api/platforms/:platformId/campaigns
Campaign information	GET /api/campaigns/:campaignId
Campaign’s ad sets	    GET /api/campaigns/:campaignId/ad-sets
Ad set information	    GET /api/ad-sets/:adSetId
Ad set’s ads	        GET /api/ad-sets/:adSetId/ads
Ad information	        GET /api/ads/:adId
 */
#endregion


