using Microsoft.EntityFrameworkCore;
using StayIn.Api.Data;
using StayIn.Api.Models;

public class SeedReviews
{
    public static async Task SeedData(AppDbContext db)
    {
        // Rezervasyonları ekle
        var reservations = new List<Reservation>
        {
            new() { ListingId = 1, GuestId = 2, HostId = 1, CheckInDate = new DateTime(2024, 10, 1, 14, 0, 0, DateTimeKind.Utc), CheckOutDate = new DateTime(2024, 10, 5, 11, 0, 0, DateTimeKind.Utc), Guests = 2, TotalPrice = 10000, Status = "Approved", CreatedAt = new DateTime(2024, 9, 25, 10, 0, 0, DateTimeKind.Utc), ResponsedAt = new DateTime(2024, 9, 25, 15, 0, 0, DateTimeKind.Utc) },
            new() { ListingId = 2, GuestId = 3, HostId = 1, CheckInDate = new DateTime(2024, 10, 10, 14, 0, 0, DateTimeKind.Utc), CheckOutDate = new DateTime(2024, 10, 15, 11, 0, 0, DateTimeKind.Utc), Guests = 6, TotalPrice = 25000, Status = "Approved", CreatedAt = new DateTime(2024, 10, 1, 9, 0, 0, DateTimeKind.Utc), ResponsedAt = new DateTime(2024, 10, 1, 12, 0, 0, DateTimeKind.Utc) },
            new() { ListingId = 3, GuestId = 4, HostId = 2, CheckInDate = new DateTime(2024, 10, 20, 14, 0, 0, DateTimeKind.Utc), CheckOutDate = new DateTime(2024, 10, 23, 11, 0, 0, DateTimeKind.Utc), Guests = 4, TotalPrice = 9600, Status = "Approved", CreatedAt = new DateTime(2024, 10, 15, 8, 0, 0, DateTimeKind.Utc), ResponsedAt = new DateTime(2024, 10, 15, 14, 0, 0, DateTimeKind.Utc) },
            new() { ListingId = 6, GuestId = 5, HostId = 3, CheckInDate = new DateTime(2024, 11, 1, 14, 0, 0, DateTimeKind.Utc), CheckOutDate = new DateTime(2024, 11, 3, 11, 0, 0, DateTimeKind.Utc), Guests = 2, TotalPrice = 7000, Status = "Approved", CreatedAt = new DateTime(2024, 10, 25, 10, 0, 0, DateTimeKind.Utc), ResponsedAt = new DateTime(2024, 10, 25, 16, 0, 0, DateTimeKind.Utc) },
            new() { ListingId = 7, GuestId = 1, HostId = 3, CheckInDate = new DateTime(2024, 11, 5, 14, 0, 0, DateTimeKind.Utc), CheckOutDate = new DateTime(2024, 11, 10, 11, 0, 0, DateTimeKind.Utc), Guests = 8, TotalPrice = 32500, Status = "Approved", CreatedAt = new DateTime(2024, 10, 28, 11, 0, 0, DateTimeKind.Utc), ResponsedAt = new DateTime(2024, 10, 28, 17, 0, 0, DateTimeKind.Utc) },
            new() { ListingId = 29, GuestId = 2, HostId = 3, CheckInDate = new DateTime(2024, 9, 15, 14, 0, 0, DateTimeKind.Utc), CheckOutDate = new DateTime(2024, 9, 20, 11, 0, 0, DateTimeKind.Utc), Guests = 6, TotalPrice = 22500, Status = "Approved", CreatedAt = new DateTime(2024, 9, 1, 10, 0, 0, DateTimeKind.Utc), ResponsedAt = new DateTime(2024, 9, 1, 14, 0, 0, DateTimeKind.Utc) },
            new() { ListingId = 29, GuestId = 3, HostId = 3, CheckInDate = new DateTime(2024, 8, 10, 14, 0, 0, DateTimeKind.Utc), CheckOutDate = new DateTime(2024, 8, 15, 11, 0, 0, DateTimeKind.Utc), Guests = 8, TotalPrice = 22500, Status = "Approved", CreatedAt = new DateTime(2024, 7, 25, 9, 0, 0, DateTimeKind.Utc), ResponsedAt = new DateTime(2024, 7, 25, 12, 0, 0, DateTimeKind.Utc) },
            new() { ListingId = 29, GuestId = 4, HostId = 3, CheckInDate = new DateTime(2024, 7, 20, 14, 0, 0, DateTimeKind.Utc), CheckOutDate = new DateTime(2024, 7, 25, 11, 0, 0, DateTimeKind.Utc), Guests = 7, TotalPrice = 22500, Status = "Approved", CreatedAt = new DateTime(2024, 7, 5, 11, 0, 0, DateTimeKind.Utc), ResponsedAt = new DateTime(2024, 7, 5, 15, 0, 0, DateTimeKind.Utc) },
            new() { ListingId = 29, GuestId = 5, HostId = 3, CheckInDate = new DateTime(2024, 10, 5, 14, 0, 0, DateTimeKind.Utc), CheckOutDate = new DateTime(2024, 10, 10, 11, 0, 0, DateTimeKind.Utc), Guests = 6, TotalPrice = 22500, Status = "Approved", CreatedAt = new DateTime(2024, 9, 20, 8, 0, 0, DateTimeKind.Utc), ResponsedAt = new DateTime(2024, 9, 20, 13, 0, 0, DateTimeKind.Utc) },
            new() { ListingId = 29, GuestId = 1, HostId = 3, CheckInDate = new DateTime(2024, 11, 12, 14, 0, 0, DateTimeKind.Utc), CheckOutDate = new DateTime(2024, 11, 17, 11, 0, 0, DateTimeKind.Utc), Guests = 8, TotalPrice = 22500, Status = "Approved", CreatedAt = new DateTime(2024, 10, 30, 10, 0, 0, DateTimeKind.Utc), ResponsedAt = new DateTime(2024, 10, 30, 16, 0, 0, DateTimeKind.Utc) }
        };

        foreach (var reservation in reservations)
        {
            if (!await db.Reservations.AnyAsync(r => r.ListingId == reservation.ListingId && r.GuestId == reservation.GuestId && r.CheckInDate == reservation.CheckInDate))
            {
                db.Reservations.Add(reservation);
            }
        }
        await db.SaveChangesAsync();

        // Yorumları ekle
        var reviews = new List<(int ListingId, int GuestId, int Rating, string Comment, DateTime CreatedAt)>
        {
            (1, 2, 5, "Harika bir deneyimdi! Deniz manzarası muhteşem, ev tertemiz ve konforlu. Ev sahibi çok yardımcı oldu. Kesinlikle tekrar geleceğiz.", new DateTime(2024, 10, 6, 15, 30, 0, DateTimeKind.Utc)),
            (2, 3, 5, "Mükemmel bir villa! Havuz çok güzeldi, çocuklar bayıldı. Kalkan'ın en güzel yerlerinden birinde konumlanmış. Ailecek harika zaman geçirdik.", new DateTime(2024, 10, 16, 10, 0, 0, DateTimeKind.Utc)),
            (3, 4, 4, "Genel olarak güzel bir konaklama deneyimiydi. Plaja çok yakın olması büyük avantaj. Sadece wifi biraz yavaştı ama genel olarak memnun kaldık.", new DateTime(2024, 10, 24, 9, 15, 0, DateTimeKind.Utc)),
            (6, 5, 5, "Boğaz manzarası gerçekten efsane! Suit çok lüks ve konforlu. Spa hizmeti harika. Romantik bir kaçamak için ideal.", new DateTime(2024, 11, 4, 14, 45, 0, DateTimeKind.Utc)),
            (7, 1, 5, "Kaş'ın incisi! Sonsuzluk havuzundan gün batımı izlemek paha biçilemez. Villa son derece geniş ve şık. Grup tatili için mükemmel.", new DateTime(2024, 11, 11, 16, 20, 0, DateTimeKind.Utc)),
            (29, 2, 5, "Kuşadası'nın en güzel villarından biri! Havuz harika, Ladies Beach'e çok yakın. Bahçe çok bakımlı ve geniş. Ailecek muhteşem bir tatil geçirdik, teşekkürler!", new DateTime(2024, 9, 21, 10, 30, 0, DateTimeKind.Utc)),
            (29, 3, 5, "Mükemmel bir lokasyon ve villa! Her şey düşünülmüş, mutfak tam donanımlı. Çocuklar havuzdan çıkmak bilmedi. Ev sahibi çok ilgili ve yardımcı. 10 üzerinden 10!", new DateTime(2024, 8, 16, 14, 15, 0, DateTimeKind.Utc)),
            (29, 4, 4, "Çok güzel bir villa, temiz ve ferah. Sadece klimalardan biri biraz gürültülüydü ama genel olarak çok memnun kaldık. Konumu harika, denize yakın ve sessiz.", new DateTime(2024, 7, 26, 11, 45, 0, DateTimeKind.Utc)),
            (29, 5, 5, "Harika bir deneyim! Villa fotoğraflardan daha güzel çıktı. Havuz temiz, bahçe bakımlı, odalar geniş. Arkadaşlarla gelmiştik, herkes çok mutluydu. Kesinlikle tavsiye ederim.", new DateTime(2024, 10, 11, 16, 0, 0, DateTimeKind.Utc)),
            (29, 1, 4, "Güzel bir villa, konumu ideal. Havuz ve bahçe çok güzel. Tek eksi mutfakta bazı malzemeler eksikti ama genel olarak harika bir tatildi. Tekrar geliriz.", new DateTime(2024, 11, 18, 9, 30, 0, DateTimeKind.Utc))
        };

        foreach (var (listingId, guestId, rating, comment, createdAt) in reviews)
        {
            var reservation = await db.Reservations
                .Where(r => r.ListingId == listingId && r.GuestId == guestId)
                .OrderBy(r => r.CreatedAt)
                .FirstOrDefaultAsync();

            if (reservation != null && !await db.Reviews.AnyAsync(r => r.ReservationId == reservation.Id))
            {
                db.Reviews.Add(new Review
                {
                    ListingId = listingId,
                    GuestId = guestId,
                    ReservationId = reservation.Id,
                    Rating = rating,
                    Comment = comment,
                    CreatedAt = createdAt
                });
            }
        }
        await db.SaveChangesAsync();
    }
}
