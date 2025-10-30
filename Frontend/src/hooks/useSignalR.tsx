import { useEffect, useRef } from "react";
import connection from "../services/signalRConnection";

export interface BookingUpdate {
  resourceId: number;
  date: string;
  timeslotId?: number;
  action?: "lock" | "unlock" | "update";
}

// Global list of subscribers
const subscribers: ((update: BookingUpdate) => void)[] = [];

const broadcast = (update: BookingUpdate) => {
  subscribers.forEach(cb => cb(update));
};

const isConnectedRef = { current: false };

const useSignalr = (callback: (update: BookingUpdate) => void, source = "unknown") => {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    console.log(`🔌 useSignalr mount, adding subscriber from ${source}`);
    subscribers.push(callbackRef.current);

    const startConnection = async () => {
      if (!isConnectedRef.current) {
        // Lägg till handlers bara en gång
        if (!(connection as any)._hasHandler) {
          connection.on("ReceiveBookingUpdate", broadcast);
          connection.on("ReceiveTimeslotLocked", (data) => {
            broadcast({ ...data, action: "lock" });
          });
          connection.on("ReceiveTimeslotUnlocked", (data) => {
            broadcast({ ...data, action: "unlock" });
          });
          (connection as any)._hasHandler = true;
          console.log("📡 SignalR handlers registered");
        }

        if (connection.state !== "Connected") {
          try {
            await connection.start();
            isConnectedRef.current = true;
            console.log("✅ SignalR connected");
          } catch (err) {
            console.error("❌ SignalR connection error:", err);
          }
        } else {
          isConnectedRef.current = true;
        }
      }
    };

    startConnection();

    return () => {
      const index = subscribers.indexOf(callbackRef.current);
      if (index !== -1) subscribers.splice(index, 1);
    };
  }, [callback, source]);
};

export default useSignalr;