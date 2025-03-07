import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import {
  Navbar,
  Login,
  Signup,
  Profile,
  ForgotPass,
  ResetPass,
  SearchPage,
  Catalog,
  TrendingNFTs,
  TopCreators,
  UserCollection
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
        <Route path="/nft" element={<SearchPage />}/>
        <Route path="/nfts" element={<Catalog />}/>
        <Route path="/trending" element={<TrendingNFTs />}/>
        <Route path="/top-creators" element={<TopCreators />}/>
        <Route path="/my-collection" element={<UserCollection />}/>
      </Routes>
    </Router>
  );
}

export default App;
