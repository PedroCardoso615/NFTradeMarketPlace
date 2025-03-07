import React, { useState, useEffect, useCallback } from "react";
import {
  Button,
  CircularProgress,
  Typography,
  Box,
} from "@mui/material";
import { toast } from "react-toastify";

const TopCreators = () => {
  const [timeFrame, setTimeFrame] = useState("24h");
  const [topCreators, setTopCreators] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTopCreators = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/top-creators/${timeFrame}`
      );
      const data = await res.json();

      if (res.ok) {
        setTopCreators(data);
      } else {
        toast.error(data.message || "Failed to fetch creators.");
      }
    } catch (error) {
      console.error("Error fetching top creators:", error);
      toast.error("Error fetching top creators.");
    } finally {
      setLoading(false);
    }
  }, [timeFrame]);

  useEffect(() => {
    fetchTopCreators();
  }, [fetchTopCreators]);

  const handleTimeFrameChange = (newTimeFrame) => {
    setTimeFrame(newTimeFrame);
  };

  return (
    <Box sx={{ padding: "20px" }}>
      <Typography variant="h4" gutterBottom>
        Top Creators
      </Typography>

      <Box sx={{ marginBottom: "20px" }}>
        <Button
          variant={timeFrame === "24h" ? "contained" : "outlined"}
          onClick={() => handleTimeFrameChange("24h")}
          sx={{ marginRight: "10px" }}
        >
          Last 24 Hours
        </Button>
        <Button
          variant={timeFrame === "7d" ? "contained" : "outlined"}
          onClick={() => handleTimeFrameChange("7d")}
          sx={{ marginRight: "10px" }}
        >
          Last 7 Days
        </Button>
        <Button
          variant={timeFrame === "30d" ? "contained" : "outlined"}
          onClick={() => handleTimeFrameChange("30d")}
        >
          Last 30 Days
        </Button>
      </Box>

      {loading && <CircularProgress />}

      {!loading && topCreators.length > 0 && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
          {topCreators.map((creator) => (
            <Box
              key={creator.userId}
              sx={{
                flex: "1 0 30%",
                minWidth: "250px",
                maxWidth: "300px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "20px",
                textAlign: "center",
                borderRadius: "10px",
                backgroundColor: "#f5f5f5",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            >
              <img
                src={creator.profilePicture}
                alt={creator.fullname}
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  marginBottom: "10px",
                }}
              />
              <Typography variant="h6">{creator.fullname}</Typography>
              <Typography variant="body2" color="textSecondary">
                {creator.nftCount} NFTs
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      {!loading && topCreators.length === 0 && (
        <Typography variant="h6" color="textSecondary">
          No creators found for the selected time frame.
        </Typography>
      )}
    </Box>
  );
};

export default TopCreators;
