import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import {
  Navbar,
  Login,
  Signup,
  Profile,
  ForgotPass,
  ResetPass,
} from "./pages/exportComponents";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <Router>
      <ToastContainer autoClose={2000} />
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/forgot-password" element={<ForgotPass />} />
        <Route path="/reset-password/:token" element={<ResetPass />} />
      </Routes>
    </Router>
  );
}

export default App;
