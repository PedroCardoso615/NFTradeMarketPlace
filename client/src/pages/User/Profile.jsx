import { useEffect, useState } from "react";
import { storage } from "../../config/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from "react-toastify";
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  Paper,
  Divider,
  CircularProgress,
} from "@mui/material";
import NFToken from "../../images/NFToken.png";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [totalSales, setTotalSales] = useState(0);
  const [totalRoyalties, setTotalRoyalties] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [error, setError] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullname: "",
    profilePicture: null,
    oldPassword: "",
    newPassword: "",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/user/me`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (data.success) {
          setUser(data.user);
          setFormData({
            fullname: data.user.fullname || "",
            profilePicture: data.user.profilePicture || "",
            oldPassword: "",
            newPassword: "",
          });
        } else {
          setError("Failed to fetch user data");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        toast.error("Error fetching user data.");
      }
    };

    const fetchEarnings = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/nft/earnings`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (data.success) {
          setTotalSales(parseFloat(data.totalSales));
          setTotalRoyalties(parseFloat(data.totalRoyalties));
          setTotalEarnings(parseFloat(data.totalEarnings));
        } else {
          toast.error("Failed to fetch earnings");
        }
      } catch (error) {
        console.error("Error fetching earnings:", error);
        toast.error("Error fetching earnings.");
      }
    };

    fetchUserData();
    fetchEarnings();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profilePicture") {
      setFormData({ ...formData, profilePicture: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      toast.info("Updating profile...");
      let imgUrl = user.profilePicture;

      if (formData.profilePicture instanceof File) {
        const imageRef = ref(
          storage,
          `profilePictures/${formData.profilePicture.name}`
        );
        await uploadBytes(imageRef, formData.profilePicture);
        imgUrl = await getDownloadURL(imageRef);
      }

      const response = await fetch(`${API_BASE_URL}/user/update`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullname: formData.fullname,
          profilePicture: imgUrl,
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Profile updated successfully!");
        setUser(data.user);
        setIsPopupOpen(false);
        setFormData({ ...formData, oldPassword: "", newPassword: "" });
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("An error occurred while updating profile.");
    }
  };

  if (error) return <Typography variant="h4">{error}</Typography>;

  return (
    <Box textAlign="center" mt={4}>
      {!user ? (
        <Box
          sx={{
            height: "60vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Typography variant="h4" sx={{ mb: 2 }}>
            Welcome, {user.fullname}!
          </Typography>

          <Paper sx={{ padding: 2, maxWidth: 600, margin: "auto",  backgroundColor: "#191919", color: "#fff" }}>
            <Avatar
              src={user.profilePicture}
              alt="Profile"
              sx={{ width: 150, height: 150, margin: "auto", mb: 2 }}
            />
            <Typography variant="h6">
              <span>Full Name:</span> {user.fullname}
            </Typography>
            <Typography variant="h6">
              <span>Email:</span> {user.email}
            </Typography>

            <Typography
              variant="h6"
              sx={{ display: "flex", justifyContent: "center", mt: 2 }}
            >
              <span>Balance:</span>
              <span style={{ marginLeft: 8 }}>{user.balance}</span>
              <img
                src={NFToken}
                alt="NFTokens"
                style={{ width: 35, height: 35 }}
              />
            </Typography>

            <Button
              variant="contained"
              color="#fff"
              onClick={() => setIsPopupOpen(true)}
              sx={{ mt: 3, backgroundColor:"#000" }}
            >
              Update Profile
            </Button>
          </Paper>

          <Divider sx={{ my: 1 }} />

          <Box sx={{ maxWidth: 600, margin: "auto", padding: 2 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Earnings Overview
            </Typography>

            <Paper sx={{ padding: 2, color: "#fff", bgcolor: "#191919" }}>
              <Typography
                variant="h6"
                sx={{ display: "flex", alignItems: "center", mt: 2 }}
              >
                <span>Earnings from Sales:</span>
                <span style={{ marginLeft: 15 }}>{totalSales.toFixed(2)}</span>
                <img
                  src={NFToken}
                  alt="NFTokens"
                  style={{ width: 35, height: 35 }}
                />
              </Typography>
              <Typography
                variant="h6"
                sx={{ display: "flex", alignItems: "center", mt: 2 }}
              >
                <span>Earnings from Royalties:</span>
                <span style={{ marginLeft: 15 }}>
                  {totalRoyalties.toFixed(2)}
                </span>
                <img
                  src={NFToken}
                  alt="NFTokens"
                  style={{ width: 35, height: 35 }}
                />
              </Typography>
              <Typography
                variant="h6"
                sx={{ display: "flex", alignItems: "center", mt: 2 }}
              >
                <span>Total Earnings:</span>
                <span style={{ marginLeft: 15 }}>
                  {totalEarnings.toFixed(2)}
                </span>
                <img
                  src={NFToken}
                  alt="NFTokens"
                  style={{ width: 35, height: 35 }}
                />
              </Typography>
            </Paper>
          </Box>

          <Dialog open={isPopupOpen} onClose={() => setIsPopupOpen(false)} sx={{ backdropFilter: "blur(5px)" }}>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogContent>
              <TextField
                fullWidth
                margin="dense"
                label="Full Name"
                name="fullname"
                value={formData.fullname}
                onChange={handleInputChange}
              />
              <Button
                variant="contained"
                component="label"
                fullWidth
                sx={{ mt: 2, backgroundColor:"#191919" }}
              >
                Upload Profile Picture
                <input
                  type="file"
                  hidden
                  name="profilePicture"
                  accept="image/*"
                  onChange={handleInputChange}
                />
              </Button>
              <TextField
                fullWidth
                margin="dense"
                type="password"
                label="Old Password"
                name="oldPassword"
                value={formData.oldPassword}
                onChange={handleInputChange}
              />
              <TextField
                fullWidth
                margin="dense"
                type="password"
                label="New Password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
              />
            </DialogContent>
            <DialogActions>
              <Button
                onClick={handleSubmit}
                variant="contained"
                sx={{ backgroundColor:"#191919" }}
              >
                Save Changes
              </Button>
              <Button
                onClick={() => setIsPopupOpen(false)}
                variant="outlined"
                color="#fff"
              >
                Cancel
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Box>
  );
};

export default Profile;
