import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { TextField, Button, CircularProgress, Container, Paper, Typography, Box } from "@mui/material";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error("Invalid reset token.", { position: "top-right" });
      navigate("/login");
    }
  }, [token, navigate]);

  const validatePassword = () => {
    if (!newPassword || !confirmPassword) {
      return "Both password fields are required.";
    }

    if (newPassword !== confirmPassword) {
      return "Passwords do not match.";
    }

    const passwordPattern = /^(?=.*[A-Z])(?=.*\d.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordPattern.test(newPassword)) {
      return "Password must be at least 8 characters long, include one uppercase letter, two numbers, and one special character.";
    }

    return "";
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setLoading(true);

    const validationMessage = validatePassword();
    if (validationMessage) {
      toast.error(validationMessage, { position: "top-right" });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`https://nftrade-marketplace.vercel.app/user/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Password reset failed. Try again.", { position: "top-right" });
        return;
      }

      toast.success(data.message || "Password reset successful. You can now log in.", { position: "top-right" });

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      toast.error("An error occurred while resetting the password. Try again later.", { position: "top-right" });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ padding: 4, mt: 5, textAlign: "center" }}>
        <Typography variant="h5" gutterBottom>
          Reset Your Password
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          Enter a new password to reset your account.
        </Typography>

        <Box component="form" onSubmit={handlePasswordReset} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            type="password"
            label="New Password"
            variant="outlined"
            fullWidth
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <TextField
            type="password"
            label="Confirm New Password"
            variant="outlined"
            fullWidth
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "Reset Password"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ResetPassword;