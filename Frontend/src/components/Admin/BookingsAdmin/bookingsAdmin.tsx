import { useEffect, useState } from "react";
import "./bookingsAdmin.css";
import { BASE_URL } from "../../../config";
import LoadingSpinner from "../../loading/loadingComponent";

type Booking = {
  bookingId: number;
  resourceName: string;
  memberName: string;
  date: string;
  time: string;
};

// Type to sort bookings
type BookingWithDates = {
  bookingId: number;
  resourceName: string;
  memberName: string;
  startTime: Date;
  endTime: Date;
};

const BookingsAdmin = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch(`${BASE_URL}adminbookings`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!res.ok) {
          throw new Error("Fel vid hämtning av bokningar");
        }

        const data = await res.json();

        const locale = "sv-SE";
        const timeZone = "Europe/Stockholm";

        const mapped = data
          .map((b: any) => {
            const startTime = new Date(b.startTime);
            const endTime = new Date(b.endTime);

            return {
              bookingId: b.bookingId,
              resourceName: b.resourceName,
              memberName: b.memberName,
              startTime,  // Behåll Date-objekt för sortering
              endTime,
            };
          })
          // Sortera på startTime (Date-objekt)
          .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
          // Formatera för visning
          .map((b) => ({
            bookingId: b.bookingId,
            resourceName: b.resourceName,
            memberName: b.memberName,
            date: b.startTime.toLocaleDateString(locale, { timeZone }),
            time: `${b.startTime.toLocaleTimeString(locale, {
              hour: "2-digit",
              minute: "2-digit",
              timeZone,
            })} - ${b.endTime.toLocaleTimeString(locale, {
              hour: "2-digit",
              minute: "2-digit",
              timeZone,
            })}`,
          }));

        setBookings(mapped);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Något gick fel");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);


  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="adminContainer">
      <h2>Bokningshantering</h2>
      <table className="adminTable">
        <thead>
          <tr>
            <th>Resurs</th>
            <th>Medlem</th>
            <th>Datum</th>
            <th>Tid</th>
            <th>Redigera</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={5} style={{ textAlign: "center", padding: "2rem" }}>
                <div className="loadingContainerBookings">
                  <LoadingSpinner />
                </div>
              </td>
            </tr>
          ) : bookings.length > 0 ? (
            bookings.map((booking) => (
              <tr key={booking.bookingId}>
                <td>{booking.resourceName}</td>
                <td>{booking.memberName}</td>
                <td>{booking.date}</td>
                <td>{booking.time}</td>
                <td className="actions">
                  <button className="editBtn">✏️</button>
                  <button className="deleteBtn">🗑️</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} style={{ textAlign: "center" }}>
                Inga bokningar hittades
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default BookingsAdmin;
