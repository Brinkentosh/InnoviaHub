using Backend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ResourceController : ControllerBase
    {
        private readonly InnoviaHubDB _context;

        public ResourceController(InnoviaHubDB context)
        {
            _context = context;
        }

        // GET: api/resource
        // Hämtar alla resurser med deras tillhörande timeslots och sensorer
        [HttpGet]
        public async Task<IActionResult> GetResources()
        {
            try
            {
                var resources = await _context.Resources
                    .Include(r => r.Timeslots)
                    .Include(r => r.Sensors)
                    .ToListAsync();

                return Ok(resources);
            }
            catch (Exception ex)
            {
                // Logga felet här om du har ett loggningssystem
                return StatusCode(500, $"Ett fel inträffade: {ex.Message}");
            }
        }

        // GET: api/resource/{id}
        // Hämtar en specifik resurs med tillhörande timeslots och sensorer
        [HttpGet("{id}")]
        public async Task<IActionResult> GetResource(int id)
        {
            try
            {
                var resource = await _context.Resources
                    .Include(r => r.Timeslots)
                    .Include(r => r.Sensors)
                    .FirstOrDefaultAsync(r => r.ResourceId == id);

                if (resource == null)
                    return NotFound($"Resurs med id {id} hittades inte.");

                return Ok(resource);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Ett fel inträffade: {ex.Message}");
            }
        }
    }
}