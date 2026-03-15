namespace StayIn.Api.DTOs;

// Ödeme isteği
public class PaymentRequest
{
    public string CardNumber { get; set; } = default!;  // 16 hane
    public string CardHolder { get; set; } = default!;
    public string ExpiryMonth { get; set; } = default!; // 01-12
    public string ExpiryYear { get; set; } = default!;  // 2024
    public string CVV { get; set; } = default!;          // 3-4 hane
    public decimal Amount { get; set; }
}

// Ödeme yanıtı
public class PaymentResponse
{
    public int Id { get; set; }
    public int ReservationId { get; set; }
    public string CardNumber { get; set; } = default!;  // Son 4 hane
    public string CardHolder { get; set; } = default!;
    public decimal Amount { get; set; }
    public DateTime PaymentDate { get; set; }
    public string TransactionId { get; set; } = default!;
}
