import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardMedia,
  CardContent,
  Button,
} from "@mui/material";
import NFToken from "../../images/NFToken.png";
import { toast } from "react-toastify";

const UserCollection = () => {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserNFTs = async () => {
      try {
        const res = await fetch("http://localhost:5000/nft/my-nfts", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Failed to fetch NFTs");
        }

        const data = await res.json();

        if (data.success) {
          setNfts(data.data);
        } else {
          setError(data.message);
        }
      } catch (error) {
        setError("Error fetching NFTs");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserNFTs();
  }, []);

  const handleResell = async (nftId) => {
    try {
      const res = await fetch(`http://localhost:5000/nft/list/${nftId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        setNfts((prevNfts) =>
          prevNfts.map((nft) =>
            nft._id === nftId ? { ...nft, listed: true } : nft
          )
        );
        toast.success("NFT listed successfully");
      } else {
        toast.error("Failed to list NFT");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error listing NFT");
    }
  };

  const handleRemoveSale = async (nftId) => {
    try {
      const res = await fetch(`http://localhost:5000/nft/unlist/${nftId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        setNfts((prevNfts) =>
          prevNfts.map((nft) =>
            nft._id === nftId ? { ...nft, listed: false } : nft
          )
        );
        toast.success("NFT removed from sale");
      } else {
        toast.error("Failed to remove NFT from sale");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error removing NFT from sale");
    }
  };

  if (loading) return <CircularProgress sx={{ mt: 3 }} />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4">My NFT Collection</Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: 3,
          mt: 3,
        }}
      >
        {nfts.length === 0 ? (
          <Typography sx={{ mt: 3 }}>
            No NFTs found in your collection.
          </Typography>
        ) : (
          nfts.map((nft) => (
            <Card
              key={nft._id}
              sx={{
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
                  {nft.NFTName}
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
                  <img src={NFToken} alt="NFToken" style={{ width: 20 }} />
                </Typography>
                <Typography variant="body2">Royalty: {nft.royalty}%</Typography>
                <Typography variant="body2">
                  <strong>Created on:</strong>{" "}
                  {new Date(nft.createdAt).toLocaleDateString()}
                </Typography>

                <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                  {nft.listed ? (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleRemoveSale(nft._id)}
                    >
                      Unlist
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleResell(nft._id)}
                    >
                      Re-sell NFT
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          ))
        )}
      </Box>
    </Box>
  );
};

export default UserCollection;
