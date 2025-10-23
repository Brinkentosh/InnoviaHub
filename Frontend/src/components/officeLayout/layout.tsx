import { useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { BASE_URL } from "../../config";
import LoadingSpinner from "../loading/loadingComponent";
import "./layout.css";

type SensorData = {
  temperature?: number;
  co2?: number;
  battery?: number;
  light?: number;
  sound?: number;
  timestamp?: string;
};

type IoTSensor = {
  id: string;
  serial: string;
  type: string;
  sensorId: string;
};

type Booking = {
  resourceId: number;
  bookingId: number;
  date: number;
  startTime: string;
  endTime: string;
  user: {
    firstName: string;
    lastName: string;
    userName: string;
    id: string;
    isAdmin: boolean;
  };
};

type Resource = {
  resourceId: number;
  resourceType: string;
  resourceName: string;
  bookings?: Booking[];
  sensorData?: SensorData;
  sensors?: IoTSensor[];
};

type RealtimeMeasurement = {
  tenantSlug: string;
  deviceId: string;
  type: string;
  value: number;
  time: string;
};

const typeClassMap: { [key: string]: string } = {
  0: "motesrum",
  1: "skrivbord",
  2: "vr-headset",
  3: "ai-server",
};

function mapMeasurementToSensorData(measurement: RealtimeMeasurement): SensorData {
  const mapped: SensorData = {
    timestamp: measurement.time,
  };
  switch (measurement.type) {
    case "temperature":
      mapped.temperature = measurement.value;
      break;
    case "co2":
      mapped.co2 = measurement.value;
      break;
    case "battery":
      mapped.battery = measurement.value;
      break;
    case "light":
      mapped.light = measurement.value;
      break;
    case "sound":
      mapped.sound = measurement.value;
      break;
  }
  return mapped;
}

const Layout = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let connectionStarted = false;
    const tenantSlug = "innovia";

    const connection = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5103/hub/telemetry", {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect()
      .build();

    connection.on("measurementReceived", (measurement: RealtimeMeasurement) => {
      const sensorUpdate = mapMeasurementToSensorData(measurement);
      const deviceId = measurement.deviceId.toLowerCase();

      setResources((prevResources) =>
        prevResources.map((res) => {
          const hasMatchingSensor = res.sensors?.some(
            (sensor) => sensor.sensorId.toLowerCase() === deviceId
          );

          if (hasMatchingSensor) {
            return {
              ...res,
              sensorData: {
                ...res.sensorData,
                ...sensorUpdate,
              },
            };
          }

          return res;
        })
      );
    });

    const startSignalR = async () => {
      if (!connectionStarted) {
        try {
          await connection.start();
          connectionStarted = true;
          await connection.invoke("JoinTenant", tenantSlug);
          console.log("✅ SignalR connected & joined:", tenantSlug);
        } catch (err) {
          console.error("❌ SignalR-anslutning misslyckades:", err);
          if (isMounted) {
            setError("Kunde inte ansluta till SignalR");
          }
        }
      }
    };

    const fetchResourcesAndBookings = async () => {
      try {
        const [resRes, resBookings] = await Promise.all([
          fetch(`${BASE_URL}resource`),
          fetch(`${BASE_URL}booking`),
        ]);

        if (!resRes.ok) throw new Error("Kunde inte hämta resurser");
        if (!resBookings.ok) throw new Error("Kunde inte hämta bokningar");

        const resourcesData: Resource[] = await resRes.json();
        const bookingsData: Booking[] = await resBookings.json();

        const collator = new Intl.Collator("sv", { numeric: true, sensitivity: "base" });

        const sortedResources = resourcesData.sort((a, b) =>
          collator.compare(a.resourceName, b.resourceName)
        );

        const resourcesWithBookings = sortedResources.map((res) => {
          const bookingsForRes = bookingsData
            .filter((b) => b.resourceId === res.resourceId)
            .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

          return {
            ...res,
            bookings: bookingsForRes,
          };
        });

        if (isMounted) {
          setResources(resourcesWithBookings);
          console.log("✅ Resurser & bokningar laddade");
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Något gick fel vid hämtning");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchResourcesAndBookings();
    startSignalR();

    return () => {
      isMounted = false;
      if (connectionStarted) {
        connection
          .stop()
          .then(() => console.log("🔌 SignalR frånkopplad"))
          .catch((err) => console.error("❌ SignalR stop error:", err));
      }
    };
  }, []);

  if (loading)
    return (
      <div className="loadingContainerMyBookings">
        <LoadingSpinner />
      </div>
    );

  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h2 className="layoutHeader">
        <i>Hovra över resurs för sensorvärden</i>
      </h2>

      <div className="officeGridWrapper">
        {["motesrum", "skrivbord", "vr-headset", "ai-server"].map((type) => {
          const filtered = resources.filter((r) => typeClassMap[r.resourceType] === type);
          if (filtered.length === 0) return null;

          return (
            <div key={type} className={`resourceGroup ${type}`}>
              {filtered.map((res) => (
                <div
                  key={res.resourceId}
                  className={`resource ${type}`}
                  data-id={res.resourceId}
                >
                  <strong>{res.resourceName}</strong>

                  <div className="sensorTooltip">
                    <h3>Sensorvärden</h3>
                    <hr />
                    {res.sensorData ? (
                      <>
                        {res.sensorData.temperature !== undefined && (
                          <div>Temperatur: {res.sensorData.temperature.toFixed(1)}°C</div>
                        )}
                        {res.sensorData.co2 !== undefined && (
                          <div>CO2: {res.sensorData.co2} ppm</div>
                        )}
                        {res.sensorData.battery !== undefined && (
                          <div>Batteri: {res.sensorData.battery}%</div>
                        )}
                        {res.sensorData.light !== undefined && (
                          <div>Ljusnivå: {res.sensorData.light}</div>
                        )}
                        {res.sensorData.sound !== undefined && (
                          <div>Ljudnivå: {res.sensorData.sound}</div>
                        )}
                        {res.sensorData.timestamp && (
                          <div style={{ fontSize: "0.8em", color: "#666" }}>
                            Senast uppdaterad:{" "}
                            {new Date(res.sensorData.timestamp).toLocaleTimeString()}
                          </div>
                        )}
                      </>
                    ) : (
                      <div>Ingen data tillgänglig.</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Layout;
