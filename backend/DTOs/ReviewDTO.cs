namespace StayIn.Api.DTOs;

// Yorum oluşturma için
public class CreateReviewRequest
{
    public int ReservationId { get; set; }
    public int Rating { get; set; } // 1-5
    public string Comment { get; set; } = string.Empty;
}

// Yorum yanıtı
public class ReviewResponse
{
    public int Id { get; set; }
    public int ListingId { get; set; }
    public int GuestId { get; set; }
    public string GuestName { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

// İlan için yorum özeti
public class ListingReviewSummary
{
    public int TotalReviews { get; set; }
    public double AverageRating { get; set; }
    public List<ReviewResponse> Reviews { get; set; } = new();
}
