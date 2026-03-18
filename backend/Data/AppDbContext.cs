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

        // Şuanlik sadece Listings
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

        // Örnek ilanlar
        modelBuilder.Entity<Listing>().HasData(
            new Listing
            {
                Id = 1,
                UserId = 1,
                PlaceType = "Daire",
                AccommodationType = "Bütün mekan",
                Guests = 4,
                Bedrooms = 2,
                Beds = 2,
                Bathrooms = 1,
                Title = "Deniz Manzaralı Lüks Daire",
                Description = "Çeşme'nin en güzel sahilinde, deniz manzaralı modern daire. Havuz, jakuzi ve özel plaj erişimi mevcut.",
                Price = 2500,
                AddressCountry = "Türkiye",
                AddressCity = "İzmir",
                AddressDistrict = "Çeşme",
                AddressStreet = "Alaçatı Mahallesi, Sahil Caddesi No:45",
                AddressBuilding = "A Blok Kat:3",
                AddressPostalCode = "35930",
                AddressRegion = "Ege",
                Amenities = new List<string> { "Wifi", "Klima", "Havuz", "Jakuzi", "Deniz Manzarası", "Özel Plaj" },
                PhotoUrls = new List<string>
                {
                    "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800",
                    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800"
                },
                Latitude = 38.3228,
                Longitude = 26.3025,
                CreatedAt = new DateTime(2024, 11, 1, 10, 0, 0, DateTimeKind.Utc)
            },
            new Listing
            {
                Id = 2,
                UserId = 1,
                PlaceType = "Villa",
                AccommodationType = "Bütün mekan",
                Guests = 8,
                Bedrooms = 4,
                Beds = 5,
                Bathrooms = 3,
                Title = "Modern Villa Havuz ve Bahçe",
                Description = "Kalkan'da özel havuzlu, geniş bahçeli lüks villa. Muhteşem deniz manzarası ve sessiz konum.",
                Price = 5000,
                AddressCountry = "Türkiye",
                AddressCity = "Antalya",
                AddressDistrict = "Kalkan",
                AddressStreet = "Kalamar Mahallesi, Yalı Sokak No:12",
                AddressBuilding = "Villa",
                AddressPostalCode = "07960",
                AddressRegion = "Akdeniz",
                Amenities = new List<string> { "Wifi", "Klima", "Havuz", "Bahçe", "Mangal", "Deniz Manzarası", "Özel Otopark" },
                PhotoUrls = new List<string>
                {
                    "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
                    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800"
                },
                Latitude = 36.2656,
                Longitude = 29.4089,
                CreatedAt = new DateTime(2024, 11, 3, 14, 30, 0, DateTimeKind.Utc)
            },
            new Listing
            {
                Id = 3,
                UserId = 2,
                PlaceType = "Ev",
                AccommodationType = "Bütün mekan",
                Guests = 6,
                Bedrooms = 3,
                Beds = 3,
                Bathrooms = 2,
                Title = "Plaja Sıfır Butik Otel",
                Description = "Bodrum'un kalbinde, plaja yürüme mesafesinde modern ve konforlu konaklama. Kahvaltı dahil.",
                Price = 3200,
                AddressCountry = "Türkiye",
                AddressCity = "Muğla",
                AddressDistrict = "Bodrum",
                AddressStreet = "Gümbet Mahallesi, Plaj Yolu No:8",
                AddressBuilding = "Butik Otel",
                AddressPostalCode = "48400",
                AddressRegion = "Ege",
                Amenities = new List<string> { "Wifi", "Klima", "TV", "Kahvaltı", "Plaja Yakın", "Restoran" },
                PhotoUrls = new List<string>
                {
                    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
                    "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800"
                },
                Latitude = 37.0344,
                Longitude = 27.4305,
                CreatedAt = new DateTime(2024, 11, 4, 9, 15, 0, DateTimeKind.Utc)
            },
            new Listing
            {
                Id = 4,
                UserId = 2,
                PlaceType = "Kulübe",
                AccommodationType = "Bütün mekan",
                Guests = 3,
                Bedrooms = 1,
                Beds = 2,
                Bathrooms = 1,
                Title = "Doğa İçinde Bungalov",
                Description = "Abant Gölü manzaralı, doğa ile iç içe huzurlu bungalov. Şömine, veranda ve orman manzarası.",
                Price = 1800,
                AddressCountry = "Türkiye",
                AddressCity = "Bolu",
                AddressDistrict = "Abant",
                AddressStreet = "Göl Mahallesi, Doğa Yolu No:23",
                AddressBuilding = "Bungalov 5",
                AddressPostalCode = "14100",
                AddressRegion = "Karadeniz",
                Amenities = new List<string> { "Wifi", "Şömine", "Veranda", "Göl Manzarası", "Doğa", "Mangal" },
                PhotoUrls = new List<string>
                {
                    "https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800",
                    "https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=800"
                },
                Latitude = 40.6167,
                Longitude = 31.2667,
                CreatedAt = new DateTime(2024, 11, 5, 16, 45, 0, DateTimeKind.Utc)
            },
            new Listing
            {
                Id = 5,
                UserId = 2,
                PlaceType = "Daire",
                AccommodationType = "Bütün mekan",
                Guests = 2,
                Bedrooms = 1,
                Beds = 1,
                Bathrooms = 1,
                Title = "Alaçatı Merkezde Taş Ev",
                Description = "Alaçatı çarşısına 5 dakika yürüme mesafesinde otantik taş ev. Şirin bahçe ve modern iç dekorasyon.",
                Price = 2200,
                AddressCountry = "Türkiye",
                AddressCity = "İzmir",
                AddressDistrict = "Alaçatı",
                AddressStreet = "Kemalpaşa Mahallesi, Taş Sokak No:7",
                AddressBuilding = null,
                AddressPostalCode = "35937",
                AddressRegion = "Ege",
                Amenities = new List<string> { "Wifi", "Klima", "Bahçe", "Mutfak", "Merkezi Konum" },
                PhotoUrls = new List<string>
                {
                    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"
                },
                Latitude = 38.2666,
                Longitude = 26.3782,
                CreatedAt = new DateTime(2024, 11, 2, 11, 20, 0, DateTimeKind.Utc)
            },
            new Listing
            {
                Id = 6,
                UserId = 3,
                PlaceType = "Otel Odası",
                AccommodationType = "Özel oda",
                Guests = 2,
                Bedrooms = 1,
                Beds = 1,
                Bathrooms = 1,
                Title = "Boğaz Manzaralı Lüks Suit",
                Description = "İstanbul Ortaköy'de Boğaz manzaralı suit oda. Spa, restoran ve özel hizmet.",
                Price = 3500,
                AddressCountry = "Türkiye",
                AddressCity = "İstanbul",
                AddressDistrict = "Beşiktaş",
                AddressStreet = "Ortaköy Mahallesi, Mecidiye Köprüsü Sokak No:15",
                AddressBuilding = "A Blok Kat:12",
                AddressPostalCode = "34347",
                AddressRegion = "Marmara",
                Amenities = new List<string> { "Wifi", "Spa", "Restoran", "Oda Servisi", "Boğaz Manzarası", "Jakuzi" },
                PhotoUrls = new List<string>
                {
                    "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800"
                },
                Latitude = 41.0478,
                Longitude = 29.0267,
                CreatedAt = new DateTime(2024, 11, 1, 8, 30, 0, DateTimeKind.Utc)
            },
            new Listing
            {
                Id = 7,
                UserId = 3,
                PlaceType = "Villa",
                AccommodationType = "Bütün mekan",
                Guests = 10,
                Bedrooms = 5,
                Beds = 6,
                Bathrooms = 4,
                Title = "Kaş'ta Panoramik Deniz Manzaralı Villa",
                Description = "Kaş merkezine 10 dakika, sonsuzluk havuzlu, 5 yatak odalı lüks villa. Muhteşem gün batımı manzarası.",
                Price = 6500,
                AddressCountry = "Türkiye",
                AddressCity = "Antalya",
                AddressDistrict = "Kaş",
                AddressStreet = "Çukurbağ Yarımadası, Manzara Yolu No:34",
                AddressBuilding = "Villa Sunset",
                AddressPostalCode = "07580",
                AddressRegion = "Akdeniz",
                Amenities = new List<string> { "Wifi", "Sonsuzluk Havuzu", "Klima", "Bahçe", "Mangal", "Deniz Manzarası", "Otopark" },
                PhotoUrls = new List<string>
                {
                    "https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?w=800"
                },
                Latitude = 36.2014,
                Longitude = 29.6410,
                CreatedAt = new DateTime(2024, 11, 3, 13, 0, 0, DateTimeKind.Utc)
            },
            new Listing
            {
                Id = 8,
                UserId = 3,
                PlaceType = "Daire",
                AccommodationType = "Bütün mekan",
                Guests = 3,
                Bedrooms = 1,
                Beds = 2,
                Bathrooms = 1,
                Title = "Antalya Konyaaltı Plaj Dairesi",
                Description = "Konyaaltı sahilinde, plaja 50m mesafede modern daire. Balkondan deniz manzarası.",
                Price = 1900,
                AddressCountry = "Türkiye",
                AddressCity = "Antalya",
                AddressDistrict = "Konyaaltı",
                AddressStreet = "Liman Mahallesi, Sahil Bulvarı No:88",
                AddressBuilding = "B Blok Kat:5",
                AddressPostalCode = "07050",
                AddressRegion = "Akdeniz",
                Amenities = new List<string> { "Wifi", "Klima", "Balkon", "Plaja Yakın", "Deniz Manzarası" },
                PhotoUrls = new List<string>
                {
                    "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800"
                },
                Latitude = 36.8597,
                Longitude = 30.6256,
                CreatedAt = new DateTime(2024, 11, 4, 10, 15, 0, DateTimeKind.Utc)
            },
            new Listing
            {
                Id = 9,
                UserId = 4,
                PlaceType = "Ev",
                AccommodationType = "Bütün mekan",
                Guests = 5,
                Bedrooms = 2,
                Beds = 3,
                Bathrooms = 2,
                Title = "Fethiye Ölüdeniz'de Bahçeli Ev",
                Description = "Ölüdeniz lagününe 15 dakika yürüme mesafesinde, geniş bahçeli müstakil ev.",
                Price = 2800,
                AddressCountry = "Türkiye",
                AddressCity = "Muğla",
                AddressDistrict = "Fethiye",
                AddressStreet = "Ovacık Mahallesi, Çam Sokak No:19",
                AddressBuilding = null,
                AddressPostalCode = "48300",
                AddressRegion = "Ege",
                Amenities = new List<string> { "Wifi", "Klima", "Bahçe", "Mangal", "Otopark", "Doğa" },
                PhotoUrls = new List<string>
                {
                    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800"
                },
                Latitude = 36.5500,
                Longitude = 29.1167,
                CreatedAt = new DateTime(2024, 11, 2, 15, 45, 0, DateTimeKind.Utc)
            },
            new Listing
            {
                Id = 10,
                UserId = 4,
                PlaceType = "Daire",
                AccommodationType = "Bütün mekan",
                Guests = 4,
                Bedrooms = 2,
                Beds = 2,
                Bathrooms = 1,
                Title = "Konak Meydanı Manzaralı Loft",
                Description = "İzmir Konak'ta tarihi binada restore edilmiş loft daire. Şehir manzarası ve modern tasarım.",
                Price = 1700,
                AddressCountry = "Türkiye",
                AddressCity = "İzmir",
                AddressDistrict = "Konak",
                AddressStreet = "Kemeraltı Mahallesi, Anafartalar Caddesi No:56",
                AddressBuilding = "Kat:4",
                AddressPostalCode = "35360",
                AddressRegion = "Ege",
                Amenities = new List<string> { "Wifi", "Klima", "Şehir Manzarası", "Merkezi Konum", "Tarihi Bina" },
                PhotoUrls = new List<string>
                {
                    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"
                },
                Latitude = 38.4189,
                Longitude = 27.1287,
                CreatedAt = new DateTime(2024, 11, 5, 9, 0, 0, DateTimeKind.Utc)
            },
            new Listing
            {
                Id = 11,
                UserId = 4,
                PlaceType = "Villa",
                AccommodationType = "Bütün mekan",
                Guests = 6,
                Bedrooms = 3,
                Beds = 4,
                Bathrooms = 2,
                Title = "Marmaris Havuzlu Triplex Villa",
                Description = "Marmaris merkezine yakın, özel havuzlu triplex villa. Deniz manzarası ve geniş teras.",
                Price = 4200,
                AddressCountry = "Türkiye",
                AddressCity = "Muğla",
                AddressDistrict = "Marmaris",
                AddressStreet = "İçmeler Mahallesi, Deniz Yolu No:42",
                AddressBuilding = "Villa Mavi",
                AddressPostalCode = "48700",
                AddressRegion = "Ege",
                Amenities = new List<string> { "Wifi", "Havuz", "Klima", "Teras", "Deniz Manzarası", "BBQ" },
                PhotoUrls = new List<string>
                {
                    "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800"
                },
                Latitude = 36.8513,
                Longitude = 28.2744,
                CreatedAt = new DateTime(2024, 11, 3, 12, 30, 0, DateTimeKind.Utc)
            },
            new Listing
            {
                Id = 12,
                UserId = 5,
                PlaceType = "Kulübe",
                AccommodationType = "Bütün mekan",
                Guests = 2,
                Bedrooms = 1,
                Beds = 1,
                Bathrooms = 1,
                Title = "Sapanca Göl Kenarı Bungalov",
                Description = "Sapanca Gölü kenarında romantik bungalov. Şömine, jakuzi ve göl manzarası.",
                Price = 2100,
                AddressCountry = "Türkiye",
                AddressCity = "Sakarya",
                AddressDistrict = "Sapanca",
                AddressStreet = "Göl Mahallesi, Kıyı Yolu No:67",
                AddressBuilding = "Bungalov 12",
                AddressPostalCode = "54600",
                AddressRegion = "Marmara",
                Amenities = new List<string> { "Wifi", "Şömine", "Jakuzi", "Göl Manzarası", "Doğa", "Özel Plaj" },
                PhotoUrls = new List<string>
                {
                    "https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800"
                },
                Latitude = 40.6894,
                Longitude = 30.2678,
                CreatedAt = new DateTime(2024, 11, 4, 14, 0, 0, DateTimeKind.Utc)
            },
            new Listing
            {
                Id = 13,
                UserId = 5,
                PlaceType = "Daire",
                AccommodationType = "Bütün mekan",
                Guests = 4,
                Bedrooms = 2,
                Beds = 2,
                Bathrooms = 1,
                Title = "Kadıköy'de Nostaljik Daire",
                Description = "Moda'da nostaljik apartman dairesinde konforlu konaklama. Yürüyüş mesafesinde cafe ve restoranlar.",
                Price = 1600,
                AddressCountry = "Türkiye",
                AddressCity = "İstanbul",
                AddressDistrict = "Kadıköy",
                AddressStreet = "Moda Caddesi No:134",
                AddressBuilding = "Kat:3",
                AddressPostalCode = "34710",
                AddressRegion = "Marmara",
                Amenities = new List<string> { "Wifi", "Klima", "Merkezi Konum", "Mutfak", "Balkon" },
                PhotoUrls = new List<string>
                {
                    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"
                },
                Latitude = 40.9872,
                Longitude = 29.0264,
                CreatedAt = new DateTime(2024, 11, 1, 16, 20, 0, DateTimeKind.Utc)
            },
            new Listing
            {
                Id = 14,
                UserId = 5,
                PlaceType = "Ev",
                AccommodationType = "Bütün mekan",
                Guests = 7,
                Bedrooms = 3,
                Beds = 4,
                Bathrooms = 2,
                Title = "Side Antik Kent Yakını Villa",
                Description = "Side antik kente yürüme mesafesinde, havuzlu müstakil ev. Aile ve arkadaş grupları için ideal.",
                Price = 3800,
                AddressCountry = "Türkiye",
                AddressCity = "Antalya",
                AddressDistrict = "Side",
                AddressStreet = "Selimiye Mahallesi, Antik Yol No:28",
                AddressBuilding = null,
                AddressPostalCode = "07330",
                AddressRegion = "Akdeniz",
                Amenities = new List<string> { "Wifi", "Havuz", "Klima", "Bahçe", "Otopark", "Merkezi Konum" },
                PhotoUrls = new List<string>
                {
                    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800"
                },
                Latitude = 36.7673,
                Longitude = 31.3902,
                CreatedAt = new DateTime(2024, 11, 2, 10, 45, 0, DateTimeKind.Utc)
            },
            new Listing
            {
                Id = 15,
                UserId = 1,
                PlaceType = "Daire",
                AccommodationType = "Bütün mekan",
                Guests = 3,
                Bedrooms = 1,
                Beds = 2,
                Bathrooms = 1,
                Title = "Beyoğlu'nda Sanatçı Loft'u",
                Description = "İstiklal Caddesi'ne 5 dakika, sanatçı mahallesinde bohem loft daire.",
                Price = 1500,
                AddressCountry = "Türkiye",
                AddressCity = "İstanbul",
                AddressDistrict = "Beyoğlu",
                AddressStreet = "Cihangir Mahallesi, Firuzağa Sokak No:23",
                AddressBuilding = "Kat:5",
                AddressPostalCode = "34433",
                AddressRegion = "Marmara",
                Amenities = new List<string> { "Wifi", "Merkezi Konum", "Şehir Manzarası", "Sanat Galerisi Yakın" },
                PhotoUrls = new List<string>
                {
                    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800"
                },
                Latitude = 41.0317,
                Longitude = 28.9783,
                CreatedAt = new DateTime(2024, 11, 5, 11, 30, 0, DateTimeKind.Utc)
            },
            new Listing
            {
                Id = 16,
                UserId = 1,
                PlaceType = "Villa",
                AccommodationType = "Bütün mekan",
                Guests = 12,
                Bedrooms = 6,
                Beds = 8,
                Bathrooms = 5,
                Title = "Gökova Körfezi Lüks Villa",
                Description = "Gökova Körfezi'nde özel iskele ve tekne bağlama imkanı olan mega villa. Sonsuzluk havuzu ve özel plaj.",
                Price = 8500,
                AddressCountry = "Türkiye",
                AddressCity = "Muğla",
                AddressDistrict = "Gökova",
                AddressStreet = "Akyaka Mahallesi, Körfez Yolu No:5",
                AddressBuilding = "Villa Exclusive",
                AddressPostalCode = "48650",
                AddressRegion = "Ege",
                Amenities = new List<string> { "Wifi", "Sonsuzluk Havuzu", "Özel İskele", "Özel Plaj", "Jakuzi", "Sauna", "Bahçe" },
                PhotoUrls = new List<string>
                {
                    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800"
                },
                Latitude = 37.0453,
                Longitude = 28.3211,
                CreatedAt = new DateTime(2024, 11, 1, 9, 0, 0, DateTimeKind.Utc)
            },
            new Listing
            {
                Id = 17,
                UserId = 2,
                PlaceType = "Otel Odası",
                AccommodationType = "Özel oda",
                Guests = 2,
                Bedrooms = 1,
                Beds = 1,
                Bathrooms = 1,
                Title = "Kapadokya Mağara Otel",
                Description = "Göreme'de otantik mağara otel odası. Balon turu dahil, terasta kahvaltı servisi.",
                Price = 2700,
                AddressCountry = "Türkiye",
                AddressCity = "Nevşehir",
                AddressDistrict = "Göreme",
                AddressStreet = "Müze Caddesi No:12",
                AddressBuilding = "Mağara Kat:2",
                AddressPostalCode = "50180",
                AddressRegion = "İç Anadolu",
                Amenities = new List<string> { "Wifi", "Kahvaltı Dahil", "Balon Turu", "Tarihi Mekan", "Teras" },
                PhotoUrls = new List<string>
                {
                    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800"
                },
                Latitude = 38.6431,
                Longitude = 34.8281,
                CreatedAt = new DateTime(2024, 11, 3, 7, 30, 0, DateTimeKind.Utc)
            },
            new Listing
            {
                Id = 18,
                UserId = 2,
                PlaceType = "Daire",
                AccommodationType = "Bütün mekan",
                Guests = 5,
                Bedrooms = 2,
                Beds = 3,
                Bathrooms = 1,
                Title = "Alsancak Marina Manzaralı Daire",
                Description = "İzmir Alsancak'ta marina ve deniz manzaralı modern daire. Gece hayatına yürüme mesafesinde.",
                Price = 2000,
                AddressCountry = "Türkiye",
                AddressCity = "İzmir",
                AddressDistrict = "Alsancak",
                AddressStreet = "Kıbrıs Şehitleri Caddesi No:145",
                AddressBuilding = "C Blok Kat:8",
                AddressPostalCode = "35220",
                AddressRegion = "Ege",
                Amenities = new List<string> { "Wifi", "Klima", "Marina Manzarası", "Balkon", "Merkezi Konum" },
                PhotoUrls = new List<string>
                {
                    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"
                },
                Latitude = 38.4382,
                Longitude = 27.1463,
                CreatedAt = new DateTime(2024, 11, 4, 13, 15, 0, DateTimeKind.Utc)
            },
            new Listing
            {
                Id = 19,
                UserId = 3,
                PlaceType = "Kulübe",
                AccommodationType = "Bütün mekan",
                Guests = 4,
                Bedrooms = 2,
                Beds = 2,
                Bathrooms = 1,
                Title = "Uludağ Kayak Merkezi Şale",
                Description = "Uludağ'da piste yakın modern şale. Şömine, jakuzi ve dağ manzarası.",
                Price = 3200,
                AddressCountry = "Türkiye",
                AddressCity = "Bursa",
                AddressDistrict = "Uludağ",
                AddressStreet = "Oteller Bölgesi No:78",
                AddressBuilding = "Şale 15",
                AddressPostalCode = "16370",
                AddressRegion = "Marmara",
                Amenities = new List<string> { "Wifi", "Şömine", "Jakuzi", "Kayak Pisti Yakın", "Dağ Manzarası" },
                PhotoUrls = new List<string>
                {
                    "https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=800"
                },
                Latitude = 40.1025,
                Longitude = 29.0878,
                CreatedAt = new DateTime(2024, 11, 2, 8, 0, 0, DateTimeKind.Utc)
            },
            new Listing
            {
                Id = 20,
                UserId = 3,
                PlaceType = "Ev",
                AccommodationType = "Bütün mekan",
                Guests = 6,
                Bedrooms = 3,
                Beds = 3,
                Bathrooms = 2,
                Title = "Datça Eski Datça Taş Ev",
                Description = "Eski Datça'da restore edilmiş otantik taş ev. Bahçe, veranda ve sessiz konum.",
                Price = 2900,
                AddressCountry = "Türkiye",
                AddressCity = "Muğla",
                AddressDistrict = "Datça",
                AddressStreet = "Eski Datça Mahallesi, Badem Sokak No:34",
                AddressBuilding = null,
                AddressPostalCode = "48900",
                AddressRegion = "Ege",
                Amenities = new List<string> { "Wifi", "Bahçe", "Veranda", "Tarihi Ev", "Doğa", "Huzurlu" },
                PhotoUrls = new List<string>
                {
                    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"
                },
                Latitude = 36.7264,
                Longitude = 27.6881,
                CreatedAt = new DateTime(2024, 11, 5, 10, 0, 0, DateTimeKind.Utc)
            },
            new Listing
            {
                Id = 21,
                UserId = 4,
                PlaceType = "Villa",
                AccommodationType = "Bütün mekan",
                Guests = 8,
                Bedrooms = 4,
                Beds = 5,
                Bathrooms = 3,
                Title = "Belek Golf Sahalı Villa",
                Description = "Belek'te golf sahası manzaralı, özel havuzlu lüks villa. Spa ve fitness merkezi yakın.",
                Price = 5200,
                AddressCountry = "Türkiye",
                AddressCity = "Antalya",
                AddressDistrict = "Belek",
                AddressStreet = "Golf Mahallesi, Yeşil Alan Caddesi No:56",
                AddressBuilding = "Villa Green",
                AddressPostalCode = "07506",
                AddressRegion = "Akdeniz",
                Amenities = new List<string> { "Wifi", "Havuz", "Golf Sahası", "Spa Yakın", "Klima", "Bahçe" },
                PhotoUrls = new List<string>
                {
                    "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800"
                },
                Latitude = 36.8625,
                Longitude = 31.0553,
                CreatedAt = new DateTime(2024, 11, 1, 12, 0, 0, DateTimeKind.Utc)
            },
            new Listing
            {
                Id = 22,
                UserId = 4,
                PlaceType = "Daire",
                AccommodationType = "Bütün mekan",
                Guests = 3,
                Bedrooms = 1,
                Beds = 2,
                Bathrooms = 1,
                Title = "Bodrum Gümbet Plaj Dairesi",
                Description = "Gümbet plajına 2 dakika, site içinde havuzlu modern daire.",
                Price = 1800,
                AddressCountry = "Türkiye",
                AddressCity = "Muğla",
                AddressDistrict = "Bodrum",
                AddressStreet = "Gümbet Mahallesi, Plaj Yolu No:89",
                AddressBuilding = "Site A Blok Kat:4",
                AddressPostalCode = "48400",
                AddressRegion = "Ege",
                Amenities = new List<string> { "Wifi", "Klima", "Havuz", "Plaja Yakın", "Güvenlik" },
                PhotoUrls = new List<string>
                {
                    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"
                },
                Latitude = 37.0303,
                Longitude = 27.4078,
                CreatedAt = new DateTime(2024, 11, 3, 15, 30, 0, DateTimeKind.Utc)
            },
            new Listing
            {
                Id = 23,
                UserId = 5,
                PlaceType = "Ev",
                AccommodationType = "Bütün mekan",
                Guests = 5,
                Bedrooms = 2,
                Beds = 3,
                Bathrooms = 2,
                Title = "Çanakkale Assos Köy Evi",
                Description = "Assos antik limanına 10 dakika, köy evinde huzurlu tatil. Bahçe ve deniz manzarası.",
                Price = 2300,
                AddressCountry = "Türkiye",
                AddressCity = "Çanakkale",
                AddressDistrict = "Assos",
                AddressStreet = "Behramkale Köyü, Liman Yolu No:12",
                AddressBuilding = null,
                AddressPostalCode = "17860",
                AddressRegion = "Marmara",
                Amenities = new List<string> { "Wifi", "Bahçe", "Deniz Manzarası", "Doğa", "Tarihi Alan Yakın" },
                PhotoUrls = new List<string>
                {
                    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800"
                },
                Latitude = 39.4919,
                Longitude = 26.3389,
                CreatedAt = new DateTime(2024, 11, 4, 11, 45, 0, DateTimeKind.Utc)
            },
            new Listing
            {
                Id = 24,
                UserId = 5,
                PlaceType = "Otel Odası",
                AccommodationType = "Özel oda",
                Guests = 2,
                Bedrooms = 1,
                Beds = 1,
                Bathrooms = 1,
                Title = "Şirince Butik Otel Odası",
                Description = "Şirince köyünde tarihi butik otel odası. Şarap tadımı ve kahvaltı dahil.",
                Price = 1400,
                AddressCountry = "Türkiye",
                AddressCity = "İzmir",
                AddressDistrict = "Şirince",
                AddressStreet = "Köy Merkezi No:45",
                AddressBuilding = "Butik Otel Kat:2",
                AddressPostalCode = "35920",
                AddressRegion = "Ege",
                Amenities = new List<string> { "Wifi", "Kahvaltı Dahil", "Şarap Tadımı", "Tarihi Mekan", "Doğa" },
                PhotoUrls = new List<string>
                {
                    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"
                },
                Latitude = 37.9456,
                Longitude = 27.4489,
                CreatedAt = new DateTime(2024, 11, 5, 8, 15, 0, DateTimeKind.Utc)
            },
            new Listing
            {
                Id = 25,
                UserId = 1,
                PlaceType = "Villa",
                AccommodationType = "Bütün mekan",
                Guests = 10,
                Bedrooms = 5,
                Beds = 6,
                Bathrooms = 4,
                Title = "Bitez Mandalinakoy Villa",
                Description = "Bitez'de mandalina bahçeleri arasında, denize yakın özel havuzlu villa.",
                Price = 4800,
                AddressCountry = "Türkiye",
                AddressCity = "Muğla",
                AddressDistrict = "Bodrum",
                AddressStreet = "Bitez Mahallesi, Mandalina Sokak No:67",
                AddressBuilding = "Villa Orange",
                AddressPostalCode = "48470",
                AddressRegion = "Ege",
                Amenities = new List<string> { "Wifi", "Havuz", "Klima", "Bahçe", "Denize Yakın", "Mangal" },
                PhotoUrls = new List<string>
                {
                    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800"
                },
                Latitude = 37.0167,
                Longitude = 27.3833,
                CreatedAt = new DateTime(2024, 11, 2, 14, 20, 0, DateTimeKind.Utc)
            },
            new Listing
            {
                Id = 26,
                UserId = 1,
                PlaceType = "Daire",
                AccommodationType = "Bütün mekan",
                Guests = 4,
                Bedrooms = 2,
                Beds = 2,
                Bathrooms = 1,
                Title = "Alanya Kleopatra Plajı Dairesi",
                Description = "Kleopatra plajına 100m, deniz manzaralı balkonlu modern daire.",
                Price = 1650,
                AddressCountry = "Türkiye",
                AddressCity = "Antalya",
                AddressDistrict = "Alanya",
                AddressStreet = "Saray Mahallesi, Kleopatra Caddesi No:234",
                AddressBuilding = "B Blok Kat:6",
                AddressPostalCode = "07400",
                AddressRegion = "Akdeniz",
                Amenities = new List<string> { "Wifi", "Klima", "Balkon", "Plaja Yakın", "Deniz Manzarası" },
                PhotoUrls = new List<string>
                {
                    "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800"
                },
                Latitude = 36.5433,
                Longitude = 31.9856,
                CreatedAt = new DateTime(2024, 11, 3, 16, 0, 0, DateTimeKind.Utc)
            },
            new Listing
            {
                Id = 27,
                UserId = 2,
                PlaceType = "Kulübe",
                AccommodationType = "Bütün mekan",
                Guests = 2,
                Bedrooms = 1,
                Beds = 1,
                Bathrooms = 1,
                Title = "Ayder Yaylaı Dağ Evi",
                Description = "Ayder'de dere kenarında ahşap dağ evi. Şömine, doğa ve huzur.",
                Price = 1900,
                AddressCountry = "Türkiye",
                AddressCity = "Rize",
                AddressDistrict = "Ayder",
                AddressStreet = "Yayla Mahallesi, Dere Yolu No:23",
                AddressBuilding = "Ev 8",
                AddressPostalCode = "53750",
                AddressRegion = "Karadeniz",
                Amenities = new List<string> { "Wifi", "Şömine", "Doğa", "Dere Kenarı", "Huzurlu", "Dağ Manzarası" },
                PhotoUrls = new List<string>
                {
                    "https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800"
                },
                Latitude = 40.9667,
                Longitude = 40.9167,
                CreatedAt = new DateTime(2024, 11, 1, 7, 0, 0, DateTimeKind.Utc)
            },
            new Listing
            {
                Id = 28,
                UserId = 2,
                PlaceType = "Daire",
                AccommodationType = "Bütün mekan",
                Guests = 3,
                Bedrooms = 1,
                Beds = 2,
                Bathrooms = 1,
                Title = "Antalya Kaleiçi Tarihi Daire",
                Description = "Kaleiçi'nde restore edilmiş tarihi binada modern daire. Marina ve müzelere yürüme mesafesinde.",
                Price = 1750,
                AddressCountry = "Türkiye",
                AddressCity = "Antalya",
                AddressDistrict = "Kaleiçi",
                AddressStreet = "Barbaros Mahallesi, Hesapçı Sokak No:18",
                AddressBuilding = "Kat:2",
                AddressPostalCode = "07100",
                AddressRegion = "Akdeniz",
                Amenities = new List<string> { "Wifi", "Klima", "Tarihi Bina", "Merkezi Konum", "Marina Yakın" },
                PhotoUrls = new List<string>
                {
                    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"
                },
                Latitude = 36.8841,
                Longitude = 30.7056,
                CreatedAt = new DateTime(2024, 11, 4, 9, 30, 0, DateTimeKind.Utc)
            },
            new Listing
            {
                Id = 29,
                UserId = 3,
                PlaceType = "Villa",
                AccommodationType = "Bütün mekan",
                Guests = 9,
                Bedrooms = 4,
                Beds = 5,
                Bathrooms = 3,
                Title = "Kuşadası Ladies Beach Villa",
                Description = "Ladies Beach'e 5 dakika, özel havuzlu ve bahçeli geniş villa.",
                Price = 4500,
                AddressCountry = "Türkiye",
                AddressCity = "Aydın",
                AddressDistrict = "Kuşadası",
                AddressStreet = "Kadınlar Denizi Mahallesi, Sahil Yolu No:91",
                AddressBuilding = "Villa Sea",
                AddressPostalCode = "09400",
                AddressRegion = "Ege",
                Amenities = new List<string> { "Wifi", "Havuz", "Klima", "Bahçe", "Plaja Yakın", "Otopark" },
                PhotoUrls = new List<string>
                {
                    "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800"
                },
                Latitude = 37.8575,
                Longitude = 27.2581,
                CreatedAt = new DateTime(2024, 11, 2, 13, 45, 0, DateTimeKind.Utc)
            }
        );
    }
}
