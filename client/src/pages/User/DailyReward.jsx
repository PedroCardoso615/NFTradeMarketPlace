import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  CardContent,
  Typography,
  CircularProgress,
} from "@mui/material";
import { toast } from "react-toastify";
import NFToken from "../../images/NFToken.png";

const DailyReward = () => {
  const [balance, setBalance] = useState(0);
  const [remainingTime, setRemainingTime] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const res = await fetch("https://nf-trade-market-place.vercel.app/user/me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await res.json();

      if (data.success && data.user) {
        setBalance(data.user.balance || 0);

        if (data.user.lastClaimedReward) {
          const lastClaimed = new Date(data.user.lastClaimedReward).getTime();
          const nextClaimTime = lastClaimed + 12 * 60 * 60 * 1000;
          const now = new Date().getTime();

          if (now < nextClaimTime) {
            setRemainingTime(Math.ceil((nextClaimTime - now) / 1000));
          } else {
            setRemainingTime(null);
          }
        }
      } else {
        toast.error("Failed to fetch user data.");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Error fetching user data.");
    }
  };

  const claimReward = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://nf-trade-market-place.vercel.app/user/daily-reward", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message || "You claimed 0.25 NFTokens!");
        setBalance(data.balance || 0);
        setRemainingTime(12 * 60 * 60);
      } else {
        toast.error(data.message || "Failed to claim reward.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while claiming reward.");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (remainingTime !== null) {
      const interval = setInterval(() => {
        setRemainingTime((prev) => (prev > 0 ? prev - 1 : null));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [remainingTime]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <Card sx={{ maxWidth: 400, mx: "auto", mt: 5, p: 3, textAlign: "center" }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          🎁 Daily Rewards
        </Typography>

        <Typography variant="body1" sx={{display: "flex", alignItems: "center", justifyContent: "center"}}>
          Current Balance: {balance}{" "}
          <img src={NFToken} alt="NFToken" style={{ width: 35, height: 35 }} />
        </Typography>
        <Typography variant="body1" sx={{display: "flex", alignItems: "center", justifyContent: "center"}}>
          You will receive: 0.25{" "}
          <img src={NFToken} alt="NFToken" style={{ width: 35, height: 35 }} />
        </Typography>

        <Button
          variant="contained"
          color="primary"
          onClick={claimReward}
          disabled={remainingTime !== null || loading}
          sx={{ mt: 2, width: "100%" }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Claim Reward"
          )}
        </Button>

        {remainingTime !== null && (
          <Typography variant="body2" fontWeight="bold" sx={{ mt: 2 }}>
            Next claim in: {formatTime(remainingTime)}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default DailyReward;
