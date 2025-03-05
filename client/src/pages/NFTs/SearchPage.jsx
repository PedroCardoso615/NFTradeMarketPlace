import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
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

const SearchResults = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get("search");

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 100,
    minRoyalty: 0,
    maxRoyalty: 20,
    sort: "",
  });

  useEffect(() => {
    const fetchResults = async () => {
      if (!searchQuery) return;

      const { minPrice, maxPrice, minRoyalty, maxRoyalty, sort } = filters;
      const searchParams = new URLSearchParams({
        search: searchQuery,
        minPrice: minPrice,
        maxPrice: maxPrice,
        minRoyalty: minRoyalty,
        maxRoyalty: maxRoyalty,
        sort: sort,
      });

      try {
        const response = await fetch(
          `http://localhost:5000/nft?${searchParams.toString()}`
        );
        const data = await response.json();
        if (data.success) {
          setResults(Array.isArray(data.data) ? data.data : []);
        }
      } catch (error) {
        console.error("Error fetching search results:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [searchQuery, filters]);

  const handleFilterChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4">Search Results for "{searchQuery}"</Typography>

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

        <Box sx={{ display: "flex", gap: 3 }}>
          <Box>
            <Typography variant="subtitle1">Price Range</Typography>
            <Slider
              value={[filters.minPrice, filters.maxPrice]}
              onChange={(_, newValue) => {
                setFilters((prev) => ({
                  ...prev,
                  minPrice: newValue[0],
                  maxPrice: newValue[1],
                }));
              }}
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
              onChange={(_, newValue) => {
                setFilters((prev) => ({
                  ...prev,
                  minRoyalty: newValue[0],
                  maxRoyalty: newValue[1],
                }));
              }}
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
      ) : results.length > 0 ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: 3,
            mt: 3,
          }}
        >
          {results.map((nft) => (
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
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : (
        <Typography sx={{ mt: 3 }}>No results found.</Typography>
      )}
    </Box>
  );
};

export default SearchResults;