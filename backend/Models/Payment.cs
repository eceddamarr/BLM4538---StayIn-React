using System.ComponentModel.DataAnnotations;

namespace StayIn.Api.Models;

public class Payment
{
    public int Id { get; set; }
    
    [Required]
    public int ReservationId { get; set; }
    
    [Required]
    [MaxLength(4)]
    public string CardNumber { get; set; } = default!;  // Son 4 hane
    
    [Required]
    [MaxLength(100)]
    public string CardHolder { get; set; } = default!;
    
    [Required]
    [StringLength(2)]
    public string ExpiryMonth { get; set; } = default!;
    
    [Required]
    [StringLength(4)]
    public string ExpiryYear { get; set; } = default!;
    
    [Required]
    public decimal Amount { get; set; }
    
    public DateTime PaymentDate { get; set; } = DateTime.UtcNow;
    
    [Required]
    [MaxLength(50)]
    public string TransactionId { get; set; } = default!;
    
    // Navigation property
    public Reservation? Reservation { get; set; }
}
