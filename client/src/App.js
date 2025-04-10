import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import {
  Navbar,
  Home,
  Login,
  Signup,
  Profile,
  ForgotPass,
  ResetPass,
  SearchPage,
  Catalog,
  TrendingNFTs,
  TopCreators,
  UserCollection,
  Favorites,
  NFTCreation,
  DailyRewards,
  TransactionHistory,
  Contact
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
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/forgot-password" element={<ForgotPass />} />
        <Route path="/reset-password/:token" element={<ResetPass />} />
        <Route path="/nft" element={<SearchPage />}/>
        <Route path="/nfts" element={<Catalog />}/>
        <Route path="/trending" element={<TrendingNFTs />}/>
        <Route path="/top-creators" element={<TopCreators />}/>
        <Route path="/my-collection" element={<UserCollection />}/>
        <Route path="/favorites" element={<Favorites />}/>
        <Route path="/create" element={<NFTCreation />}/>
        <Route path="/daily-rewards" element={<DailyRewards />}/>
        <Route path="/transactions" element={<TransactionHistory />}/>
        <Route path="/contact" element={<Contact />}/>
      </Routes>
    </Router>
  );
}

export default App;
