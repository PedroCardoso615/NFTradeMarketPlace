import React, { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { storage } from "../../config/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from "react-toastify";
import { Container, TextField, Button, Typography, Box } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

const Signup = () => {
  const [fullname, setFullname] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const fileInputClear = useRef(null);

  const validateForm = async () => {
    if (!fullname || !age || !email || !password || !profilePicture) {
      return "All fields are required.";
    }
    if (age < 18) {
      return "You must be at least 18 years old.";
    }

    const passwordPattern = /^(?=.*[A-Z])(?=.*\d.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordPattern.test(password)) {
      return "Password must be at least 8 characters long, include one uppercase letter, two numbers, and one special character.";
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email)) {
      return "Please enter a valid email address.";
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/user/check-email?email=${email}`
      );
      const data = await response.json();

      if (data.exists) {
        return "Email already exists.";
      }
    } catch (error) {
      console.error(error);
      return "Server error. Try again later.";
    }

    return "";
  };

  const handleSignUp = async () => {
    const errorMessage = await validateForm();

    if (errorMessage) {
      toast.error(errorMessage, { position: "top-right" });
      return;
    }

    setError("");

    try {
      const imageRef = ref(storage, `profilePictures/${profilePicture.name}`);
      await uploadBytes(imageRef, profilePicture);
      const imgUrl = await getDownloadURL(imageRef);

      const res = await fetch(`${API_BASE_URL}/user/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullname,
          age,
          email,
          password,
          profilePicture: imgUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed.");

      setFullname("");
      setAge("");
      setEmail("");
      setPassword("");
      setProfilePicture(null);
      fileInputClear.current.value = "";

      toast.success("Signup Successful!", { position: "top-right" });

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      toast.error(err.message || "Signup failed. Try again.", {
        position: "top-right",
      });
      console.error(err);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mt: 5,
          p: 4,
          boxShadow: 3,
          borderRadius: 2,
          bgcolor: "background.paper",
        }}
      >
        <Typography variant="h4" gutterBottom>
          Sign Up
        </Typography>

        {error && <Typography color="error">{error}</Typography>}

        <TextField
          label="Full Name"
          variant="outlined"
          fullWidth
          margin="normal"
          value={fullname}
          onChange={(e) => setFullname(e.target.value)}
          required
        />
        <TextField
          label="Age"
          type="number"
          variant="outlined"
          fullWidth
          margin="normal"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          required
        />
        <TextField
          label="Email"
          type="email"
          variant="outlined"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextField
          label="Password"
          type="password"
          variant="outlined"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Button variant="contained" component="label" sx={{ mt: 2, mb: 2 }}>
          Upload Profile Picture
          <input
            type="file"
            accept="image/*"
            ref={fileInputClear}
            hidden
            onChange={(e) => setProfilePicture(e.target.files[0])}
          />
        </Button>

        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleSignUp}
          sx={{ mt: 2 }}
        >
          Sign Up
        </Button>
        <Typography variant="body2" sx={{ mt: 2 }}>
          <Link
            to="/login"
            style={{
              color: "#1976d2",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              transition: "color 0.3s",
            }}
            onMouseEnter={(e) => (e.target.style.color = "#1565c0")}
            onMouseLeave={(e) => (e.target.style.color = "#1976d2")}
          >
            Already have an account
            <ArrowForwardIcon sx={{ ml: 1 }} />
          </Link>
        </Typography>
      </Box>
    </Container>
  );
};

export default Signup;
