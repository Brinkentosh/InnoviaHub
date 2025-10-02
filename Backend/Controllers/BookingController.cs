using InnoviaHub.Models;
using Microsoft.AspNetCore.Mvc;
using Backend.Services;
using Backend.Data;
using InnoviaHub.Hubs;
using Microsoft.AspNetCore.SignalR;
using InnoviaHub.DTOs;
using Microsoft.EntityFrameworkCore;


namespace InnoviaHub.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookingController : ControllerBase
    {
        private readonly InnoviaHubDB _context;
        private readonly BookingService _bookingService;
        private readonly IHubContext<BookingHub> _hubContext;
        private readonly OpenAiService _openAiService;



        public BookingController(InnoviaHubDB context, BookingService bookingService, IHubContext<BookingHub> hubContext, OpenAiService openAiService)
        {
            _context = context;
            _bookingService = bookingService;
            _hubContext = hubContext;
            _openAiService = openAiService;

        }


        // GET api/bookings
        [HttpGet]
        public ActionResult<IEnumerable<Booking>> GetBookings()
        {
            return _bookingService.GetAllBookings();
        }

        [HttpGet("user/{userId}")]
        public ActionResult<List<Booking>> GetBookingsByUser(string userId)
        {
            var bookings = _bookingService.GetBookingsByUser(userId);
            return Ok(bookings);
        }

        // POST api
        [HttpPost]
        public async Task<ActionResult<Booking>> CreateBooking([FromBody] CreateBookingDTO dto)
        {
            Console.WriteLine($"POST Booking: ResourceId={dto.ResourceId}, UserId={dto.UserId}, Start={dto.StartTime}, End={dto.EndTime}");

            if (!ModelState.IsValid)
            {
                foreach (var kvp in ModelState)
                {
                    var field = kvp.Key;
                    foreach (var error in kvp.Value.Errors)
                    {
                        Console.WriteLine($"Model error on '{field}': {error.ErrorMessage}");
                    }
                }

                return BadRequest(ModelState);
            }

            TimeZoneInfo swedishTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Central European Standard Time");

            var startTimeInSweden = TimeZoneInfo.ConvertTime(dto.StartTime, swedishTimeZone);
            var endTimeInSweden = TimeZoneInfo.ConvertTime(dto.EndTime, swedishTimeZone);

            // Control overlapping
            if (!_bookingService.IsBookingAvailable(dto.ResourceId, startTimeInSweden, endTimeInSweden))
                return Conflict("Booking overlaps with an existing one.");

            var nowInSweden = TimeZoneInfo.ConvertTime(DateTime.Now, swedishTimeZone);
            if (startTimeInSweden < nowInSweden)
                return BadRequest("Start time must be in the future.");

            // Create booking
            var booking = new Booking
            {
                UserId = dto.UserId,
                ResourceId = dto.ResourceId,
                BookingType = dto.BookingType,
                StartTime = dto.StartTime.ToUniversalTime(),
                EndTime = dto.EndTime.ToUniversalTime(),
                DateOfBooking = DateTime.Now
            };


            _bookingService.CreateBooking(booking);
            Console.WriteLine("📡 Sending SignalR update...");
            await _hubContext.Clients.All.SendAsync("ReceiveBookingUpdate", new BookingUpdate
            {
                ResourceId = booking.ResourceId,
                Date = booking.StartTime.ToString("yyyy-MM-dd")
            });

            return Ok(booking);
        }


        // DELETE
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBooking(int id)
        {
            var booking = _bookingService.GetAllBookings().FirstOrDefault(b => b.BookingId == id);
            if (booking == null)
                return NotFound();

            if (!_bookingService.DeleteBooking(id))
                return NotFound();

            // To update with signalR when deleteBooking
            await _hubContext.Clients.All.SendAsync("ReceiveBookingUpdate", new BookingUpdate
            {
                ResourceId = booking.ResourceId,
                Date = booking.StartTime.ToString("yyyy-MM-dd")
            });

            return NoContent();

        }

        // PUT 
        [HttpPut("{id}")]
        public IActionResult UpdateBooking(int id, [FromBody] Booking booking)
        {
            if (!_bookingService.UpdateBooking(id, booking))
                return NotFound();

            return NoContent();
        }

        [HttpGet("ResourceAvailability")]
        public ActionResult GetResourceAvailability()
        {
            try
            {
                Console.WriteLine("🚀 Entering ResourceAvailability");

                TimeZoneInfo swedishTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Europe/Stockholm");
                DateTime nowUtc = DateTime.UtcNow;

                Console.WriteLine($"🕒 Now UTC: {nowUtc}");

                var resources = _context.Resources
                    .Include(r => r.Timeslots)
                    .ToList();

                Console.WriteLine($"🔍 Loaded {resources.Count} resources");

                var availability = resources
                    .GroupBy(r => r.ResourceType)
                    .ToDictionary(
                        g => g.Key.ToString(),
                        g => g.Count(r =>
                            !_context.Bookings.Any(b =>
                                b.ResourceId == r.ResourceId &&
                                b.StartTime <= nowUtc &&
                                b.EndTime > nowUtc
                            )
                        )
                    );

                return Ok(availability);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Exception: {ex.Message}");
                Console.WriteLine(ex.StackTrace);
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        [HttpPost("InterpretBookingRequest")]
        public async Task<IActionResult> InterpretBookingRequest([FromBody] InterpretBookingDTO input)
        {
            var availableTimes = _bookingService.GetAvailableTimeslots();

            var prompt = _openAiService.BuildPrompt(input.UserInput, availableTimes);

            var response = await _openAiService.GetChatResponse(prompt);

            return Ok(response);
        }

    }
}