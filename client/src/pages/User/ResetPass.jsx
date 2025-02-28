import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";  // Importing toastify

const ResetPassword = () => {
  const { token } = useParams(); // Get the token from the URL
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (!token) {
      toast.error("Invalid reset token.", { position: "top-right" });
      navigate("/login");
    }
  }, [token, navigate]);

  // Password Validation Function
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

    return ""; // Return empty if no error
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();

    const validationMessage = validatePassword();
    if (validationMessage) {
      toast.error(validationMessage, { position: "top-right" });
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/user/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Password reset failed. Try again.", { position: "top-right" });
        return;
      }

      toast.success(data.message || "Password reset successful. You can now login.", { position: "top-right" });
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      toast.error("An error occurred while resetting the password. Try again later.", { position: "top-right" });
      console.error(error);
    }
  };

  return (
    <div className="reset-password-container">
      <h2>Reset Your Password</h2>

      <form onSubmit={handlePasswordReset}>
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button type="submit">Reset Password</button>
      </form>
    </div>
  );
};

export default ResetPassword;
