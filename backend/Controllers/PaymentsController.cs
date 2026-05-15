using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StayIn.Api.Data;
using StayIn.Api.DTOs;
using StayIn.Api.Models;
using System.IdentityModel.Tokens.Jwt;

namespace StayIn.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PaymentsController : ControllerBase
{
    private readonly AppDbContext _db;

    public PaymentsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpPost("reservation/{reservationId}")]
    public async Task<IActionResult> ProcessPayment(int reservationId, [FromBody] PaymentRequest request)
    {
        try
        {
            // Kullanıcı doğrulama
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)
                              ?? User.FindFirst(JwtRegisteredClaimNames.Sub);

            if (userIdClaim == null)
                return Unauthorized(new { success = false, message = "Kullanıcı doğrulanamadı." });

            var userId = int.Parse(userIdClaim.Value);

            // Rezervasyonu bul
            var reservation = await _db.Reservations.FindAsync(reservationId);
            if (reservation == null)
                return NotFound(new { success = false, message = "Rezervasyon bulunamadı." });

            // Sadece kendi rezervasyonuna ödeme yapabilir
            if (reservation.GuestId != userId)
                return Forbid();

            // Rezervasyon onaylanmış mı kontrol et
            if (reservation.Status != "Approved")
                return BadRequest(new { success = false, message = "Sadece onaylanmış rezervasyonlar için ödeme yapılabilir." });

            // Zaten ödenmiş mi kontrol et
            if (reservation.IsPaid)
                return BadRequest(new { success = false, message = "Bu rezervasyon için ödeme zaten yapılmış." });

            // Tutar kontrolü
            if (request.Amount != reservation.TotalPrice)
                return BadRequest(new { success = false, message = "Ödeme tutarı eşleşmiyor." });

            // Kart numarası validasyonu
            if (request.CardNumber.Replace(" ", "").Length != 16)
                return BadRequest(new { success = false, message = "Geçersiz kart numarası." });

            // CVV validasyonu
            if (request.CVV.Length != 3)
                return BadRequest(new { success = false, message = "CVV 3 haneli olmalıdır." });

            // Son kullanma tarihi validasyonu
            if (!int.TryParse(request.ExpiryMonth, out int month) || month < 1 || month > 12)
                return BadRequest(new { success = false, message = "Geçersiz ay." });

            if (!int.TryParse(request.ExpiryYear, out int year) || year < DateTime.Now.Year)
                return BadRequest(new { success = false, message = "Kart süresi dolmuş." });

            // Transaction ID oluştur
            var transactionId = $"TXN-{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}";

            var cardNumberClean = request.CardNumber.Replace(" ", "");

            // Mevcut payment kaydı kontrol et
            var existingPayment = await _db.Payments
                .FirstOrDefaultAsync(p => p.ReservationId == reservationId);

            if (existingPayment != null)
            {
                // Mevcut kaydı güncelle
                existingPayment.CardNumber = cardNumberClean.Substring(12);
                existingPayment.CardHolder = request.CardHolder;
                existingPayment.ExpiryMonth = request.ExpiryMonth;
                existingPayment.ExpiryYear = request.ExpiryYear;
                existingPayment.Amount = request.Amount;
                existingPayment.PaymentDate = DateTime.UtcNow;
                existingPayment.TransactionId = transactionId;
            }
            else
            {
                // Yeni payment kaydı oluştur
                var payment = new Payment
                {
                    ReservationId = reservationId,
                    CardNumber = cardNumberClean.Substring(12),
                    CardHolder = request.CardHolder,
                    ExpiryMonth = request.ExpiryMonth,
                    ExpiryYear = request.ExpiryYear,
                    Amount = request.Amount,
                    PaymentDate = DateTime.UtcNow,
                    TransactionId = transactionId
                };

                _db.Payments.Add(payment);
            }

            // Rezervasyonu güncelle
            reservation.IsPaid = true;
            reservation.PaymentDate = DateTime.UtcNow;
            reservation.TransactionId = transactionId;

            await _db.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                message = "Ödeme başarıyla alındı.",
                data = new
                {
                    transactionId = transactionId,
                    amount = request.Amount,
                    paymentDate = DateTime.UtcNow,
                    cardLastFour = cardNumberClean.Substring(12)
                }
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = $"Ödeme işlenirken hata: {ex.Message}" });
        }
    }

    // GET /api/Payments/reservation/{reservationId} - Rezervasyon ödeme detayı
    [HttpGet("reservation/{reservationId}")]
    public async Task<IActionResult> GetPaymentByReservation(int reservationId)
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier) 
                          ?? User.FindFirst(JwtRegisteredClaimNames.Sub);
        
        if (userIdClaim == null)
            return Unauthorized(new { success = false, message = "Kullanıcı doğrulanamadı." });

        var userId = int.Parse(userIdClaim.Value);

        var payment = await _db.Payments
            .Include(p => p.Reservation)
            .Where(p => p.ReservationId == reservationId)
            .FirstOrDefaultAsync();

        if (payment == null)
            return NotFound(new { success = false, message = "Ödeme bulunamadı." });

        // Sadece kendi rezervasyonunun ödemesini görebilir
        if (payment.Reservation!.GuestId != userId && payment.Reservation.HostId != userId)
            return Forbid();

        return Ok(new
        {
            success = true,
            data = new PaymentResponse
            {
                Id = payment.Id,
                ReservationId = payment.ReservationId,
                CardNumber = $"**** **** **** {payment.CardNumber}",
                CardHolder = payment.CardHolder,
                Amount = payment.Amount,
                PaymentDate = payment.PaymentDate,
                TransactionId = payment.TransactionId
            }
        });
    }

    // GET /api/Payments/my-payments - Kullanıcının tüm ödemeleri
    [HttpGet("my-payments")]
    public async Task<IActionResult> GetMyPayments()
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier) 
                          ?? User.FindFirst(JwtRegisteredClaimNames.Sub);
        
        if (userIdClaim == null)
            return Unauthorized(new { success = false, message = "Kullanıcı doğrulanamadı." });

        var userId = int.Parse(userIdClaim.Value);

        var payments = await _db.Payments
            .Include(p => p.Reservation)
                .ThenInclude(r => r!.Listing)
            .Where(p => p.Reservation!.GuestId == userId)
            .OrderByDescending(p => p.PaymentDate)
            .Select(p => new
            {
                p.Id,
                p.ReservationId,
                ListingTitle = p.Reservation!.Listing!.Title,
                CardNumber = $"**** **** **** {p.CardNumber}",
                p.CardHolder,
                p.Amount,
                p.PaymentDate,
                p.TransactionId
            })
            .ToListAsync();

        return Ok(new { success = true, data = payments });
    }
}
