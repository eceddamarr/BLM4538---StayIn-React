using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StayIn.Api.Data;
using StayIn.Api.Models;
using System.Security.Claims;
using System.ComponentModel.DataAnnotations;

namespace StayIn.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ReservationController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ReservationController(AppDbContext context)
        {
            _context = context;
        }

        // Rezervasyon oluştur (Guest)
        [HttpPost("create")]
        public async Task<IActionResult> CreateReservation([FromBody] CreateReservationRequest request)
        {
            try
            {
                // Tarih stringlerini parse et
                if (!DateTime.TryParse(request.CheckInDate, out DateTime checkInDate) ||
                    !DateTime.TryParse(request.CheckOutDate, out DateTime checkOutDate))
                {
                    return BadRequest(new { message = "Geçersiz tarih formatı. YYYY-MM-DD formatını kullanınız." });
                }

                // Kullanıcı ID'sini JWT'den al
                var userIdClaim = User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value
                    ?? User.FindFirst("sub")?.Value
                    ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int guestId))
                {
                    return Unauthorized(new { message = "Kullanıcı kimliği doğrulanamadı." });
                }

                // İlanı bul
                var listing = await _context.Listings.FindAsync(request.ListingId);
                if (listing == null)
                {
                    return NotFound(new { message = "İlan bulunamadı." });
                }

                if (listing.UserId == null)
                {
                    return BadRequest(new { message = "Bu ilan için ev sahibi bilgisi bulunamadı." });
                }

                // Kendi ilanına rezervasyon yapamasın
                if (listing.UserId == guestId)
                {
                    return BadRequest(new { message = "Kendi ilanınıza rezervasyon yapamazsınız." });
                }

                var hasOwnDateConflict = await _context.Reservations.AnyAsync(r =>
                    r.GuestId == guestId &&
                    r.ListingId == request.ListingId &&
                    (r.Status == "Pending" || r.Status == "Approved") &&
                    checkInDate < r.CheckOutDate &&
                    checkOutDate > r.CheckInDate);

                if (hasOwnDateConflict)
                {
                    return BadRequest(new { message = "Bu ilan için seçtiğiniz tarihlerde zaten aktif bir rezervasyon talebiniz var." });
                }

                // *** YENİ: Tarih çakışması kontrolü ***
                // Bu ilanın seçilen tarihler arasında onaylanmış başka rezervasyonu var mı?
                var hasConflict = await _context.Reservations
                    .Where(r => r.ListingId == request.ListingId &&
                                r.Status == "Approved" &&
                                // Tarih çakışması kontrolü
                                ((checkInDate >= r.CheckInDate && checkInDate < r.CheckOutDate) ||  // Yeni giriş tarihi mevcut rezervasyon içinde
                                (checkOutDate > r.CheckInDate && checkOutDate <= r.CheckOutDate) || // Yeni çıkış tarihi mevcut rezervasyon içinde
                                (checkInDate <= r.CheckInDate && checkOutDate >= r.CheckOutDate)))  // Yeni rezervasyon mevcut rezervasyonu kapsıyor
                    .AnyAsync();

                if (hasConflict)
                {
                    return BadRequest(new { message = "Seçtiğiniz tarihler için bu ilan zaten rezerve edilmiş. Lütfen farklı tarihler seçin." });
                }

                // Tarih kontrolü
                if (checkInDate >= checkOutDate)
                {
                    return BadRequest(new { message = "Çıkış tarihi giriş tarihinden sonra olmalıdır." });
                }

                if (checkInDate < DateTime.Today)
                {
                    return BadRequest(new { message = "Geçmiş tarihe rezervasyon yapamazsınız." });
                }

                if (request.Guests <= 0)
                {
                    return BadRequest(new { message = "Konuk sayısı 0'dan büyük olmalıdır." });
                }

                if (request.Guests > listing.Guests)
                {
                    return BadRequest(new { message = $"Bu ilan maksimum {listing.Guests} konuk kabul ediyor." });
                }

                var hasBookedDateConflict = await _context.Reservations.AnyAsync(r =>
                    r.ListingId == request.ListingId &&
                    (r.Status == "Approved" || r.Status == "Paid") &&
                    checkInDate.Date < r.CheckOutDate.Date &&
                    checkOutDate.Date > r.CheckInDate.Date);

                if (hasBookedDateConflict)
                {
                    return BadRequest(new { message = "Seçtiğiniz tarihler için bu ilan zaten rezerve edilmiş. Lütfen farklı tarihler seçin." });
                }

                // Toplam gece ve fiyat hesapla
                var nights = (checkOutDate - checkInDate).Days;
                var totalPrice = nights * listing.Price;

                var reservation = new Reservation
                {
                    ListingId = request.ListingId,
                    GuestId = guestId,
                    HostId = listing.UserId!.Value,
                    CheckInDate = checkInDate,
                    CheckOutDate = checkOutDate,
                    Guests = request.Guests,
                    TotalPrice = totalPrice,
                    Status = "Pending",
                    CreatedAt = DateTime.UtcNow
                };

                _context.Reservations.Add(reservation);
                await _context.SaveChangesAsync();

                return Ok(new {
                    message = "Rezervasyon talebiniz gönderildi. Ev sahibinin onayını bekleyin.",
                    reservationId = reservation.Id,
                    totalPrice = totalPrice
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Rezervasyon oluşturulamadı.", error = ex.Message });
            }
        }

        // Kullanıcının yaptığı rezervasyonlar (Guest tarafı)
        [HttpGet("my-reservations")]
        public async Task<IActionResult> GetMyReservations()
        {
            try
            {
                var userIdClaim = User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value
                    ?? User.FindFirst("sub")?.Value
                    ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int guestId))
                {
                    return Unauthorized(new { message = "Kullanıcı kimliği doğrulanamadı." });
                }

                var reservations = await _context.Reservations
                    .Include(r => r.Listing)
                    .Include(r => r.Host)
                    .Include(r => r.Payment)
                    .Where(r => r.GuestId == guestId)
                    .OrderByDescending(r => r.CreatedAt)
                    .Select(r => new
                    {
                        r.Id,
                        r.ListingId,
                        ListingTitle = r.Listing!.Title,
                        ListingPhotoUrl = r.Listing.PhotoUrls != null && r.Listing.PhotoUrls.Count > 0 ? r.Listing.PhotoUrls[0] : null,
                        HostName = r.Host!.FullName,
                        r.CheckInDate,
                        r.CheckOutDate,
                        r.Guests,
                        r.TotalPrice,
                        r.Status,
                        r.CreatedAt,
                        r.ResponsedAt,
                        r.IsPaid,          
                        PaymentDate = r.Payment != null ? (DateTime?)r.Payment.PaymentDate : null,
                        Review = _context.Reviews
                            .Where(review => review.ReservationId == r.Id && review.GuestId == guestId)
                            .Select(review => new
                            {
                                review.Id,
                                review.Rating,
                                review.Comment,
                                review.CreatedAt
                            })
                            .FirstOrDefault()
                    })
                    .ToListAsync();

                return Ok(new { reservations });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Rezervasyonlar getirilemedi.", error = ex.Message });
            }
        }

        // Gelen rezervasyon talepleri (Host tarafı)
        [HttpGet("incoming-requests")]
        public async Task<IActionResult> GetIncomingRequests()
        {
            try
            {
                var userIdClaim = User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value
                    ?? User.FindFirst("sub")?.Value
                    ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int hostId))
                {
                    return Unauthorized(new { message = "Kullanıcı kimliği doğrulanamadı." });
                }

                var requests = await _context.Reservations
                    .Include(r => r.Listing)
                    .Include(r => r.Guest)
                    .Include(r => r.Payment)
                    .Where(r => r.HostId == hostId)
                    .OrderByDescending(r => r.CreatedAt)
                    .Select(r => new
                    {
                        r.Id,
                        r.ListingId,
                        ListingTitle = r.Listing!.Title,
                        ListingPhotoUrl = r.Listing.PhotoUrls != null && r.Listing.PhotoUrls.Count > 0 ? r.Listing.PhotoUrls[0] : null,
                        GuestName = r.Guest!.FullName,
                        GuestEmail = r.Guest.Email,
                        r.CheckInDate,
                        r.CheckOutDate,
                        r.Guests,
                        r.TotalPrice,
                        r.Status,
                        r.CreatedAt,
                        r.ResponsedAt,
                        r.IsPaid,          
                        PaymentDate = r.Payment != null ? (DateTime?)r.Payment.PaymentDate : null
                    })
                    .ToListAsync();

                return Ok(new { requests });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Talepler getirilemedi.", error = ex.Message });
            }
        }

        // Rezervasyonu onayla (Host)
        [HttpPost("{id}/approve")]
        public async Task<IActionResult> ApproveReservation(int id)
        {
            try
            {
                var userIdClaim = User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value
                    ?? User.FindFirst("sub")?.Value
                    ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int hostId))
                {
                    return Unauthorized(new { message = "Kullanıcı kimliği doğrulanamadı." });
                }

                var reservation = await _context.Reservations.FindAsync(id);
                if (reservation == null)
                {
                    return NotFound(new { message = "Rezervasyon bulunamadı." });
                }

                if (reservation.HostId != hostId)
                {
                    return Forbid();
                }

                if (reservation.Status != "Pending")
                {
                    return BadRequest(new { message = "Bu rezervasyon zaten cevaplanmış." });
                }

                var hasConflict = await _context.Reservations.AnyAsync(r =>
                    r.Id != reservation.Id &&
                    r.ListingId == reservation.ListingId &&
                    (r.Status == "Approved" || r.Status == "Paid") &&
                    reservation.CheckInDate.Date < r.CheckOutDate.Date &&
                    reservation.CheckOutDate.Date > r.CheckInDate.Date);

                if (hasConflict)
                {
                    return BadRequest(new { message = "Bu tarih aralığında ilan için zaten onaylanmış bir rezervasyon var. Bu talep onaylanamaz." });
                }

                reservation.Status = "Approved";
                reservation.ResponsedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                return Ok(new { message = "Rezervasyon onaylandı." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Rezervasyon onaylanamadı.", error = ex.Message });
            }
        }

        // Rezervasyonu reddet (Host)
        [HttpPost("{id}/reject")]
        public async Task<IActionResult> RejectReservation(int id)
        {
            try
            {
                var userIdClaim = User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value
                    ?? User.FindFirst("sub")?.Value
                    ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int hostId))
                {
                    return Unauthorized(new { message = "Kullanıcı kimliği doğrulanamadı." });
                }

                var reservation = await _context.Reservations.FindAsync(id);
                if (reservation == null)
                {
                    return NotFound(new { message = "Rezervasyon bulunamadı." });
                }

                if (reservation.HostId != hostId)
                {
                    return Forbid();
                }

                if (reservation.Status != "Pending")
                {
                    return BadRequest(new { message = "Bu rezervasyon zaten cevaplanmış." });
                }

                reservation.Status = "Rejected";
                reservation.ResponsedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                return Ok(new { message = "Rezervasyon reddedildi." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Rezervasyon reddedilemedi.", error = ex.Message });
            }
        }

        // Rezervasyonu iptal et (Guest)
        [HttpPost("{id}/cancel")]
        public async Task<IActionResult> CancelReservation(int id)
        {
            try
            {
                var userIdClaim = User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value
                    ?? User.FindFirst("sub")?.Value
                    ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int guestId))
                {
                    return Unauthorized(new { message = "Kullanıcı kimliği doğrulanamadı." });
                }

                var reservation = await _context.Reservations.FindAsync(id);
                if (reservation == null)
                {
                    return NotFound(new { message = "Rezervasyon bulunamadı." });
                }

                if (reservation.GuestId != guestId)
                {
                    return Forbid();
                }

                if (reservation.Status == "Cancelled")
                {
                    return BadRequest(new { message = "Bu rezervasyon zaten iptal edilmiş." });
                }

                reservation.Status = "Cancelled";
                await _context.SaveChangesAsync();

                return Ok(new { message = "Rezervasyon iptal edildi." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Rezervasyon iptal edilemedi.", error = ex.Message });
            }
        }


        // GET: api/Reservation/listing/{listingId}/booked-ranges - İlanın dolu tarih aralıkları
        [HttpGet("listing/{listingId}/booked-ranges")]
        [AllowAnonymous]
        public async Task<IActionResult> GetBookedRanges(int listingId)
        {
            try
            {
                var listingExists = await _context.Listings.AnyAsync(l => l.Id == listingId && !l.IsArchived);
                if (!listingExists)
                {
                    return NotFound(new { message = "İlan bulunamadı." });
                }

                var today = DateTime.Today;
                var bookedReservations = await _context.Reservations
                    .Where(r =>
                        r.ListingId == listingId &&
                        (r.Status == "Approved" || r.Status == "Paid") &&
                        r.CheckOutDate.Date >= today)
                    .OrderBy(r => r.CheckInDate)
                    .Select(r => new
                    {
                        r.CheckInDate,
                        r.CheckOutDate
                    })
                    .ToListAsync();

                var bookedRanges = bookedReservations.Select(r => new
                {
                    checkInDate = r.CheckInDate.ToString("yyyy-MM-dd"),
                    checkOutDate = r.CheckOutDate.ToString("yyyy-MM-dd")
                });

                return Ok(new { bookedRanges });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Dolu tarihler getirilemedi.", error = ex.Message });
            }
        }


        // GET: api/Reservation/check/{listingId} - İlana rezervasyon var mı kontrol et
        [HttpGet("check/{listingId}")]
        [Authorize]
        public async Task<IActionResult> CheckExistingReservation(int listingId)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                    ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value
                    ?? User.FindFirst("sub")?.Value;
                
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new { message = "Kullanıcı kimliği doğrulanamadı." });
                }
                
                var existingReservation = await _context.Reservations
                    .Where(r => r.GuestId == userId && 
                            r.ListingId == listingId && 
                            (r.Status == "Pending" || r.Status == "Approved"))
                    .FirstOrDefaultAsync();
                
                return Ok(new { hasReservation = existingReservation != null });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Bir hata oluştu", error = ex.Message });
            }
        }

        // DTO
        public class CreateReservationRequest
        {
            public int ListingId { get; set; }

            [Required]
            public string CheckInDate { get; set; } = default!;

            [Required]
            public string CheckOutDate { get; set; } = default!;

            public int Guests { get; set; }
        }
    }
}
