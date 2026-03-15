using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using StayIn.Api.Data;
using StayIn.Api.Models;
using StayIn.Api.DTOs;
using System.Security.Claims;

namespace StayIn.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ListingController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ListingController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Listing/all
        [HttpGet("all")]
        public async Task<IActionResult> GetAllListings()
        {
            try
            {
                var listings = await _context.Listings
                    .Where(l => !l.IsArchived)  // Arşivlenmiş ilanları gösterme
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
                        l.UserId,  
                        l.IsArchived,
                        l.CreatedAt
                    })
                    .ToListAsync();

                return Ok(listings);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = $"İlanlar getirilemedi: {ex.Message}" });
            }
        }
    
        // GET: api/Listing/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetListingById(int id)
        {
            try
            {
                var listing = await _context.Listings
                    .Where(l => l.Id == id)
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
                        l.UserId,
                        l.CreatedAt
                    })
                    .FirstOrDefaultAsync();

                if (listing == null)
                {
                    return NotFound(new { message = "İlan bulunamadı" });
                }

                return Ok(listing);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = $"İlan getirilemedi: {ex.Message}" });
            }
        }

        
    
    
    }
}