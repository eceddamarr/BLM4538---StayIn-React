namespace StayIn.Api.Services;

public interface IEmailService
{
    Task SendVerificationCodeAsync(string toEmail, string code);
}

// Mock Email Service - Gerçekten e-posta göndermez
public class MockEmailService : IEmailService
{
    private readonly ILogger<MockEmailService> _logger;  //LOgger uygulama içindeki mesajları consolea yazmak için kullanılır

    public MockEmailService(ILogger<MockEmailService> logger)
    {
        _logger = logger; // Logger'ı başlat
    }

    public Task SendVerificationCodeAsync(string toEmail, string code)
    {
        _logger.LogInformation("========================================");
        _logger.LogInformation("E-POSTA GÖNDERİLDİ (MOCK)");
        _logger.LogInformation("Alıcı: {Email}", toEmail);
        _logger.LogInformation("Doğrulama Kodu: {Code}", code);
        _logger.LogInformation("Geçerlilik: 10 dakika");
        _logger.LogInformation("========================================");
        
        return Task.CompletedTask;
    }
}
