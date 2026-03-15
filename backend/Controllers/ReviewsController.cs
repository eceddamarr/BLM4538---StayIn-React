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
public class ReviewsController : ControllerBase
{
    private readonly AppDbContext _db;

    public ReviewsController(AppDbContext db)
    {
        _db = db;
    }

    // POST /api/Reviews - Yorum oluştur
    [HttpPost]
    public async Task<IActionResult> CreateReview([FromBody] CreateReviewRequest request)
    {
        // Token'dan kullanıcı ID'sini al
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier) 
                          ?? User.FindFirst(JwtRegisteredClaimNames.Sub);
        
        if (userIdClaim == null)
            return Unauthorized(new { success = false, message = "Kullanıcı doğrulanamadı." });

        var userId = int.Parse(userIdClaim.Value);

        // Validasyon
        if (request.Rating < 1 || request.Rating > 5)
            return BadRequest(new { success = false, message = "Puan 1-5 arasında olmalıdır." });

        if (string.IsNullOrWhiteSpace(request.Comment))
            return BadRequest(new { success = false, message = "Yorum alanı gereklidir." });

        // Rezervasyonu kontrol et
        var reservation = await _db.Reservations
            .Include(r => r.Listing)
            .FirstOrDefaultAsync(r => r.Id == request.ReservationId);

        if (reservation == null)
            return NotFound(new { success = false, message = "Rezervasyon bulunamadı." });

        // Sadece konuk yorum yapabilir
        if (reservation.GuestId != userId)
            return Forbid();

        // Rezervasyon onaylanmış ve tamamlanmış mı?
        if (reservation.Status != "Approved")
            return BadRequest(new { success = false, message = "Sadece onaylanmış rezervasyonlar için yorum yapılabilir." });

        // Check-out tarihi geçmiş mi?
        if (reservation.CheckOutDate > DateTime.UtcNow)
            return BadRequest(new { success = false, message = "Sadece tamamlanmış rezervasyonlar için yorum yapılabilir." });

        // Bu rezervasyon için daha önce yorum yapılmış mı?
        var existingReview = await _db.Reviews.AnyAsync(r => r.ReservationId == request.ReservationId);
        if (existingReview)
            return BadRequest(new { success = false, message = "Bu rezervasyon için zaten yorum yapmışsınız." });

        // Yorum oluştur
        var review = new Review
        {
            ListingId = reservation.ListingId,
            GuestId = userId,
            ReservationId = request.ReservationId,
            Rating = request.Rating,
            Comment = request.Comment,
            CreatedAt = DateTime.UtcNow
        };

        _db.Reviews.Add(review);
        await _db.SaveChangesAsync();

        return Ok(new
        {
            success = true,
            message = "Yorumunuz başarıyla eklendi.",
            review = new
            {
                review.Id,
                review.ListingId,
                review.Rating,
                review.Comment,
                review.CreatedAt
            }
        });
    }

    // GET /api/Reviews/listing/{listingId} - İlan yorumlarını listele
    [HttpGet("listing/{listingId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetListingReviews(int listingId)
    {
        // İlan var mı kontrol et
        var listingExists = await _db.Listings.AnyAsync(l => l.Id == listingId);
        if (!listingExists)
            return NotFound(new { success = false, message = "İlan bulunamadı." });

        // Yorumları getir
        var reviews = await _db.Reviews
            .Where(r => r.ListingId == listingId)
            .Include(r => r.Guest)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new ReviewResponse
            {
                Id = r.Id,
                ListingId = r.ListingId,
                GuestId = r.GuestId,
                GuestName = r.Guest!.FullName,
                Rating = r.Rating,
                Comment = r.Comment,
                CreatedAt = r.CreatedAt
            })
            .ToListAsync();

        // Ortalama puan hesapla
        var averageRating = reviews.Any() ? reviews.Average(r => r.Rating) : 0;

        return Ok(new
        {
            success = true,
            data = new ListingReviewSummary
            {
                TotalReviews = reviews.Count,
                AverageRating = Math.Round(averageRating, 1),
                Reviews = reviews
            }
        });
    }

    // GET /api/Reviews/my-reviews - Kullanıcının yaptığı yorumlar
    [HttpGet("my-reviews")]
    public async Task<IActionResult> GetMyReviews()
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier) 
                          ?? User.FindFirst(JwtRegisteredClaimNames.Sub);
        
        if (userIdClaim == null)
            return Unauthorized(new { success = false, message = "Kullanıcı doğrulanamadı." });

        var userId = int.Parse(userIdClaim.Value);

        var reviews = await _db.Reviews
            .Where(r => r.GuestId == userId)
            .Include(r => r.Listing)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new
            {
                r.Id,
                r.ListingId,
                ListingTitle = r.Listing!.Title,
                r.ReservationId,
                r.Rating,
                r.Comment,
                r.CreatedAt
            })
            .ToListAsync();

        return Ok(new { success = true, data = reviews });
    }

    // DELETE /api/Reviews/{id} - Yorumu sil
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteReview(int id)
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier) 
                          ?? User.FindFirst(JwtRegisteredClaimNames.Sub);
        
        if (userIdClaim == null)
            return Unauthorized(new { success = false, message = "Kullanıcı doğrulanamadı." });

        var userId = int.Parse(userIdClaim.Value);

        var review = await _db.Reviews.FindAsync(id);
        if (review == null)
            return NotFound(new { success = false, message = "Yorum bulunamadı." });

        // Sadece yorum sahibi silebilir
        if (review.GuestId != userId)
            return Forbid();

        _db.Reviews.Remove(review);
        await _db.SaveChangesAsync();

        return Ok(new { success = true, message = "Yorum başarıyla silindi." });
    }

    // PUT /api/Reviews/{id} - Yorumu güncelle
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateReview(int id, [FromBody] CreateReviewRequest request)
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier) 
                          ?? User.FindFirst(JwtRegisteredClaimNames.Sub);
        
        if (userIdClaim == null)
            return Unauthorized(new { success = false, message = "Kullanıcı doğrulanamadı." });

        var userId = int.Parse(userIdClaim.Value);

        var review = await _db.Reviews.FindAsync(id);
        if (review == null)
            return NotFound(new { success = false, message = "Yorum bulunamadı." });

        // Sadece yorum sahibi güncelleyebilir
        if (review.GuestId != userId)
            return Forbid();

        // Validasyon
        if (request.Rating < 1 || request.Rating > 5)
            return BadRequest(new { success = false, message = "Puan 1-5 arasında olmalıdır." });

        if (string.IsNullOrWhiteSpace(request.Comment))
            return BadRequest(new { success = false, message = "Yorum alanı gereklidir." });

        // Güncelle
        review.Rating = request.Rating;
        review.Comment = request.Comment;

        await _db.SaveChangesAsync();

        return Ok(new
        {
            success = true,
            message = "Yorum başarıyla güncellendi.",
            review = new
            {
                review.Id,
                review.Rating,
                review.Comment,
                review.CreatedAt
            }
        });
    }
}
