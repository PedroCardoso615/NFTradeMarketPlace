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
} from "@mui/material";
import NFToken from "../../images/NFToken.png";

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
        const res = await fetch(`http://localhost:5000/nft?${params}`);
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

  const handleFilterChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
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
      ) : (
        <Typography sx={{ mt: 3 }}>No NFTs found.</Typography>
      )}
    </Box>
  );
};

export default Catalog;