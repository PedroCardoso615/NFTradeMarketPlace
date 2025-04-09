import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardMedia,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
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
import { debounce } from "lodash";
import { toast } from "react-toastify";

const Catalog = () => {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 100,
    minRoyalty: 0,
    maxRoyalty: 20,
    sort: "",
  });
  const [likedNfts, setLikedNfts] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedNft, setSelectedNft] = useState(null);

  useEffect(() => {
    const fetchNFTs = async () => {
      const { minPrice, maxPrice, minRoyalty, maxRoyalty, sort } = filters;
      const params = new URLSearchParams({
        minPrice,
        maxPrice,
        minRoyalty,
        maxRoyalty,
        sort,
      });

      try {
        const res = await fetch(`https://nf-trade-market-place.vercel.app/nft?${params}`);
        const data = await res.json();
        if (data.success) {
          setNfts(Array.isArray(data.data) ? data.data : []);
        }
      } catch (error) {
        console.error("Error fetching NFTs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, [filters]);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await fetch(`https://nf-trade-market-place.vercel.app/user/favorites`, {
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

  const debouncedHandleFilterChange = debounce((e) => {
    setFilters((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }, 500);

  const handleFilterChange = (e) => {
    debouncedHandleFilterChange(e);
  };

  const handleLike = async (nftId) => {
    try {
      let res;
      if (likedNfts.includes(nftId)) {
        res = await fetch(`https://nf-trade-market-place.vercel.app/nft/favorite/${nftId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
      } else {
        res = await fetch(`https://nf-trade-market-place.vercel.app/nft/favorite/${nftId}`, {
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
      const res = await fetch(
        `https://nf-trade-market-place.vercel.app/nft/buy/${selectedNft._id}`,
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
      <Typography variant="h4">Catalog</Typography>

      <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
        <FormControl sx={{ width: 200 }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            name="sort"
            value={filters.sort}
            onChange={handleFilterChange}
            label="Sort By"
          >
            <MenuItem value="">None</MenuItem>
            <MenuItem value="price_asc">Price: Low to High</MenuItem>
            <MenuItem value="price_desc">Price: High to Low</MenuItem>
            <MenuItem value="likes_asc">Likes: Low to High</MenuItem>
            <MenuItem value="likes_desc">Likes: High to Low</MenuItem>
            <MenuItem value="date_asc">Date: Old to New</MenuItem>
            <MenuItem value="date_desc">Date: New to Old</MenuItem>
            <MenuItem value="name_asc">Name: A to Z</MenuItem>
            <MenuItem value="name_desc">Name: Z to A</MenuItem>
            <MenuItem value="royalty_asc">Royalty: Low to High</MenuItem>
            <MenuItem value="royalty_desc">Royalty: High to Low</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ display: "flex", gap: 5 }}>
          <Box>
            <Typography variant="subtitle1">Price Range</Typography>
            <Slider
              value={[filters.minPrice, filters.maxPrice]}
              onChange={(_, newValue) =>
                setFilters((prev) => ({
                  ...prev,
                  minPrice: newValue[0],
                  maxPrice: newValue[1],
                }))
              }
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${value.toFixed(2)} NFTokens`}
              min={0}
              max={100}
              step={0.01}
            />
          </Box>

          <Box>
            <Typography variant="subtitle1">Royalty Range</Typography>
            <Slider
              value={[filters.minRoyalty, filters.maxRoyalty]}
              onChange={(_, newValue) =>
                setFilters((prev) => ({
                  ...prev,
                  minRoyalty: newValue[0],
                  maxRoyalty: newValue[1],
                }))
              }
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${value}%`}
              min={0}
              max={20}
            />
          </Box>
        </Box>
      </Box>

      {loading ? (
        <CircularProgress sx={{ mt: 3 }} />
      ) : nfts.length > 0 ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: 3,
            mt: 3,
          }}
        >
          {nfts.map((nft) => (
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
                <Typography variant="body2">
                  Owner: {nft.owner?.fullname}
                </Typography>
                <Typography variant="body2">
                  Creator: {nft.creator?.fullname}
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
        <Typography sx={{ mt: 3 }}>No NFTs found.</Typography>
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

export default Catalog;
