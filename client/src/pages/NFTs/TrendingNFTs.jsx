import React, { useEffect, useState } from "react";
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
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import NFToken from "../../images/NFToken.png";
import { toast } from "react-toastify";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

const TrendingNFTs = () => {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState(null);
  const [likedNfts, setLikedNfts] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedNft, setSelectedNft] = useState(null);

  useEffect(() => {
    const fetchTrendingNFTs = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/trending-nfts`);
        if (!res.ok) {
          throw new Error("Failed to fetch trending NFTs");
        }
        const data = await res.json();
        setNfts(data);
      } catch (error) {
        console.error("Error fetching the NFTs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingNFTs();
  }, []);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/user/favorites`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
          setLikedNfts(data.favorites.map((fav) => fav._id));
        }
      } catch (error) {
        console.error("Error fetching favorites:", error);
      }
    };

    fetchFavorites();
  }, []);

  if (error) return <Typography color="error">Error: {error}</Typography>;

  const handleLike = async (nftId) => {
    try {
      let res;
      if (likedNfts.includes(nftId)) {
        res = await fetch(`${API_BASE_URL}/nft/favorite/${nftId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
      } else {
        res = await fetch(`${API_BASE_URL}/nft/favorite/${nftId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
      }

      const data = await res.json();

      if (data.success) {
        if (likedNfts.includes(nftId)) {
          setLikedNfts((prev) => prev.filter((id) => id !== nftId));
          toast.success("NFT removed from favorites!");
        } else {
          setLikedNfts((prev) => [...prev, nftId]);
          toast.success("NFT added to favorites!");
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error toggling like on NFT:", error);
      toast.error("Error updating favorite status.");
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
      const res = await fetch(`${API_BASE_URL}/nft/buy/${selectedNft._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        toast.success("NFT purchased successfully!");
        setNfts((prev) =>
          prev.map((nft) =>
            nft._id === selectedNft._id
              ? { ...nft, owner: { fullname: "You" } }
              : nft
          )
        );
        setNfts((prev) => prev.filter((nft) => nft._id !== selectedNft._id));
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
      <Typography variant="h4">Trending NFTs</Typography>

      {loading ? (
        <Box
          sx={{
            height: "50vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress />
        </Box>
      ) : nfts.length === 0 ? (
        <Typography sx={{ mt: 3 }}>No NFTs found...</Typography>
      ) : (
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
                position: "relative",
                bgcolor: "#fff",
                borderRadius: "12px",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                "&:hover": {
                  transform: "scale(1.05)",
                  boxShadow: "0px 4px 20px rgba(0,0,0,0.2)",
                }
              }}
            >
              <CardMedia
                component="img"
                height="300"
                image={nft.image}
                alt={nft.NFTName}
                sx={{ borderRadius: "12px" }}
              />
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  {index + 1}º - {nft.NFTName}
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
                <Typography variant="body2">
                  Owner: {nft.owner?.fullname}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Creator: {nft.creator?.fullname}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Royalty: {nft.royalty}%
                </Typography>

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
                      color: likedNfts.includes(nft._id) ? "red" : "gray",
                    }}
                  >
                    {likedNfts.includes(nft._id) ? (
                      <FavoriteIcon />
                    ) : (
                      <FavoriteBorderIcon />
                    )}
                  </IconButton>
                  <Button
                    onClick={() => handleBuyClick(nft)}
                    variant="outlined"
                    color=""
                    startIcon={<ShoppingCartIcon />}
                  >
                    Buy
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      <Dialog open={openDialog} onClose={handleCancel}>
        <DialogTitle>Buy NFT</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", gap: 2 }}>
            <img
              src={selectedNft?.image}
              alt={selectedNft?.NFTName}
              style={{ width: "200px", height: "200px", objectFit: "cover" }}
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

export default TrendingNFTs;
