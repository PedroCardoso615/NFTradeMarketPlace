import React, { useState, useEffect, useCallback } from "react";
import { Button, CircularProgress, Typography, Box, Card } from "@mui/material";
import { toast } from "react-toastify";

const TopCreators = () => {
  const [timeFrame, setTimeFrame] = useState("24h");
  const [topCreators, setTopCreators] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTopCreators = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://nftrade-marketplace.vercel.app/top-creators/${timeFrame}`
      );
      const data = await res.json();

      if (res.ok) {
        setTopCreators(data);
      } else {
        console.error(data.message || "Failed to fetch creators.");
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

  const getBackground = (index) => {
    switch (index) {
      case 0:
        return "linear-gradient(135deg, #FFC107 30%, rgb(240, 209, 33) 60%, #FFF5CC 100%)"; // Gold
      case 1:
        return "linear-gradient(135deg, rgb(95, 103, 112) 30%, #C0C0C0 60%, #E8E8E8 100%)"; // Silver
      case 2:
        return "linear-gradient(135deg, rgb(179, 90, 2) 30%, #B87333 60%, #E3A869 100%)"; // Bronze
      default:
        return "#fff";
    }
  };

  return (
    <Box
      sx={{ padding: "20px", backgroundColor: "#f9f9f9", minHeight: "100vh" }}
    >
      <Typography variant="h4" gutterBottom>
        Top Creators
      </Typography>

      <Box sx={{ marginBottom: "20px" }}>
        {["24h", "7d", "30d"].map((frame) => (
          <Button
            key={frame}
            variant={timeFrame === frame ? "contained" : "outlined"}
            onClick={() => handleTimeFrameChange(frame)}
            sx={{ marginRight: "10px" }}
          >
            Last{" "}
            {frame === "24h"
              ? "24 Hours"
              : frame === "7d"
              ? "7 Days"
              : "30 Days"}
          </Button>
        ))}
      </Box>

      {loading && <CircularProgress />}

      {!loading && topCreators.length > 0 && (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: "20px",
            justifyContent: "center",
          }}
        >
          {topCreators.map((creator, index) => (
            <Card
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
                borderRadius: "12px",
                position: "relative",
                background: getBackground(index),
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  position: "absolute",
                  top: "0px",
                  right: "10px",
                }}
              >
                {index + 1}º
              </Typography>
              <img
                src={creator.profilePicture}
                alt={creator.fullname}
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  border: "3px solid black",
                  marginBottom: "10px",
                }}
              />
              <Typography variant="h6">{creator.fullname}</Typography>
              <Typography variant="body2" color="textSecondary">
                {creator.nftCount} NFTs
              </Typography>
            </Card>
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
