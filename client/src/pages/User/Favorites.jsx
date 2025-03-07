import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardMedia,
  CardContent,
  Button,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder"; // Now it's used
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import NFToken from "../../images/NFToken.png";
import { toast } from "react-toastify";

const Favorites = () => {
  const [likedNfts, setLikedNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedNft, setSelectedNft] = useState(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await fetch("http://localhost:5000/user/favorites", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.favorites)) {
          setLikedNfts(data.favorites);
        } else {
          setLikedNfts([]);
        }
      } catch (error) {
        console.error("Error fetching favorites:", error);
        setLikedNfts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const handleLike = async (nftId) => {
    try {
      let res;
      res = await fetch(`http://localhost:5000/nft/favorite/${nftId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        setLikedNfts((prev) => prev.filter((nft) => nft._id !== nftId));
        toast.success("NFT removed from favorites!");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error removing NFT from favorites:", error);
      toast.error("Error removing NFT from favorites.");
    }
  };

  const handleBuyClick = (nft) => {
    setSelectedNft(nft);
    setOpenDialog(true);
  };

  const handleCancel = () => {
    setOpenDialog(false);
    setSelectedNft(null);
  };

  const handleBuy = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/nft/buy/${selectedNft._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      const data = await res.json();

      if (data.success) {
        toast.success("NFT purchased successfully!");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error buying NFT:", error);
      toast.error("Error purchasing NFT.");
    } finally {
      setOpenDialog(false);
      setSelectedNft(null);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4">Favorites</Typography>

      {loading ? (
        <CircularProgress sx={{ mt: 3 }} />
      ) : likedNfts.length > 0 ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: 3,
            mt: 3,
          }}
        >
          {likedNfts.map((nft) => (
            <Card
              key={nft._id}
              sx={{
                border: "1px solid #ccc",
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
                  <img
                    src={NFToken}
                    alt="NFToken"
                    style={{ width: 35, height: 35 }}
                  />
                </Typography>

                <Typography variant="body2">Royalty: {nft.royalty}%</Typography>

                <Box
                  sx={{
                    mt: 2,
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <IconButton
                    onClick={() => handleLike(nft._id)}
                    sx={{
                      color: "red",
                    }}
                  >
                    {likedNfts.some((likedNft) => likedNft._id === nft._id) ? (
                      <FavoriteIcon />
                    ) : (
                      <FavoriteBorderIcon />
                    )}
                  </IconButton>
                  <Button
                    onClick={() => handleBuyClick(nft)}
                    variant="outlined"
                    color="primary"
                    startIcon={<ShoppingCartIcon />}
                  >
                    Buy
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : (
        <Typography sx={{ mt: 3 }}>No favorites found.</Typography>
      )}

      <Dialog open={openDialog} onClose={handleCancel}>
        <DialogTitle>Buy NFT</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", gap: 2 }}>
            <img
              src={selectedNft?.image}
              alt={selectedNft?.NFTName}
              style={{ width: "100px", height: "100px", objectFit: "cover" }}
            />
            <Box>
              <Typography variant="h6">{selectedNft?.NFTName}</Typography>
              <Typography variant="body2">
                {selectedNft?.description}
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography
                variant="body1"
                sx={{ display: "flex", alignItems: "center" }}
              >
                <strong>Price:</strong> {selectedNft?.price}{" "}
                <img
                  src={NFToken}
                  alt="NFToken"
                  style={{ width: 30, height: 30 }}
                />
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>Cancel</Button>
          <Button onClick={handleBuy} color="primary">
            Buy
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Favorites;
