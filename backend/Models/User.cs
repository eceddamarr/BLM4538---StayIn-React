using System.ComponentModel.DataAnnotations;

namespace StayIn.Api.Models;

public class User
{
    public int Id { get; set; }

    public string FullName { get; set; } = default!;
    public string Email { get; set; } = default!;
    public string PhoneNumber { get; set; } = default!; 
    // hashlenmiş şifre
    public string PasswordHash { get; set; } = default!;
    public string Role { get; set; } = "User";
    // Email doğrulama / şifre sıfırlama için
    public string? VerificationCode { get; set; }
    public DateTime? VerificationCodeExpires { get; set; }

    // Favori ilanların ID'leri (JSON array olarak saklanacak)
    public List<int> Favorites { get; set; } = new List<int>();
    
    // Kullanıcının oluşturduğu ilanlar
    public List<Listing> Listings { get; set; } = new List<Listing>();
}
