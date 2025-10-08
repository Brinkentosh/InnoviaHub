using System.ComponentModel.DataAnnotations;
using InnoviaHub.Models;

namespace InnoviaHub.DTOs
{
    public class CreateBookingDTO
    {
        [Required]
        public string UserId { get; set; } = null!;
        [Required]
        public int ResourceId { get; set; }
        [Required]
        public BookingType BookingType { get; set; }
        [Required]
        public DateTime StartTime { get; set; }
        [Required]
        public DateTime EndTime { get; set; }
    }
}
