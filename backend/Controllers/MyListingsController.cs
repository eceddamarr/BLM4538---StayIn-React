using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StayIn.Api.Data;
using StayIn.Api.Models;
using StayIn.Api.DTOs;
using System.Security.Claims;

namespace StayIn.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Tüm eylemler için kimlik doğrulama gerektir
    public class MyListingsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MyListingsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/MyListings - Kullanıcının kendi ilanlarını getir
        [HttpGet]
        public async Task<IActionResult> GetMyListings()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value
                ?? User.FindFirst("sub")?.Value
                ?? User.FindFirst("userId")?.Value;
                
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new { message = "Kullanıcı kimliği bulunamadı." });
            }

            var myListings = await _context.Listings
                .Where(l => l.UserId.HasValue && l.UserId.Value == userId && !l.IsArchived)
                .OrderByDescending(l => l.CreatedAt)
                .Select(l => new
                {
                    l.Id,
                    l.Title,
                    l.Description,
                    l.PlaceType,
                    l.AccommodationType,
                    l.Guests,
                    l.Bedrooms,
                    l.Beds,
                    l.Bathrooms,
                    l.Price,
                    Address = new
                    {
                        l.AddressCountry,
                        l.AddressCity,
                        l.AddressDistrict,
                        l.AddressStreet,
                        l.AddressBuilding,
                        l.AddressPostalCode,
                        l.AddressRegion
                    },
                    l.Amenities,
                    l.PhotoUrls,
                    l.Latitude,
                    l.Longitude,
                    l.IsArchived,
                    l.CreatedAt
                })
                .ToListAsync();

            return Ok(new { listings = myListings });
        }

        // GET: api/MyListings/archived - Arşivlenmiş ilanları getir
        [HttpGet("archived")]
        public async Task<IActionResult> GetArchivedListings()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value
                ?? User.FindFirst("sub")?.Value
                ?? User.FindFirst("userId")?.Value;
                
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new { message = "Kullanıcı kimliği bulunamadı." });
            }

            var archivedListings = await _context.Listings
                .Where(l => l.UserId.HasValue && l.UserId.Value == userId && l.IsArchived)
                .OrderByDescending(l => l.CreatedAt)
                .Select(l => new
                {
                    l.Id,
                    l.Title,
                    l.Description,
                    l.PlaceType,
                    l.AccommodationType,
                    l.Guests,
                    l.Bedrooms,
                    l.Beds,
                    l.Bathrooms,
                    l.Price,
                    Address = new
                    {
                        l.AddressCountry,
                        l.AddressCity,
                        l.AddressDistrict,
                        l.AddressStreet,
                        l.AddressBuilding,
                        l.AddressPostalCode,
                        l.AddressRegion
                    },
                    l.Amenities,
                    l.PhotoUrls,
                    l.Latitude,
                    l.Longitude,
                    l.CreatedAt,
                    l.IsArchived
                })
                .ToListAsync();

            return Ok(new { listings = archivedListings });
        }

        // POST: api/MyListings - Yeni ilan oluştur
        [HttpPost]
        public async Task<IActionResult> CreateListing([FromBody] ListingDTO dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value
                ?? User.FindFirst("sub")?.Value
                ?? User.FindFirst("userId")?.Value;
                
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new { message = "Kullanıcı kimliği bulunamadı." });
            }

            var listing = new Listing
            {
                UserId = userId,
                PlaceType = dto.PlaceType,
                AccommodationType = dto.AccommodationType,
                Guests = dto.Guests,
                Bedrooms = dto.Bedrooms,
                Beds = dto.Beds,
                Bathrooms = dto.Bathrooms,
                Title = dto.Title,
                Description = dto.Description,
                Price = dto.Price,
                AddressCountry = dto.AddressCountry,
                AddressCity = dto.AddressCity,
                AddressDistrict = dto.AddressDistrict,
                AddressStreet = dto.AddressStreet,
                AddressBuilding = dto.AddressBuilding,
                AddressPostalCode = dto.AddressPostalCode,
                AddressRegion = dto.AddressRegion,
                Amenities = dto.Amenities,
                PhotoUrls = dto.PhotoUrls,
                Latitude = dto.Latitude,
                Longitude = dto.Longitude,
                CreatedAt = DateTime.UtcNow
            };

            _context.Listings.Add(listing);
            await _context.SaveChangesAsync();

            return Ok(new { message = "İlan başarıyla oluşturuldu.", listing });
        }

        // PUT: api/MyListings/{id} - İlan güncelle
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateListing(int id, [FromBody] ListingDTO dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value
                ?? User.FindFirst("sub")?.Value
                ?? User.FindFirst("userId")?.Value;
                
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new { message = "Kullanıcı kimliği bulunamadı." });
            }

            var listing = await _context.Listings.FindAsync(id);
            if (listing == null)
            {
                return NotFound(new { message = "İlan bulunamadı." });
            }

            // Sadece kendi ilanını güncelleyebilir
            if (!listing.UserId.HasValue || listing.UserId.Value != userId)
            {
                return Forbid();
            }

            // Güncelle
            listing.PlaceType = dto.PlaceType;
            listing.AccommodationType = dto.AccommodationType;
            listing.Guests = dto.Guests;
            listing.Bedrooms = dto.Bedrooms;
            listing.Beds = dto.Beds;
            listing.Bathrooms = dto.Bathrooms;
            listing.Title = dto.Title;
            listing.Description = dto.Description;
            listing.Price = dto.Price;
            listing.AddressCountry = dto.AddressCountry;
            listing.AddressCity = dto.AddressCity;
            listing.AddressDistrict = dto.AddressDistrict;
            listing.AddressStreet = dto.AddressStreet;
            listing.AddressBuilding = dto.AddressBuilding;
            listing.AddressPostalCode = dto.AddressPostalCode;
            listing.AddressRegion = dto.AddressRegion;
            listing.Amenities = dto.Amenities;
            listing.PhotoUrls = dto.PhotoUrls;
            listing.Latitude = dto.Latitude;
            listing.Longitude = dto.Longitude;

            await _context.SaveChangesAsync();

            return Ok(new { message = "İlan başarıyla güncellendi.", listing });
        }

        // DELETE: api/MyListings/{id} - İlan sil
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteListing(int id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value
                ?? User.FindFirst("sub")?.Value
                ?? User.FindFirst("userId")?.Value;
                
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new { message = "Kullanıcı kimliği bulunamadı." });
            }

            var listing = await _context.Listings.FindAsync(id);
            if (listing == null)
            {
                return NotFound(new { message = "İlan bulunamadı." });
            }

            // Sadece kendi ilanını silebilir
            if (!listing.UserId.HasValue || listing.UserId.Value != userId)
            {
                return Forbid();
            }

            _context.Listings.Remove(listing);
            await _context.SaveChangesAsync();

            return Ok(new { message = "İlan başarıyla silindi." });
        }

        // POST: api/MyListings/{id}/archive - İlanı arşivle/arşivden çıkar
        [HttpPost("{id}/archive")]
        [Authorize]
        public async Task<IActionResult> ArchiveListing(int id)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                    ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value
                    ?? User.FindFirst("sub")?.Value
                    ?? User.FindFirst("userId")?.Value;
                    
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new { message = "Kullanıcı kimliği bulunamadı." });
                }
                
                var listing = await _context.Listings.FirstOrDefaultAsync(l => l.Id == id && l.UserId == userId);
                
                if (listing == null)
                {
                    return NotFound(new { message = "İlan bulunamadı" });
                }
                
                // Toggle archive durumu
                listing.IsArchived = !listing.IsArchived;
                await _context.SaveChangesAsync();
                
                return Ok(new { message = listing.IsArchived ? "İlan arşivlendi" : "İlan arşivden çıkarıldı" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Bir hata oluştu", error = ex.Message });
            }
        }



        // POST: api/MyListings/{id}/unarchive - İlanı arşivden çıkar
        [HttpPost("{id}/unarchive")]
        [Authorize]
        public async Task<IActionResult> UnarchiveListing(int id)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                    ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value
                    ?? User.FindFirst("sub")?.Value
                    ?? User.FindFirst("userId")?.Value;
                    
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new { message = "Kullanıcı kimliği bulunamadı." });
                }
                
                var listing = await _context.Listings.FirstOrDefaultAsync(l => l.Id == id && l.UserId == userId);
                
                if (listing == null)
                {
                    return NotFound(new { message = "İlan bulunamadı" });
                }
                
                if (!listing.IsArchived)
                {
                    return BadRequest(new { message = "Bu ilan zaten arşivde değil" });
                }
                
                listing.IsArchived = false;
                await _context.SaveChangesAsync();
                
                return Ok(new { message = "İlan arşivden çıkarıldı" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Bir hata oluştu", error = ex.Message });
            }
        }
    }
}
