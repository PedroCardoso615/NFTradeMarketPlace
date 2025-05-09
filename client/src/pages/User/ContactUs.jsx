import { useState } from "react";
import {
  TextField,
  Button,
  MenuItem,
  Typography,
  Paper,
} from "@mui/material";
import { toast } from "react-toastify";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

const Contact = () => {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

const subjects = [
    "Bug Report",
    "Feature Recommendation",
    "General Inquiry",
    "Account Issue",
    "Become a Partner",
  ];

const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_BASE_URL}/user/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await response.json();

      if (data.success && data.user) {
        setLoading(true);

        const res = await fetch(`${API_BASE_URL}/user/contact`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ subject, message }),
        });

        const result = await res.json();
        if (result.success) {
          toast.success(result.message || "Message sent successfully!");
          setSubject("");
          setMessage("");
        } else {
          toast.error(result.message || "Failed to send message.");
        }
      } else {
        toast.error("You must be logged in to send a message.");
      }
    } catch (error) {
      toast.error("Failed to check user authentication. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ padding: 3, marginBottom: 5 }}>
        <Typography variant="h5" gutterBottom>
          Contact Us
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            select
            label="Subject"
            fullWidth
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            margin="normal"
            required
          >
            {subjects.map((subj) => (
              <MenuItem key={subj} value={subj}>
                {subj}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Message"
            fullWidth
            multiline
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            margin="normal"
            required
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
            sx={{ marginTop: 2 }}
          >
            {loading ? "Sending..." : "Send Message"}
          </Button>
        </form>
      </Paper>
  )
};

export default Contact;