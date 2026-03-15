namespace StayIn.Api.Models
{
    public class Listing
    {
        public int Id { get; set; }
        public int? UserId { get; set; }
        public User? User { get; set; }
        public string PlaceType { get; set; } = string.Empty;
        public string AccommodationType { get; set; } = string.Empty;
        public int Guests { get; set; }
        public int Bedrooms { get; set; }
        public int Beds { get; set; }
        public int Bathrooms { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string AddressCountry { get; set; } = string.Empty;
        public string AddressCity { get; set; } = string.Empty;
        public string AddressDistrict { get; set; } = string.Empty;
        public string AddressStreet { get; set; } = string.Empty;
        public string? AddressBuilding { get; set; }
        public string? AddressPostalCode { get; set; }
        public string? AddressRegion { get; set; }
        public List<string> Amenities { get; set; } = new List<string>();
        public List<string> PhotoUrls { get; set; } = new List<string>();
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsArchived { get; set; } = false;
        
        // Navigation properties
        public List<Review> Reviews { get; set; } = new List<Review>();
    }
}