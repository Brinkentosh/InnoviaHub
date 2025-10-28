import {useEffect, useState} from "react";

type Device = {
    id: string;
    tenantId: string;
    roomId: string;
    model: string;
    serial: string;
    status: string;
}

const SensorAdmin = () => {
    const [devices, setDevices] = useState<Device[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDevices = async () => {
            try {
                const res = await fetch('http://localhost:5101/api/tenants/c269d929-2022-4f32-909d-00542848665a/devices');
                if (!res.ok) throw new Error(`HTTP error! status; ${res.status}`);
                const data = await res.json();
                setDevices(data);
            } catch (err: any) {
                setError(err.message);
            }
            finally {
                setLoading(false);
            }
        };

        fetchDevices();
    }, []);

    if (loading) return <p>Laddar enheter..</p>;
    if (error) return <p>Fel vid hämtning: {error}</p>;

    return (
        <div>
            <h2>Sensordata</h2>
            <ul>
                {devices.map((device) => (
                    <li key={device.id}>
                        <strong>{device.model}</strong> - {device.serial} - ({device.status})
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SensorAdmin;