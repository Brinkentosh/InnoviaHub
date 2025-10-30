import { useEffect, useState, useCallback } from "react";
import "./timeslots.css";
import useSignalr from "../../hooks/useSignalR";
import type { BookingUpdate } from "../../hooks/useSignalR";
import { BASE_URL } from "../../config";
import connection from "../../services/signalRConnection";

// Typdefinition för en timeslot
export type Timeslot = {
  timeslotId: number;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  resourceId: number;
  locked?: boolean;
};

interface ShowAvailableTimeslotsProps {
  resourceId: number | undefined;
  date: Date;
  selectedTimeslot: Timeslot | null;
  setSelectedTimeslot: (slot: Timeslot | null) => void; // ✅ nullable
}

const ShowAvailableTimeslots = ({
  resourceId,
  date,
  selectedTimeslot,
  setSelectedTimeslot,
}: ShowAvailableTimeslotsProps) => {
  const [timeslots, setTimeslots] = useState<Timeslot[]>([]);
  const [error, setError] = useState<string | null>(null);

  const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;

  // 🔁 Hämta tider
  const fetchTimeslots = useCallback(() => {
    if (!resourceId) return;

    console.log("🔄 Fetching timeslots for", resourceId, formattedDate);

    fetch(`${BASE_URL}Timeslot/resources/${resourceId}/timeslots?date=${formattedDate}`)
      .then((res) => {
        if (!res.ok) throw new Error("Kunde inte hämta lediga tider");
        return res.json();
      })
      .then((data) =>
        setTimeslots(
          data.map((slot: Timeslot) => ({
            ...slot,
            locked: Boolean(slot.locked),
          }))
        )
      )
      .catch((err) => setError(err.message));
  }, [resourceId, formattedDate]);

  // 🧠 Hantera inkommande SignalR-meddelanden
  useSignalr(
    (update: BookingUpdate) => {
      if (update.resourceId === resourceId && update.date === formattedDate) {
        setTimeslots((prev) =>
          prev.map((slot) =>
            slot.timeslotId === update.timeslotId
              ? { ...slot, locked: update.action === "lock" }
              : slot
          )
        );
      }
    },
    "ShowAvailableTimeslots"
  );

  // 🖱️ Klickhantering
  const handleClick = async (slot: Timeslot) => {
    if (slot.isBooked) return;

    // Avmarkera om användaren klickar på sin egen valda slot
    if (selectedTimeslot?.timeslotId === slot.timeslotId) {
      setSelectedTimeslot(null);
      setTimeslots((prev) =>
        prev.map((s) =>
          s.timeslotId === slot.timeslotId ? { ...s, locked: false } : s
        )
      );
      try {
        await connection.invoke(
          "UnlockTimeslot",
          slot.resourceId,
          formattedDate,
          slot.timeslotId
        );
      } catch (err) {
        console.error("❌ Kunde inte låsa upp timeslot:", err);
      }
      return;
    }

    if (slot.locked) return;

    // Markera lokalt som vald och lås
    setSelectedTimeslot(slot);
    setTimeslots((prev) =>
      prev.map((s) =>
        s.timeslotId === slot.timeslotId ? { ...s, locked: true } : s
      )
    );

    try {
      await connection.invoke(
        "LockTimeslot",
        slot.resourceId,
        formattedDate,
        slot.timeslotId
      );
    } catch (err) {
      console.error("❌ Kunde inte låsa timeslot:", err);
    }
  };

  // 🔓 Lås upp timeslot vid unload
  useEffect(() => {
    const handleUnload = () => {
      if (selectedTimeslot) {
        connection.invoke(
          "UnlockTimeslot",
          selectedTimeslot.resourceId,
          formattedDate,
          selectedTimeslot.timeslotId
        );
      }
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      handleUnload();
    };
  }, [selectedTimeslot, formattedDate]);

  // 🚀 Hämta tider vid mount
  useEffect(() => {
    fetchTimeslots();
  }, [fetchTimeslots]);

  return (
    <div className="timeslot-list">
      <h3>Tillgängliga tider:</h3>
      {error && <p className="error">{error}</p>}
      {timeslots.length === 0 && <p>Inga tider tillgängliga</p>}

      <div className="timeslot-grid">
        {timeslots.map((slot) => (
          <button
            key={slot.timeslotId}
            onClick={() => handleClick(slot)}
            className={`timeslot-btn
              ${slot.isBooked ? "booked" : ""}
              ${slot.locked ? "locked" : ""}
              ${selectedTimeslot?.timeslotId === slot.timeslotId ? "selected" : ""}`}
            disabled={slot.isBooked}
          >
            {slot.startTime.slice(0, 5)} – {slot.endTime.slice(0, 5)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ShowAvailableTimeslots;
