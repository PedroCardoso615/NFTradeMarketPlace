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
} from "@mui/material";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullname: "",
    profilePicture: null,
    oldPassword: "",
    newPassword: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5000/user/me", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
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

    fetchUser();
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
        const imageRef = ref(storage, `profilePictures/${formData.profilePicture.name}`);
        await uploadBytes(imageRef, formData.profilePicture);
        imgUrl = await getDownloadURL(imageRef);
      }

      const response = await fetch("http://localhost:5000/user/update", {
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
  if (!user) return <Typography variant="h4">Loading...</Typography>;

  return (
    <Box textAlign="center" mt={4}>
      <Typography variant="h4">Welcome, {user.fullname}!</Typography>
      <Avatar
        src={user.profilePicture}
        alt="Profile"
        sx={{ width: 150, height: 150, margin: "auto", mt: 2 }}
      />
      <Typography variant="h6"><strong>Full Name:</strong> {user.fullname}</Typography>
      <Typography variant="h6"><strong>Email:</strong> {user.email}</Typography>
      <Typography variant="h6"><strong>Balance:</strong> {user.balance}</Typography>

      <Button variant="contained" color="primary" onClick={() => setIsPopupOpen(true)} sx={{ mt: 2 }}>
        Update Profile
      </Button>

      <Dialog open={isPopupOpen} onClose={() => setIsPopupOpen(false)}>
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
          <Button variant="contained" component="label" fullWidth sx={{ mt: 2 }}>
            Upload Profile Picture
            <input type="file" hidden name="profilePicture" accept="image/*" onChange={handleInputChange} />
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
          <Button onClick={handleSubmit} variant="contained" color="success">Save Changes</Button>
          <Button onClick={() => setIsPopupOpen(false)} variant="contained" color="error">Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile;
