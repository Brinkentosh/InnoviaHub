import { Routes, Route } from "react-router-dom";
import StartPage from "./pages/startPage/startPage";
import AdminPage from "./pages/adminPage/adminPage";
import MemberTable from "./components/Admin/MemberTable/memberTable";
import BookingPage from "./pages/bookingPage/bookResource";
import MyBookings from "./pages/myBookings/myBookings";
import NotFoundPage from "./pages/notFoundPage";
import LayoutPage from "./pages/officeLayout/layoutPage";
import LoginPage from "./pages/signInPage/signIn";
import BookingsAdmin from "./components/Admin/BookingsAdmin/bookingsAdmin";
import ResourceAdmin from "./components/Admin/ResourceAdmin/resourceAdmin";
import AiAssistant from "./components/AiAssistant/AiAssistant";
import SensorPage from "./pages/sensorPage/sensorPage";
import SensorAdmin from "./components/Admin/SensorAdmin/sensorAdmin";
import SensorOffline from "./components/sensors/SensorsOffline";



function App() {
  return (
    <div className="App">
      <AiAssistant />
      <Routes>
        <Route path="/" element={<StartPage />} />
        <Route path="/admin" element={<AdminPage />} >
          <Route path="members" element={<MemberTable />} />
          <Route path="bookings" element={<BookingsAdmin />} /> 
          <Route path="resources" element={<ResourceAdmin/>} />
          <Route path="sensors" element={<SensorOffline />} />
        </Route>
       <Route path="office" element={<LayoutPage />} />
        <Route path="/book" element={<BookingPage />} />
        <Route path="/myBookings" element={<MyBookings />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="bookings" element={<BookingsAdmin />} />
        <Route path="/sensors" element={<SensorPage />} />

        {/* NotFoundPage */}
        <Route path="*" element={<NotFoundPage />} />

      </Routes>
    </div>
  );
}

export default App;
