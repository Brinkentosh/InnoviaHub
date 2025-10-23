import React, { useEffect, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import './Sensors.css';

type RealtimeMeasurement = {
  tenantSlug: string;
  deviceId: string;
  type: string;
  value: number;
  time: string;
  unit?: string;
};

type GroupedMeasurements = {
  [type: string]: {
    [deviceId: string]: RealtimeMeasurement;
  };
};

const deviceNames: { [deviceId: string]: string } = {
  '08265543-3b3c-4bb6-8711-3ce337502784': 'Mötesrum 1',
  '60e16a3d-5426-476d-b53c-26eb50f3b0c5': 'Mötesrum 2',
  'ec6bb7a3-3bd7-4c08-bb08-59faef4801ef': 'Mötesrum 3',
  '83b17f4b-af2a-4ef8-a5c3-d79d29cc480e': 'Mötesrum 4',
  '00321143-0475-4090-ae24-d06a5e8eef5e': 'Kontorslandskap',
  '3c0838f6-80c1-4c6a-8a67-a3dd30d040b5': 'VR-Headset',
  '67ca0a21-b105-4460-b9fe-327d5545f247': 'VR-Headset',
  'cb60bbc5-751d-4074-b5b3-499586c99b8e': 'VR-Headset',
  '10400d81-2cc9-40c4-b74d-8ed0818c2ae7': 'VR-Headset',
  '9c9df412-fc4a-43c3-9c3b-8a4ef5ab6f05': 'Kontorslandskap',
};

const Sensors = () => {
  const [measurements, setMeasurements] = useState<RealtimeMeasurement[]>([]);

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5103/hub/telemetry')
      .withAutomaticReconnect()
      .build();

    connection
      .start()
      .then(() => {
        console.log('✅ SignalR ansluten');
        connection
          .invoke('JoinTenant', 'innovia')
          .then(() => console.log('📡 JoinTenant("innovia") skickad'))
          .catch((err) => console.error('❌ Fel vid JoinTenant:', err));
      })
      .catch((err) => console.error('❌ SignalR-anslutningsfel:', err));

    connection.on('measurementReceived', (m: RealtimeMeasurement) => {
      console.log('📡 measurementReceived:', m);
      setMeasurements((prev) => [...prev.slice(-99), m]); // behåll senaste 100
    });

    return () => {
      connection.stop();
    };
  }, []);

  const grouped: GroupedMeasurements = {};

  measurements.forEach((m) => {
    if (!grouped[m.type]) grouped[m.type] = {};

    const existing = grouped[m.type][m.deviceId];
    if (!existing || new Date(m.time) > new Date(existing.time)) {
      grouped[m.type][m.deviceId] = m;
    }
  });

  return (
    <div className="sensorsContent">
      <h2>Live-mätningar</h2>
      {Object.entries(grouped).map(([type, devices]) => (
        <div key={type} className="sensorTypeGroup">
          <h3>{type.charAt(0).toUpperCase() + type.slice(1)}</h3>
          <ul>
            {Object.entries(devices).map(([deviceId, measurement]) => (
              <li key={deviceId}>
                <strong>{deviceNames[deviceId] || deviceId}</strong>
                <span>
                  {measurement.value.toFixed(2)}
                {measurement.unit ? ` ${measurement.unit}` : ''} @{' '}
                {new Date(measurement.time).toLocaleTimeString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default Sensors;