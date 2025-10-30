using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.SignalR;
using InnoviaHub.Models;

namespace InnoviaHub.Hubs
{
    public class BookingHub : Hub
    {
        public async Task SendBookingUpdate(BookingUpdate update)
        {
            await Clients.All.SendAsync("ReceiveBookingUpdate", update);
        }

        public async Task LockTimeslot(int resourceId, string date, int timeslotId)
        {
            Console.WriteLine($"🔒 Timeslot {timeslotId} låst för resource {resourceId} ({date})");
            await Clients.Others.SendAsync("ReceiveTimeslotLocked", new
            {
                ResourceId = resourceId,
                Date = date,
                TimeslotId = timeslotId
            });
        }

        public async Task UnlockTimeslot(int resourceId, string date, int timeslotId)
        {
            Console.WriteLine($"🔓 Timeslot {timeslotId} upplåst för resource {resourceId} ({date})");
            await Clients.Others.SendAsync("ReceiveTimeslotUnlocked", new
            {
                ResourceId = resourceId,
                Date = date,
                TimeslotId = timeslotId
            });
        }
    }
}