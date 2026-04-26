using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using StayIn.Api.Data;
using StayIn.Api.Services;

var builder = WebApplication.CreateBuilder(args);

//  Controllers + Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

//  DbContext - MSSQL
builder.Services.AddDbContext<AppDbContext>(opts =>
    opts.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Email Service - Geliştirme için Mock kullan
builder.Services.AddScoped<IEmailService, MockEmailService>();

// CORS (Vue 5173, 5174 için izin)
// CORS - Tüm localhost portlarına + mobile emülatörlere izin ver
builder.Services.AddCors(options =>
{
    options.AddPolicy("DevCors", policy =>
    {
        policy.SetIsOriginAllowed(origin =>
        {
            if (string.IsNullOrWhiteSpace(origin)) return false;

            // localhost, 127.0.0.1, Android emülatör (10.0.2.2), ve kişisel IP
            if (origin.StartsWith("http://localhost:") ||
                origin.StartsWith("http://127.0.0.1:") ||
                origin.StartsWith("https://localhost:") ||
                origin.StartsWith("https://127.0.0.1:") ||
                origin.StartsWith("http://10.0.2.2:") ||  // Android emülatör
                origin.StartsWith("http://192.168."))  // Kişisel ağdaki IP'ler
            {
                return true;
            }

            return false;
        })
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials();
    });
});


// JWT ayarları
var jwtSection = builder.Configuration.GetSection("Jwt");
var key = Encoding.UTF8.GetBytes(jwtSection["Key"]!);

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSection["Issuer"],
            ValidAudience = jwtSection["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

// Middleware sırası
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("DevCors");
if (!app.Environment.IsDevelopment())
    app.UseHttpsRedirection();

// Statik dosyaları servis et (uploads klasörü için)
app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();


app.Run();
