using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace StayIn.Api.Controllers
{
    public class Base64UploadRequest
    {
        public string Base64Data { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public string MimeType { get; set; } = string.Empty;
    }

    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UploadController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;
        private readonly ILogger<UploadController> _logger;

        public UploadController(IWebHostEnvironment env, ILogger<UploadController> logger)
        {
            _env = env;
            _logger = logger;
        }

        [HttpPost("photo-base64")]
        public async Task<IActionResult> UploadPhotoBase64([FromBody] Base64UploadRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.Base64Data))
                {
                    return BadRequest(new { message = "Base64 verisi boş" });
                }

                // Base64'ü byte array'e çevir
                byte[] imageBytes = Convert.FromBase64String(request.Base64Data);

                // Dosya boyutu kontrolü (10MB)
                if (imageBytes.Length > 10 * 1024 * 1024)
                {
                    return BadRequest(new { message = "Dosya boyutu 10MB'dan büyük olamaz" });
                }

                // Uzantıyı belirle
                var extension = Path.GetExtension(request.FileName).ToLowerInvariant();
                if (string.IsNullOrEmpty(extension))
                {
                    extension = request.MimeType switch
                    {
                        "image/png" => ".png",
                        "image/gif" => ".gif",
                        "image/webp" => ".webp",
                        _ => ".jpg"
                    };
                }

                // Uploads klasörünü oluştur
                var uploadsFolder = Path.Combine(_env.ContentRootPath, "wwwroot", "uploads");
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                // Benzersiz dosya adı oluştur
                var fileName = $"{Guid.NewGuid()}{extension}";
                var filePath = Path.Combine(uploadsFolder, fileName);

                // Dosyayı kaydet
                await System.IO.File.WriteAllBytesAsync(filePath, imageBytes);

                // URL oluştur
                var baseUrl = $"{Request.Scheme}://{Request.Host}";
                var fileUrl = $"{baseUrl}/uploads/{fileName}";

                return Ok(new { url = fileUrl, fileName });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Base64 fotoğraf yüklenirken hata oluştu");
                return StatusCode(500, new { message = "Fotoğraf yüklenirken hata oluştu", error = ex.Message });
            }
        }

        [HttpPost("photo")]
        public async Task<IActionResult> UploadPhoto(IFormFile file)
        {
            try
            {
                _logger.LogInformation($"Upload request received. File is null: {file == null}");

                if (file == null || file.Length == 0)
                {
                    _logger.LogWarning("No file received or file is empty");
                    return BadRequest(new { message = "Dosya seçilmedi veya dosya boş" });
                }

                _logger.LogInformation($"File received: {file.FileName}, Size: {file.Length}, ContentType: {file.ContentType}");

                // Dosya türü kontrolü
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
                var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

                if (!allowedExtensions.Contains(extension))
                {
                    return BadRequest(new { message = "Sadece resim dosyaları yüklenebilir (jpg, jpeg, png, gif, webp)" });
                }

                // Dosya boyutu kontrolü (10MB)
                if (file.Length > 10 * 1024 * 1024)
                {
                    return BadRequest(new { message = "Dosya boyutu 10MB'dan büyük olamaz" });
                }

                // Uploads klasörünü oluştur
                var uploadsFolder = Path.Combine(_env.ContentRootPath, "wwwroot", "uploads");
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                // Benzersiz dosya adı oluştur
                var fileName = $"{Guid.NewGuid()}{extension}";
                var filePath = Path.Combine(uploadsFolder, fileName);

                // Dosyayı kaydet
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // URL oluştur
                var baseUrl = $"{Request.Scheme}://{Request.Host}";
                var fileUrl = $"{baseUrl}/uploads/{fileName}";

                return Ok(new { url = fileUrl, fileName });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Dosya yüklenirken hata oluştu");
                return StatusCode(500, new { message = "Dosya yüklenirken hata oluştu", error = ex.Message });
            }
        }

        [HttpPost("photos")]
        public async Task<IActionResult> UploadPhotos([FromForm] List<IFormFile> files)
        {
            try
            {
                if (files == null || files.Count == 0)
                {
                    return BadRequest(new { message = "Dosya seçilmedi" });
                }

                if (files.Count > 10)
                {
                    return BadRequest(new { message = "Maksimum 10 fotoğraf yüklenebilir" });
                }

                var uploadedUrls = new List<string>();
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };

                // Uploads klasörünü oluştur
                var uploadsFolder = Path.Combine(_env.ContentRootPath, "wwwroot", "uploads");
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                foreach (var file in files)
                {
                    if (file.Length == 0) continue;

                    // Dosya türü kontrolü
                    var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
                    if (!allowedExtensions.Contains(extension))
                    {
                        continue; // Geçersiz dosyaları atla
                    }

                    // Dosya boyutu kontrolü (10MB)
                    if (file.Length > 10 * 1024 * 1024)
                    {
                        continue; // Büyük dosyaları atla
                    }

                    // Benzersiz dosya adı oluştur
                    var fileName = $"{Guid.NewGuid()}{extension}";
                    var filePath = Path.Combine(uploadsFolder, fileName);

                    // Dosyayı kaydet
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await file.CopyToAsync(stream);
                    }

                    // URL oluştur
                    var baseUrl = $"{Request.Scheme}://{Request.Host}";
                    var fileUrl = $"{baseUrl}/uploads/{fileName}";
                    uploadedUrls.Add(fileUrl);
                }

                if (uploadedUrls.Count == 0)
                {
                    return BadRequest(new { message = "Geçerli dosya bulunamadı" });
                }

                return Ok(new { urls = uploadedUrls, count = uploadedUrls.Count });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Dosyalar yüklenirken hata oluştu");
                return StatusCode(500, new { message = "Dosyalar yüklenirken hata oluştu", error = ex.Message });
            }
        }
    }
}
