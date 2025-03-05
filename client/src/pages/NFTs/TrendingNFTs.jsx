import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardMedia,
  CardContent,
} from "@mui/material";
import NFToken from "../../images/NFToken.png";

const TrendingNFTs = () => {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrendingNFTs = async () => {
      try {
        const res = await fetch("http://localhost:5000/trending-nfts");
        if (!res.ok) {
          throw new Error("Failed to fetch trending NFTs");
        }
        const data = await res.json();
        setNfts(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingNFTs();
  }, []);

  if (loading) return <CircularProgress sx={{ mt: 3 }} />;
  if (error) return <Typography color="error">Error: {error}</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4">Trending NFTs</Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: 3,
          mt: 3,
        }}
      >
        {nfts.map((nft, index) => (
          <Card
            key={nft._id}
            sx={{
              border:
                index === 0
                  ? "3px solid gold"
                  : index === 1
                  ? "3px solid silver"
                  : index === 2
                  ? "3px solid #cd7f32"
                  : "none",
              borderRadius: "8px",
              transition: "transform 0.3s ease",
              "&:hover": { transform: "scale(1.05)" },
            }}
          >
            <CardMedia
              component="img"
              height="300"
              image={nft.image}
              alt={nft.NFTName}
            />
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                #{index + 1} - {nft.NFTName}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {nft.description}
              </Typography>
              <Typography
                variant="body1"
                fontWeight="bold"
                sx={{ display: "flex", alignItems: "center" }}
              >
                {nft.price}
                <img
                  src={NFToken}
                  alt="NFToken"
                  style={{ width: 35, height: 35 }}
                />
              </Typography>
              <Typography variant="body2">Owner: {nft.owner?.fullname}</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Creator: {nft.creator?.fullname}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Royalty: {nft.royalty}%
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default TrendingNFTs;