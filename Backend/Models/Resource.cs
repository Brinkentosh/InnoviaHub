
namespace InnoviaHub.Models
{
    public class Resource
    {
        public int ResourceId { get; set; }
        public required string ResourceName { get; set; } // e.g Mötesrum
        public BookingType ResourceType { get; set; } // Enum
        public int Capacity { get; set; } // e.g 4 rooms, 1 VR headset

        // To connect to Timeslots
        public ICollection<Timeslot> Timeslots { get; set; } = new List<Timeslot>();
        public ICollection<IoTSensor> Sensors { get; set; } = new List<IoTSensor>();
    }

    public class IoTSensor
    {
        public int Id { get; set; }
        public string Serial { get; set; } = null!;
        public string SensorID { get; set; } = null!;
        public string Type { get; set; } = null!;

        public int ResourceId { get; set; }
        public Resource Resource { get; set; } = null!;
    }
}