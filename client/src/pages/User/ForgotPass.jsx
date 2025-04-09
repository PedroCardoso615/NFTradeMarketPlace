import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { TextField, Button, CircularProgress, Container, Paper, Typography, Box } from "@mui/material";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("https://nf-trade-market-place.vercel.app/user/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Password reset email sent!", { position: "top-right" });
        setEmail("");
      } else {
        toast.error(data.message || "Failed to send reset email.", { position: "top-right" });
      }
    } catch (error) {
      console.error("Error sending reset email:", error);
      toast.error("Something went wrong!", { position: "top-right" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ padding: 4, mt: 5, textAlign: "center" }}>
        <Typography variant="h5" gutterBottom>
          Forgot Password
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Enter your email to receive a reset password link.
        </Typography>

        <Box component="form" onSubmit={handleForgotPassword} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            sx={{ mb: 2 }}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
            sx={{ height: 45 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Send Reset Link"}
          </Button>
        </Box>

        <Box sx={{ mt: 2, textAlign: "left" }}>
          <Typography variant="body2">
            <Link to="/login" style={{ textDecoration: "none", color: "#1976d2", fontWeight: 500 }}>
              &larr; Back to Login
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default ForgotPassword;