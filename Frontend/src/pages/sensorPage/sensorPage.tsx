import Header from "../../components/header/header";
import Navbar from "../../components/navbar/navbar";
import Sensors from "../../components/sensors/Sensors";

const SensorPage = () => {
    return (
        <div className="layoutPage">
            <div className="headerAndNav">
                <Header />
                <Navbar />
            </div>
            <Sensors />
        </div>
    );
}

export default SensorPage;