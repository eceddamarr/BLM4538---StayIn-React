using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StayIn.Api.Data;
using System.Security.Claims;

namespace StayIn.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Tüm eylemler için kimlik doğrulama gerektir
    public class FavoritesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public FavoritesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Favorites - Kullanıcının tüm favorilerini getir
        [HttpGet]
        public async Task<IActionResult> GetFavorites()
        {
            // Sub claim'ini farklı yollardan dene
            var userIdClaim = User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value
                ?? User.FindFirst("sub")?.Value
                ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new { message = "Kullanıcı kimliği bulunamadı." });
            }

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return NotFound(new { message = "Kullanıcı bulunamadı." });
            }

            // Favori ilan ID'lerini al
            var favoriteIds = user.Favorites ?? new List<int>();

            // Favori ilanların detaylarını getir
            var favoriteListings = await _context.Listings
                .Where(l => favoriteIds.Contains(l.Id))
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
                        l.AddressStreet
                    },
                    l.PhotoUrls,
                    l.Latitude,
                    l.Longitude
                })
                .ToListAsync();

            return Ok(new { favorites = favoriteListings });
        }

        // POST: api/Favorites/{listingId} - Favorilere ekle
        [HttpPost("{listingId}")]
        public async Task<IActionResult> AddToFavorites(int listingId)
        {
            var userIdClaim = User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value
                ?? User.FindFirst("sub")?.Value
                ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new { message = "Kullanıcı kimliği bulunamadı." });
            }

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return NotFound(new { message = "Kullanıcı bulunamadı." });
            }

            // İlan var mı kontrol et
            var listing = await _context.Listings.FindAsync(listingId);
            if (listing == null)
            {
                return NotFound(new { message = "İlan bulunamadı." });
            }

            // Zaten favorilerde mi kontrol et
            if (user.Favorites.Contains(listingId))
            {
                return BadRequest(new { message = "Bu ilan zaten favorilerinizde." });
            }

            // Favorilere ekle
            user.Favorites.Add(listingId);
            
            // Entity Framework'ün List değişikliğini algılaması için
            _context.Entry(user).Property(u => u.Favorites).IsModified = true;
            await _context.SaveChangesAsync();

            return Ok(new { message = "İlan favorilere eklendi.", favorites = user.Favorites });
        }

        // DELETE: api/Favorites/{listingId} - Favorilerden çıkar
        [HttpDelete("{listingId}")]
        public async Task<IActionResult> RemoveFromFavorites(int listingId)
        {
            var userIdClaim = User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value
                ?? User.FindFirst("sub")?.Value
                ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new { message = "Kullanıcı kimliği bulunamadı." });
            }

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return NotFound(new { message = "Kullanıcı bulunamadı." });
            }

            // Favorilerde var mı kontrol et
            if (!user.Favorites.Contains(listingId))
            {
                return BadRequest(new { message = "Bu ilan favorilerinizde değil." });
            }

            // Favorilerden çıkar
            user.Favorites.Remove(listingId);
            
            // Entity Framework'ün List değişikliğini algılaması için
            _context.Entry(user).Property(u => u.Favorites).IsModified = true;
            await _context.SaveChangesAsync();

            return Ok(new { message = "İlan favorilerden çıkarıldı.", favorites = user.Favorites });
        }

        // GET: api/Favorites/check/{listingId} - İlan favorilerde mi kontrol et
        [HttpGet("check/{listingId}")]
        public async Task<IActionResult> IsFavorite(int listingId)
        {
            var userIdClaim = User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value
                ?? User.FindFirst("sub")?.Value
                ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new { message = "Kullanıcı kimliği bulunamadı." });
            }

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return NotFound(new { message = "Kullanıcı bulunamadı." });
            }

            var isFavorite = user.Favorites.Contains(listingId);
            return Ok(new { isFavorite });
        }
    }
}
