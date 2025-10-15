using InnoviaHub.Models;

namespace InnoviaHub.DTOs
{
    public class ResourceDTO
    {
        public int ResourceId { get; set; }
        public required string ResourceName { get; set; }
        public BookingType ResourceType { get; set; }
        public int Capacity { get; set; }
        public int CurrentBookings { get; set; }
        // New property to show current bookings, good for admin view

        public List<IoTSensorDTO> Sensors { get; set; } = new List<IoTSensorDTO>();
    }

        public class IoTSensorDTO
        {
            public string Serial { get; set; } = null!;
            public string Type { get; set; } = null!;
        }
}