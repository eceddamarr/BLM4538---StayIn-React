using Microsoft.EntityFrameworkCore;
using StayIn.Api.Models;

namespace StayIn.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {

    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Listing> Listings => Set<Listing>();
    public DbSet<Reservation> Reservations { get; set; } = null!;
    public DbSet<Review> Reviews { get; set; } = null!;
    public DbSet<Payment> Payments { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Şuanlık sadece Users tablosu
        modelBuilder.Ignore<Listing>();
        modelBuilder.Ignore<Reservation>();
        modelBuilder.Ignore<Review>();
        modelBuilder.Ignore<Payment>();

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        // User Favorites kolonunu JSON olarak sakla
        modelBuilder.Entity<User>()
            .Property(u => u.Favorites)
            .HasConversion(
                v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                v => string.IsNullOrWhiteSpace(v)
                    ? new List<int>()
                    : System.Text.Json.JsonSerializer.Deserialize<List<int>>(v, (System.Text.Json.JsonSerializerOptions?)null) ?? new List<int>()
            );

        // Örnek kullanıcılar
        modelBuilder.Entity<User>().HasData(
            new User
            {
                Id = 1,
                FullName = "Ahmet Yılmaz",
                Email = "ahmet@example.com",
                PhoneNumber = "05321112233",
                PasswordHash = "$2a$11$5Z3Z5Z3Z5Z3Z5Z3Z5Z3Z5OqK5Z3Z5Z3Z5Z3Z5Z3Z5Z3Z5Z3Z5Z3",
                Role = "User",
                Favorites = new List<int>()
            },
            new User
            {
                Id = 2,
                FullName = "Ayşe Demir",
                Email = "ayse@stayin.dev",
                PhoneNumber = "05334445566",
                PasswordHash = "$2a$11$5Z3Z5Z3Z5Z3Z5Z3Z5Z3Z5OqK5Z3Z5Z3Z5Z3Z5Z3Z5Z3Z5Z3Z5Z3",
                Role = "User",
                Favorites = new List<int>()
            },
            new User
            {
                Id = 3,
                FullName = "Mehmet Kaya",
                Email = "mehmet@stayin.dev",
                PhoneNumber = "05347778899",
                PasswordHash = "$2a$11$5Z3Z5Z3Z5Z3Z5Z3Z5Z3Z5OqK5Z3Z5Z3Z5Z3Z5Z3Z5Z3Z5Z3Z5Z3",
                Role = "User",
                Favorites = new List<int>()
            },
            new User
            {
                Id = 4,
                FullName = "Zeynep Şahin",
                Email = "zeynep@stayin.dev",
                PhoneNumber = "05352223344",
                PasswordHash = "$2a$11$5Z3Z5Z3Z5Z3Z5Z3Z5Z3Z5OqK5Z3Z5Z3Z5Z3Z5Z3Z5Z3Z5Z3Z5Z3",
                Role = "User",
                Favorites = new List<int>()
            },
            new User
            {
                Id = 5,
                FullName = "Can Öztürk",
                Email = "can@stayin.dev",
                PhoneNumber = "05368889900",
                PasswordHash = "$2a$11$5Z3Z5Z3Z5Z3Z5Z3Z5Z3Z5OqK5Z3Z5Z3Z5Z3Z5Z3Z5Z3Z5Z3Z5Z3",
                Role = "User",
                Favorites = new List<int>()
            }
        );
    }
}
