using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using StayIn.Api.Data;
using StayIn.Api.Models;
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

// Migrations otomatik olarak çalıştır
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();
}

if (args.Contains("--seed-reservations"))
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await SeedSampleReservationsAsync(db);
    return;
}

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

static async Task SeedSampleReservationsAsync(AppDbContext db)
{
    var users = await db.Users
        .OrderBy(u => u.Id)
        .Select(u => u.Id)
        .ToListAsync();

    var listings = await db.Listings
        .Where(l => l.UserId != null)
        .OrderBy(l => l.Id)
        .Select(l => new { l.Id, HostId = l.UserId!.Value, l.Price, l.Guests })
        .Take(20)
        .ToListAsync();

    if (users.Count == 0 || listings.Count == 0)
    {
        Console.WriteLine("Seed icin kullanici veya ilan bulunamadi.");
        return;
    }

    var statuses = new[] { "Pending", "Approved", "Rejected" };
    var created = 0;

    foreach (var listing in listings)
    {
        if (created >= 10)
        {
            break;
        }

        var guestId = users.FirstOrDefault(userId => userId != listing.HostId);
        if (guestId == 0)
        {
            continue;
        }

        var checkInDate = DateTime.Today.AddDays(7 + created * 4);
        var checkOutDate = checkInDate.AddDays((created % 4) + 1);
        var guests = Math.Min(listing.Guests, (created % Math.Max(listing.Guests, 1)) + 1);

        var alreadyExists = await db.Reservations.AnyAsync(r =>
            r.ListingId == listing.Id &&
            r.GuestId == guestId &&
            r.CheckInDate == checkInDate &&
            r.CheckOutDate == checkOutDate);

        if (alreadyExists)
        {
            continue;
        }

        var status = statuses[created % statuses.Length];

        db.Reservations.Add(new Reservation
        {
            ListingId = listing.Id,
            GuestId = guestId,
            HostId = listing.HostId,
            CheckInDate = checkInDate,
            CheckOutDate = checkOutDate,
            Guests = guests,
            TotalPrice = listing.Price * (checkOutDate - checkInDate).Days,
            Status = status,
            CreatedAt = DateTime.UtcNow.AddMinutes(-created * 12),
            ResponsedAt = status == "Pending" ? null : DateTime.UtcNow.AddMinutes(-created * 8)
        });

        created++;
    }

    await db.SaveChangesAsync();
    Console.WriteLine($"{created} ornek rezervasyon eklendi.");
}
