import React from "react";

const SensorOffline: React.FC = () => {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      textAlign: "center",
      backgroundColor: "#f8f9fa",
      color: "#333",
      padding: "2rem",
    }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="64"
        height="64"
        fill="currentColor"
        className="bi bi-exclamation-triangle-fill"
        viewBox="0 0 16 16"
        style={{ marginBottom: "1rem", color: "#dc3545" }}
      >
        <path d="M8.982 1.566a1.13 1.13 0 0 0-1.964 0L.165 13.233c-.457.778.091 1.767.982 1.767h13.707c.89 0 1.438-.99.982-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1-2.002 0 1 1 0 0 1 2.002 0z"/>
      </svg>
      <h1>Sensorservern är offline</h1>
      <p>Vi kan tyvärr inte hämta sensordata just nu. Försök igen om en liten stund.</p>
    </div>
  );
};

export default SensorOffline;