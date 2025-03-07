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
        const res = await fetch("http://localhost:5000/trending-nfts");
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

  if (loading) return <CircularProgress sx={{ mt: 3 }} />;
  if (error) return <Typography color="error">Error: {error}</Typography>;

  const handleLike = async (nftId) => {
    try {
      let res;
      if (likedNfts.includes(nftId)) {
        res = await fetch(`http://localhost:5000/nft/favorite/${nftId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
      } else {
        res = await fetch(`http://localhost:5000/nft/favorite/${nftId}`, {
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
      const res = await fetch(`http://localhost:5000/nft/buy/${selectedNft._id}`, {
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
            nft._id === selectedNft._id ? { ...nft, owner: { fullname: "You" } } : nft
          )
        );
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

      {/* Display "No NFTs Found" message if no NFTs are available */}
      {nfts.length === 0 ? (
        <Typography sx={{ mt: 3 }}>No NFTs found.</Typography>
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
                <Typography variant="body2">
                  Owner: {nft.owner?.fullname}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Creator: {nft.creator?.fullname}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Royalty: {nft.royalty}%
                </Typography>

                <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
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
                    variant="contained"
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
      )}

      {/* Purchase Confirmation Dialog */}
      <Dialog open={openDialog} onClose={handleCancel}>
        <DialogTitle>Confirm Purchase</DialogTitle>
        <DialogContent>
          {selectedNft && (
            <Box sx={{ minWidth: 400 }}>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                {selectedNft.NFTName}
              </Typography>
              <Typography sx={{ mb: 1, color: "textSecondary" }}>
                {selectedNft.description}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" sx={{display:"flex", alignItems:"center"}}>
                  <strong>Price:</strong> {selectedNft.price}{" "}
                  <img src={NFToken} alt="NFToken" style={{ width: 20 }} />
                </Typography>
                <Typography variant="body1">
                  <strong>Owner:</strong> {selectedNft.owner.fullname}
                </Typography>
                <Typography variant="body1">
                  <strong>Creator:</strong> {selectedNft.creator.fullname}
                </Typography>
                <Typography variant="body1">
                  <strong>Royalty:</strong> {selectedNft.royalty}%
                </Typography>
                <Typography variant="body1">
                  <strong>Created on:</strong> {new Date(selectedNft.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} sx={{ color: "red" }}>
            Cancel
          </Button>
          <Button onClick={handleBuy} color="primary">
            Confirm Purchase
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TrendingNFTs;

