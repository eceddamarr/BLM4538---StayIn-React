using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StayIn.Api.Data;

namespace StayIn.Api.Controllers
{
    [ApiController] 
    [Route("api/[controller]")] 
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UserController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/User/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(int id)
        {
            try
            {
                var user = await _context.Users.FindAsync(id);
                
                if (user == null)
                {
                    return NotFound(new { message = "Kullanıcı bulunamadı" });
                }
                
                return Ok(new 
                { 
                    id = user.Id, 
                    fullName = user.FullName,
                    email = user.Email
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = $"Kullanıcı bilgisi alınamadı: {ex.Message}" });
            }
        }
    }
}