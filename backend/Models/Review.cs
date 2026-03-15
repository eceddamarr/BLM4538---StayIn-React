using System.ComponentModel.DataAnnotations;

namespace StayIn.Api.Models;

public class Review
{
    public int Id { get; set; }
    
    [Required]
    public int ListingId { get; set; }
    
    [Required]
    public int GuestId { get; set; }
    
    [Required]
    public int ReservationId { get; set; }
    
    [Required]
    [Range(1, 5)]
    public int Rating { get; set; } // 1-5 yıldız
    
    [Required]
    [MaxLength(1000)]
    public string Comment { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public Listing? Listing { get; set; }
    public User? Guest { get; set; }
    public Reservation? Reservation { get; set; }
}
