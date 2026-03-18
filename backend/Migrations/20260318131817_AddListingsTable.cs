using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace StayinApi.Migrations
{
    /// <inheritdoc />
    public partial class AddListingsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Listings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: true),
                    PlaceType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AccommodationType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Guests = table.Column<int>(type: "int", nullable: false),
                    Bedrooms = table.Column<int>(type: "int", nullable: false),
                    Beds = table.Column<int>(type: "int", nullable: false),
                    Bathrooms = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    AddressCountry = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AddressCity = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AddressDistrict = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AddressStreet = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AddressBuilding = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AddressPostalCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AddressRegion = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Amenities = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PhotoUrls = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Latitude = table.Column<double>(type: "float", nullable: true),
                    Longitude = table.Column<double>(type: "float", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsArchived = table.Column<bool>(type: "bit", nullable: false),
                    UserId1 = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Listings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Listings_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Listings_Users_UserId1",
                        column: x => x.UserId1,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.InsertData(
                table: "Listings",
                columns: new[] { "Id", "AccommodationType", "AddressBuilding", "AddressCity", "AddressCountry", "AddressDistrict", "AddressPostalCode", "AddressRegion", "AddressStreet", "Amenities", "Bathrooms", "Bedrooms", "Beds", "CreatedAt", "Description", "Guests", "IsArchived", "Latitude", "Longitude", "PhotoUrls", "PlaceType", "Price", "Title", "UserId", "UserId1" },
                values: new object[,]
                {
                    { 1, "Bütün mekan", "A Blok Kat:3", "İzmir", "Türkiye", "Çeşme", "35930", "Ege", "Alaçatı Mahallesi, Sahil Caddesi No:45", "[\"Wifi\",\"Klima\",\"Havuz\",\"Jakuzi\",\"Deniz Manzaras\\u0131\",\"\\u00D6zel Plaj\"]", 1, 2, 2, new DateTime(2024, 11, 1, 10, 0, 0, 0, DateTimeKind.Utc), "Çeşme'nin en güzel sahilinde, deniz manzaralı modern daire. Havuz, jakuzi ve özel plaj erişimi mevcut.", 4, false, 38.322800000000001, 26.302499999999998, "[\"https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800\",\"https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800\"]", "Daire", 2500m, "Deniz Manzaralı Lüks Daire", 1, null },
                    { 2, "Bütün mekan", "Villa", "Antalya", "Türkiye", "Kalkan", "07960", "Akdeniz", "Kalamar Mahallesi, Yalı Sokak No:12", "[\"Wifi\",\"Klima\",\"Havuz\",\"Bah\\u00E7e\",\"Mangal\",\"Deniz Manzaras\\u0131\",\"\\u00D6zel Otopark\"]", 3, 4, 5, new DateTime(2024, 11, 3, 14, 30, 0, 0, DateTimeKind.Utc), "Kalkan'da özel havuzlu, geniş bahçeli lüks villa. Muhteşem deniz manzarası ve sessiz konum.", 8, false, 36.265599999999999, 29.408899999999999, "[\"https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800\",\"https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800\"]", "Villa", 5000m, "Modern Villa Havuz ve Bahçe", 1, null },
                    { 3, "Bütün mekan", "Butik Otel", "Muğla", "Türkiye", "Bodrum", "48400", "Ege", "Gümbet Mahallesi, Plaj Yolu No:8", "[\"Wifi\",\"Klima\",\"TV\",\"Kahvalt\\u0131\",\"Plaja Yak\\u0131n\",\"Restoran\"]", 2, 3, 3, new DateTime(2024, 11, 4, 9, 15, 0, 0, DateTimeKind.Utc), "Bodrum'un kalbinde, plaja yürüme mesafesinde modern ve konforlu konaklama. Kahvaltı dahil.", 6, false, 37.034399999999998, 27.430499999999999, "[\"https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800\",\"https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800\"]", "Ev", 3200m, "Plaja Sıfır Butik Otel", 2, null },
                    { 4, "Bütün mekan", "Bungalov 5", "Bolu", "Türkiye", "Abant", "14100", "Karadeniz", "Göl Mahallesi, Doğa Yolu No:23", "[\"Wifi\",\"\\u015E\\u00F6mine\",\"Veranda\",\"G\\u00F6l Manzaras\\u0131\",\"Do\\u011Fa\",\"Mangal\"]", 1, 1, 2, new DateTime(2024, 11, 5, 16, 45, 0, 0, DateTimeKind.Utc), "Abant Gölü manzaralı, doğa ile iç içe huzurlu bungalov. Şömine, veranda ve orman manzarası.", 3, false, 40.616700000000002, 31.2667, "[\"https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800\",\"https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=800\"]", "Kulübe", 1800m, "Doğa İçinde Bungalov", 2, null },
                    { 5, "Bütün mekan", null, "İzmir", "Türkiye", "Alaçatı", "35937", "Ege", "Kemalpaşa Mahallesi, Taş Sokak No:7", "[\"Wifi\",\"Klima\",\"Bah\\u00E7e\",\"Mutfak\",\"Merkezi Konum\"]", 1, 1, 1, new DateTime(2024, 11, 2, 11, 20, 0, 0, DateTimeKind.Utc), "Alaçatı çarşısına 5 dakika yürüme mesafesinde otantik taş ev. Şirin bahçe ve modern iç dekorasyon.", 2, false, 38.266599999999997, 26.3782, "[\"https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800\"]", "Daire", 2200m, "Alaçatı Merkezde Taş Ev", 2, null },
                    { 6, "Özel oda", "A Blok Kat:12", "İstanbul", "Türkiye", "Beşiktaş", "34347", "Marmara", "Ortaköy Mahallesi, Mecidiye Köprüsü Sokak No:15", "[\"Wifi\",\"Spa\",\"Restoran\",\"Oda Servisi\",\"Bo\\u011Faz Manzaras\\u0131\",\"Jakuzi\"]", 1, 1, 1, new DateTime(2024, 11, 1, 8, 30, 0, 0, DateTimeKind.Utc), "İstanbul Ortaköy'de Boğaz manzaralı suit oda. Spa, restoran ve özel hizmet.", 2, false, 41.047800000000002, 29.026700000000002, "[\"https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800\"]", "Otel Odası", 3500m, "Boğaz Manzaralı Lüks Suit", 3, null },
                    { 7, "Bütün mekan", "Villa Sunset", "Antalya", "Türkiye", "Kaş", "07580", "Akdeniz", "Çukurbağ Yarımadası, Manzara Yolu No:34", "[\"Wifi\",\"Sonsuzluk Havuzu\",\"Klima\",\"Bah\\u00E7e\",\"Mangal\",\"Deniz Manzaras\\u0131\",\"Otopark\"]", 4, 5, 6, new DateTime(2024, 11, 3, 13, 0, 0, 0, DateTimeKind.Utc), "Kaş merkezine 10 dakika, sonsuzluk havuzlu, 5 yatak odalı lüks villa. Muhteşem gün batımı manzarası.", 10, false, 36.2014, 29.640999999999998, "[\"https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?w=800\"]", "Villa", 6500m, "Kaş'ta Panoramik Deniz Manzaralı Villa", 3, null },
                    { 8, "Bütün mekan", "B Blok Kat:5", "Antalya", "Türkiye", "Konyaaltı", "07050", "Akdeniz", "Liman Mahallesi, Sahil Bulvarı No:88", "[\"Wifi\",\"Klima\",\"Balkon\",\"Plaja Yak\\u0131n\",\"Deniz Manzaras\\u0131\"]", 1, 1, 2, new DateTime(2024, 11, 4, 10, 15, 0, 0, DateTimeKind.Utc), "Konyaaltı sahilinde, plaja 50m mesafede modern daire. Balkondan deniz manzarası.", 3, false, 36.859699999999997, 30.625599999999999, "[\"https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800\"]", "Daire", 1900m, "Antalya Konyaaltı Plaj Dairesi", 3, null },
                    { 9, "Bütün mekan", null, "Muğla", "Türkiye", "Fethiye", "48300", "Ege", "Ovacık Mahallesi, Çam Sokak No:19", "[\"Wifi\",\"Klima\",\"Bah\\u00E7e\",\"Mangal\",\"Otopark\",\"Do\\u011Fa\"]", 2, 2, 3, new DateTime(2024, 11, 2, 15, 45, 0, 0, DateTimeKind.Utc), "Ölüdeniz lagününe 15 dakika yürüme mesafesinde, geniş bahçeli müstakil ev.", 5, false, 36.549999999999997, 29.116700000000002, "[\"https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800\"]", "Ev", 2800m, "Fethiye Ölüdeniz'de Bahçeli Ev", 4, null },
                    { 10, "Bütün mekan", "Kat:4", "İzmir", "Türkiye", "Konak", "35360", "Ege", "Kemeraltı Mahallesi, Anafartalar Caddesi No:56", "[\"Wifi\",\"Klima\",\"\\u015Eehir Manzaras\\u0131\",\"Merkezi Konum\",\"Tarihi Bina\"]", 1, 2, 2, new DateTime(2024, 11, 5, 9, 0, 0, 0, DateTimeKind.Utc), "İzmir Konak'ta tarihi binada restore edilmiş loft daire. Şehir manzarası ve modern tasarım.", 4, false, 38.418900000000001, 27.128699999999998, "[\"https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800\"]", "Daire", 1700m, "Konak Meydanı Manzaralı Loft", 4, null },
                    { 11, "Bütün mekan", "Villa Mavi", "Muğla", "Türkiye", "Marmaris", "48700", "Ege", "İçmeler Mahallesi, Deniz Yolu No:42", "[\"Wifi\",\"Havuz\",\"Klima\",\"Teras\",\"Deniz Manzaras\\u0131\",\"BBQ\"]", 2, 3, 4, new DateTime(2024, 11, 3, 12, 30, 0, 0, DateTimeKind.Utc), "Marmaris merkezine yakın, özel havuzlu triplex villa. Deniz manzarası ve geniş teras.", 6, false, 36.851300000000002, 28.2744, "[\"https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800\"]", "Villa", 4200m, "Marmaris Havuzlu Triplex Villa", 4, null },
                    { 12, "Bütün mekan", "Bungalov 12", "Sakarya", "Türkiye", "Sapanca", "54600", "Marmara", "Göl Mahallesi, Kıyı Yolu No:67", "[\"Wifi\",\"\\u015E\\u00F6mine\",\"Jakuzi\",\"G\\u00F6l Manzaras\\u0131\",\"Do\\u011Fa\",\"\\u00D6zel Plaj\"]", 1, 1, 1, new DateTime(2024, 11, 4, 14, 0, 0, 0, DateTimeKind.Utc), "Sapanca Gölü kenarında romantik bungalov. Şömine, jakuzi ve göl manzarası.", 2, false, 40.689399999999999, 30.267800000000001, "[\"https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800\"]", "Kulübe", 2100m, "Sapanca Göl Kenarı Bungalov", 5, null },
                    { 13, "Bütün mekan", "Kat:3", "İstanbul", "Türkiye", "Kadıköy", "34710", "Marmara", "Moda Caddesi No:134", "[\"Wifi\",\"Klima\",\"Merkezi Konum\",\"Mutfak\",\"Balkon\"]", 1, 2, 2, new DateTime(2024, 11, 1, 16, 20, 0, 0, DateTimeKind.Utc), "Moda'da nostaljik apartman dairesinde konforlu konaklama. Yürüyüş mesafesinde cafe ve restoranlar.", 4, false, 40.987200000000001, 29.026399999999999, "[\"https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800\"]", "Daire", 1600m, "Kadıköy'de Nostaljik Daire", 5, null },
                    { 14, "Bütün mekan", null, "Antalya", "Türkiye", "Side", "07330", "Akdeniz", "Selimiye Mahallesi, Antik Yol No:28", "[\"Wifi\",\"Havuz\",\"Klima\",\"Bah\\u00E7e\",\"Otopark\",\"Merkezi Konum\"]", 2, 3, 4, new DateTime(2024, 11, 2, 10, 45, 0, 0, DateTimeKind.Utc), "Side antik kente yürüme mesafesinde, havuzlu müstakil ev. Aile ve arkadaş grupları için ideal.", 7, false, 36.767299999999999, 31.3902, "[\"https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800\"]", "Ev", 3800m, "Side Antik Kent Yakını Villa", 5, null },
                    { 15, "Bütün mekan", "Kat:5", "İstanbul", "Türkiye", "Beyoğlu", "34433", "Marmara", "Cihangir Mahallesi, Firuzağa Sokak No:23", "[\"Wifi\",\"Merkezi Konum\",\"\\u015Eehir Manzaras\\u0131\",\"Sanat Galerisi Yak\\u0131n\"]", 1, 1, 2, new DateTime(2024, 11, 5, 11, 30, 0, 0, DateTimeKind.Utc), "İstiklal Caddesi'ne 5 dakika, sanatçı mahallesinde bohem loft daire.", 3, false, 41.031700000000001, 28.978300000000001, "[\"https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800\"]", "Daire", 1500m, "Beyoğlu'nda Sanatçı Loft'u", 1, null },
                    { 16, "Bütün mekan", "Villa Exclusive", "Muğla", "Türkiye", "Gökova", "48650", "Ege", "Akyaka Mahallesi, Körfez Yolu No:5", "[\"Wifi\",\"Sonsuzluk Havuzu\",\"\\u00D6zel \\u0130skele\",\"\\u00D6zel Plaj\",\"Jakuzi\",\"Sauna\",\"Bah\\u00E7e\"]", 5, 6, 8, new DateTime(2024, 11, 1, 9, 0, 0, 0, DateTimeKind.Utc), "Gökova Körfezi'nde özel iskele ve tekne bağlama imkanı olan mega villa. Sonsuzluk havuzu ve özel plaj.", 12, false, 37.045299999999997, 28.321100000000001, "[\"https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800\"]", "Villa", 8500m, "Gökova Körfezi Lüks Villa", 1, null },
                    { 17, "Özel oda", "Mağara Kat:2", "Nevşehir", "Türkiye", "Göreme", "50180", "İç Anadolu", "Müze Caddesi No:12", "[\"Wifi\",\"Kahvalt\\u0131 Dahil\",\"Balon Turu\",\"Tarihi Mekan\",\"Teras\"]", 1, 1, 1, new DateTime(2024, 11, 3, 7, 30, 0, 0, DateTimeKind.Utc), "Göreme'de otantik mağara otel odası. Balon turu dahil, terasta kahvaltı servisi.", 2, false, 38.643099999999997, 34.828099999999999, "[\"https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800\"]", "Otel Odası", 2700m, "Kapadokya Mağara Otel", 2, null },
                    { 18, "Bütün mekan", "C Blok Kat:8", "İzmir", "Türkiye", "Alsancak", "35220", "Ege", "Kıbrıs Şehitleri Caddesi No:145", "[\"Wifi\",\"Klima\",\"Marina Manzaras\\u0131\",\"Balkon\",\"Merkezi Konum\"]", 1, 2, 3, new DateTime(2024, 11, 4, 13, 15, 0, 0, DateTimeKind.Utc), "İzmir Alsancak'ta marina ve deniz manzaralı modern daire. Gece hayatına yürüme mesafesinde.", 5, false, 38.438200000000002, 27.1463, "[\"https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800\"]", "Daire", 2000m, "Alsancak Marina Manzaralı Daire", 2, null },
                    { 19, "Bütün mekan", "Şale 15", "Bursa", "Türkiye", "Uludağ", "16370", "Marmara", "Oteller Bölgesi No:78", "[\"Wifi\",\"\\u015E\\u00F6mine\",\"Jakuzi\",\"Kayak Pisti Yak\\u0131n\",\"Da\\u011F Manzaras\\u0131\"]", 1, 2, 2, new DateTime(2024, 11, 2, 8, 0, 0, 0, DateTimeKind.Utc), "Uludağ'da piste yakın modern şale. Şömine, jakuzi ve dağ manzarası.", 4, false, 40.102499999999999, 29.087800000000001, "[\"https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=800\"]", "Kulübe", 3200m, "Uludağ Kayak Merkezi Şale", 3, null },
                    { 20, "Bütün mekan", null, "Muğla", "Türkiye", "Datça", "48900", "Ege", "Eski Datça Mahallesi, Badem Sokak No:34", "[\"Wifi\",\"Bah\\u00E7e\",\"Veranda\",\"Tarihi Ev\",\"Do\\u011Fa\",\"Huzurlu\"]", 2, 3, 3, new DateTime(2024, 11, 5, 10, 0, 0, 0, DateTimeKind.Utc), "Eski Datça'da restore edilmiş otantik taş ev. Bahçe, veranda ve sessiz konum.", 6, false, 36.726399999999998, 27.688099999999999, "[\"https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800\"]", "Ev", 2900m, "Datça Eski Datça Taş Ev", 3, null },
                    { 21, "Bütün mekan", "Villa Green", "Antalya", "Türkiye", "Belek", "07506", "Akdeniz", "Golf Mahallesi, Yeşil Alan Caddesi No:56", "[\"Wifi\",\"Havuz\",\"Golf Sahas\\u0131\",\"Spa Yak\\u0131n\",\"Klima\",\"Bah\\u00E7e\"]", 3, 4, 5, new DateTime(2024, 11, 1, 12, 0, 0, 0, DateTimeKind.Utc), "Belek'te golf sahası manzaralı, özel havuzlu lüks villa. Spa ve fitness merkezi yakın.", 8, false, 36.862499999999997, 31.055299999999999, "[\"https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800\"]", "Villa", 5200m, "Belek Golf Sahalı Villa", 4, null },
                    { 22, "Bütün mekan", "Site A Blok Kat:4", "Muğla", "Türkiye", "Bodrum", "48400", "Ege", "Gümbet Mahallesi, Plaj Yolu No:89", "[\"Wifi\",\"Klima\",\"Havuz\",\"Plaja Yak\\u0131n\",\"G\\u00FCvenlik\"]", 1, 1, 2, new DateTime(2024, 11, 3, 15, 30, 0, 0, DateTimeKind.Utc), "Gümbet plajına 2 dakika, site içinde havuzlu modern daire.", 3, false, 37.030299999999997, 27.407800000000002, "[\"https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800\"]", "Daire", 1800m, "Bodrum Gümbet Plaj Dairesi", 4, null },
                    { 23, "Bütün mekan", null, "Çanakkale", "Türkiye", "Assos", "17860", "Marmara", "Behramkale Köyü, Liman Yolu No:12", "[\"Wifi\",\"Bah\\u00E7e\",\"Deniz Manzaras\\u0131\",\"Do\\u011Fa\",\"Tarihi Alan Yak\\u0131n\"]", 2, 2, 3, new DateTime(2024, 11, 4, 11, 45, 0, 0, DateTimeKind.Utc), "Assos antik limanına 10 dakika, köy evinde huzurlu tatil. Bahçe ve deniz manzarası.", 5, false, 39.491900000000001, 26.338899999999999, "[\"https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800\"]", "Ev", 2300m, "Çanakkale Assos Köy Evi", 5, null },
                    { 24, "Özel oda", "Butik Otel Kat:2", "İzmir", "Türkiye", "Şirince", "35920", "Ege", "Köy Merkezi No:45", "[\"Wifi\",\"Kahvalt\\u0131 Dahil\",\"\\u015Earap Tad\\u0131m\\u0131\",\"Tarihi Mekan\",\"Do\\u011Fa\"]", 1, 1, 1, new DateTime(2024, 11, 5, 8, 15, 0, 0, DateTimeKind.Utc), "Şirince köyünde tarihi butik otel odası. Şarap tadımı ve kahvaltı dahil.", 2, false, 37.945599999999999, 27.448899999999998, "[\"https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800\"]", "Otel Odası", 1400m, "Şirince Butik Otel Odası", 5, null },
                    { 25, "Bütün mekan", "Villa Orange", "Muğla", "Türkiye", "Bodrum", "48470", "Ege", "Bitez Mahallesi, Mandalina Sokak No:67", "[\"Wifi\",\"Havuz\",\"Klima\",\"Bah\\u00E7e\",\"Denize Yak\\u0131n\",\"Mangal\"]", 4, 5, 6, new DateTime(2024, 11, 2, 14, 20, 0, 0, DateTimeKind.Utc), "Bitez'de mandalina bahçeleri arasında, denize yakın özel havuzlu villa.", 10, false, 37.0167, 27.383299999999998, "[\"https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800\"]", "Villa", 4800m, "Bitez Mandalinakoy Villa", 1, null },
                    { 26, "Bütün mekan", "B Blok Kat:6", "Antalya", "Türkiye", "Alanya", "07400", "Akdeniz", "Saray Mahallesi, Kleopatra Caddesi No:234", "[\"Wifi\",\"Klima\",\"Balkon\",\"Plaja Yak\\u0131n\",\"Deniz Manzaras\\u0131\"]", 1, 2, 2, new DateTime(2024, 11, 3, 16, 0, 0, 0, DateTimeKind.Utc), "Kleopatra plajına 100m, deniz manzaralı balkonlu modern daire.", 4, false, 36.543300000000002, 31.985600000000002, "[\"https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800\"]", "Daire", 1650m, "Alanya Kleopatra Plajı Dairesi", 1, null },
                    { 27, "Bütün mekan", "Ev 8", "Rize", "Türkiye", "Ayder", "53750", "Karadeniz", "Yayla Mahallesi, Dere Yolu No:23", "[\"Wifi\",\"\\u015E\\u00F6mine\",\"Do\\u011Fa\",\"Dere Kenar\\u0131\",\"Huzurlu\",\"Da\\u011F Manzaras\\u0131\"]", 1, 1, 1, new DateTime(2024, 11, 1, 7, 0, 0, 0, DateTimeKind.Utc), "Ayder'de dere kenarında ahşap dağ evi. Şömine, doğa ve huzur.", 2, false, 40.966700000000003, 40.916699999999999, "[\"https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800\"]", "Kulübe", 1900m, "Ayder Yaylaı Dağ Evi", 2, null },
                    { 28, "Bütün mekan", "Kat:2", "Antalya", "Türkiye", "Kaleiçi", "07100", "Akdeniz", "Barbaros Mahallesi, Hesapçı Sokak No:18", "[\"Wifi\",\"Klima\",\"Tarihi Bina\",\"Merkezi Konum\",\"Marina Yak\\u0131n\"]", 1, 1, 2, new DateTime(2024, 11, 4, 9, 30, 0, 0, DateTimeKind.Utc), "Kaleiçi'nde restore edilmiş tarihi binada modern daire. Marina ve müzelere yürüme mesafesinde.", 3, false, 36.884099999999997, 30.7056, "[\"https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800\"]", "Daire", 1750m, "Antalya Kaleiçi Tarihi Daire", 2, null },
                    { 29, "Bütün mekan", "Villa Sea", "Aydın", "Türkiye", "Kuşadası", "09400", "Ege", "Kadınlar Denizi Mahallesi, Sahil Yolu No:91", "[\"Wifi\",\"Havuz\",\"Klima\",\"Bah\\u00E7e\",\"Plaja Yak\\u0131n\",\"Otopark\"]", 3, 4, 5, new DateTime(2024, 11, 2, 13, 45, 0, 0, DateTimeKind.Utc), "Ladies Beach'e 5 dakika, özel havuzlu ve bahçeli geniş villa.", 9, false, 37.857500000000002, 27.258099999999999, "[\"https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800\"]", "Villa", 4500m, "Kuşadası Ladies Beach Villa", 3, null }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Listings_UserId",
                table: "Listings",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Listings_UserId1",
                table: "Listings",
                column: "UserId1");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Listings");
        }
    }
}
