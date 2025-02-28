import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import {Login, Signup, Profile} from './pages/exportCompnents';
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <Router>
      <ToastContainer autoClose={2000}/>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;
