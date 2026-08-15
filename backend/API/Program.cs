using Dashboard.Application.Interfaces;
using Dashboard.Application.Interfaces.Repositories;
using Dashboard.Application.Interfaces.Services;
using Dashboard.Application.Services;
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
#endregion
//-----------------------------------Services------------------------------------
#region Services
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IClientService, ClientService>();
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

//--------------------------------------------------------------------------------------

var app = builder.Build();

// Automated DB Seeder on Startup
/*
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        var userManager = services.GetRequiredService<UserManager<AppUser>>();
        context.Database.Migrate();

        var user = userManager.FindByEmailAsync("amr@example.com").GetAwaiter().GetResult();
        if (user == null)
        {
            user = new AppUser
            {
                UserName = "amr",
                Email = "amr@example.com",
                EmailConfirmed = true,
                FirstName = "Amr",
                LastName = "El-Sayed"
            };
            userManager.CreateAsync(user, "P@ssword123!").GetAwaiter().GetResult();
        }

        if (!context.client.Any() && user != null)
        {
            context.client.AddRange(
                new Client { CompanyName = "Acme Corporation", Website = "https://acmeglobal.com", Email = "contact@acmeglobal.com", Phone = "+1 (800) 555-0199", Country = "United States", Currency = Currency.USD, Status = ClientStatus.Active, CreatedAt = DateTime.UtcNow, ManagerId = user.Id },
                new Client { CompanyName = "Nexus Wear Ltd.", Website = "https://nexusfashion.com", Email = "marketing@nexusfashion.com", Phone = "+1 (800) 555-0244", Country = "United Kingdom", Currency = Currency.USD, Status = ClientStatus.Active, CreatedAt = DateTime.UtcNow, ManagerId = user.Id },
                new Client { CompanyName = "BioHealth Labs Inc.", Website = "https://biohealth.com", Email = "support@biohealth.com", Phone = "+1 (800) 555-0811", Country = "Canada", Currency = Currency.USD, Status = ClientStatus.Active, CreatedAt = DateTime.UtcNow, ManagerId = user.Id }
            );
            context.SaveChanges();
        }

        if (!context.platform.Any())
        {
            var firstClient = context.client.FirstOrDefault();
            if (firstClient != null)
            {
                context.platform.AddRange(
                    new Platform { PlatformType = PlatformType.FacebookAds, Status = PlatformStatus.Active, CreatedAt = DateTime.UtcNow, ClientId = firstClient.Id },
                    new Platform { PlatformType = PlatformType.GoogleAds, Status = PlatformStatus.Active, CreatedAt = DateTime.UtcNow, ClientId = firstClient.Id },
                    new Platform { PlatformType = PlatformType.TikTokAds, Status = PlatformStatus.Active, CreatedAt = DateTime.UtcNow, ClientId = firstClient.Id }
                );
                context.SaveChanges();
            }
        }

        if (!context.campaign.Any())
        {
            var firstPlatform = context.platform.FirstOrDefault();
            if (firstPlatform != null)
            {
                context.campaign.AddRange(
                    new Campaign { Name = "Summer Mega Sales 2026", Objective = CampaignObjective.Sales, Status = CampaignStatus.Active, Spend = 24500, Revenue = 98000, ROAS = 4.0f, StartDate = DateTime.UtcNow.AddMonths(-2), EndDate = DateTime.UtcNow.AddMonths(1), CreatedAt = DateTime.UtcNow, PlatformId = firstPlatform.Id },
                    new Campaign { Name = "Black Friday Early Bird Retargeting", Objective = CampaignObjective.Sales, Status = CampaignStatus.Active, Spend = 18200, Revenue = 63700, ROAS = 3.5f, StartDate = DateTime.UtcNow.AddMonths(-1), EndDate = DateTime.UtcNow.AddMonths(2), CreatedAt = DateTime.UtcNow, PlatformId = firstPlatform.Id },
                    new Campaign { Name = "Brand Awareness & Viral Push", Objective = CampaignObjective.Awareness, Status = CampaignStatus.Active, Spend = 12000, Revenue = 38400, ROAS = 3.2f, StartDate = DateTime.UtcNow, EndDate = DateTime.UtcNow.AddMonths(3), CreatedAt = DateTime.UtcNow, PlatformId = firstPlatform.Id }
                );
                context.SaveChanges();
            }
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"DB Seeding Log: {ex.Message}");
    }
}
*/

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

