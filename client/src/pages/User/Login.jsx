import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Container, TextField, Button, Typography, Box } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_BASE_URL}/user/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Login Successful!", { position: "top-right" });
          navigate("/profile");
      } else {
        toast.error("Email or password is incorrect", {
          position: "top-right",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Something went wrong!", { position: "top-right" });
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
          Login
        </Typography>
        <form onSubmit={handleLogin} style={{ width: "100%" }}>
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
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
          >
            Login
          </Button>
        </form>

        <Typography variant="body2" sx={{ mt: 2 }}>
          <Link
            to="/forgot-password"
            style={{
              color: "#1976d2",
              textDecoration: "none",
              transition: "color 0.3s",
            }}
            onMouseEnter={(e) => (e.target.style.color = "#1565c0")}
            onMouseLeave={(e) => (e.target.style.color = "#1976d2")}
          >
            Forgot Password?
          </Link>
        </Typography>

        <Typography variant="body2" sx={{ mt: 2 }}>
          <Link
            to="/signup"
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
            Create an Account
            <ArrowForwardIcon sx={{ ml: 1 }} />
          </Link>
        </Typography>
      </Box>
    </Container>
  );
};

export default Login;
