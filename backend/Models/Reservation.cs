using System;

namespace StayIn.Api.Models
{
    public class Reservation
    {
        public int Id { get; set; }
        public int ListingId { get; set; }
        public int GuestId { get; set; }
        public int HostId { get; set; }
        public DateTime CheckInDate { get; set; }
        public DateTime CheckOutDate { get; set; }
        public int Guests { get; set; }
        public decimal TotalPrice { get; set; }
        public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected, Cancelled
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ResponsedAt { get; set; }
        
        // Payment status
        public bool IsPaid { get; set; } = false;
        
        // Navigation properties
        public Listing? Listing { get; set; }
        public User? Guest { get; set; }
        public User? Host { get; set; }
        public Payment? Payment { get; set; }
    }
}
