using Backend.Data;
using InnoviaHub.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services
{
    public class AdminResourceService
    {
        private readonly InnoviaHubDB _context;

        public AdminResourceService(InnoviaHubDB context)
        {
            _context = context;
        }

        private List<Timeslot> GenerateDefaultSlots(int resourceId)
        {
            var slots = new List<Timeslot>();
            var startDate = DateTime.Today;
            var endDate = startDate.AddDays(30);

            var tz = TimeZoneInfo.FindSystemTimeZoneById("Europe/Stockholm");

            for (var date = startDate; date <= endDate; date = date.AddDays(1))
            {
                if (date.DayOfWeek == DayOfWeek.Saturday || date.DayOfWeek == DayOfWeek.Sunday)
                    continue;

                for (int hour = 8; hour < 18; hour += 2)
                {
                    // Lokala tider med DateTimeKind.Local
                    var localStart = new DateTime(date.Year, date.Month, date.Day, hour, 0, 0, DateTimeKind.Local);
                    var localEnd = localStart.AddHours(2);

                    slots.Add(new Timeslot
                    {
                        ResourceId = resourceId,
                        StartTime = localStart.ToUniversalTime(),
                        EndTime = localEnd.ToUniversalTime(),
                        IsBooked = false
                    });
                }
            }

            return slots;

        }

        public async Task<List<Resource>> GetAllAsync()
        {
            return await _context.Resources
            // Just to see resources with no timeslots
            .Include(r => r.Timeslots)
            // --------------------------------------
            .ToListAsync();
        }

        public async Task<List<Resource>> GetByTypeAsync(BookingType type)
        {
            return await _context.Resources
                .Where(r => r.ResourceType == type)
                // Just to see resources with no timeslots
                .Include(r => r.Timeslots)
                // ---------------------------------------
                .ToListAsync();
        }

        public async Task<Resource> CreateAsync(Resource resource)
        {
            // Add resource
            _context.Resources.Add(resource);
            await _context.SaveChangesAsync();

            // Create default timeslots
            var defaultSlots = GenerateDefaultSlots(resource.ResourceId);
            _context.Timeslots.AddRange(defaultSlots);
            await _context.SaveChangesAsync();

            // Return resource with timeslots included
            var createdResource = await _context.Resources
                .Include(r => r.Timeslots)
                .FirstOrDefaultAsync(r => r.ResourceId == resource.ResourceId);

            if (createdResource == null)
                throw new Exception("Något gick fel: resursen kunde inte hämtas efter skapande");

            return createdResource;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var resource = await _context.Resources.FindAsync(id);
            if (resource == null) return false;

            _context.Resources.Remove(resource);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
