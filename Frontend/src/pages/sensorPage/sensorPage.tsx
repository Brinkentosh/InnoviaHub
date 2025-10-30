import Header from "../../components/header/header";
import Navbar from "../../components/navbar/navbar";
import Sensors from "../../components/sensors/Sensors";
import SensorOffline from "../../components/sensors/SensorsOffline";

const SensorPage = () => {
    return (
        <div className="layoutPage">
            <div className="headerAndNav">
                <Header />
                <Navbar />
            </div>
            <SensorOffline />
        </div>
    );
}

export default SensorPage;