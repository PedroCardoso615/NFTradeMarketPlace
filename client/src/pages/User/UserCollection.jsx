import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardMedia,
  CardContent,
  Button,
  Modal,
  TextField,
} from "@mui/material";
import NFToken from "../../images/NFToken.png";
import { toast } from "react-toastify";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

const UserCollection = () => {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectedNft, setSelectedNft] = useState(null);
  const [updatedData, setUpdatedData] = useState({
    NFTName: "",
    description: "",
    price: 0,
    image: "",
  });
  const [isCreator, setIsCreator] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/user/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        const data = await res.json();
        if (data.success) {
          setUserId(data.user._id);
        } else {
          toast.error("Failed to fetch user profile");
        }
      } catch (error) {
        toast.error("Error fetching user profile");
        console.error(error);
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    const fetchUserNFTs = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/nft/my-nfts`, {
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

  const handleUpdateClick = (nft) => {
    setSelectedNft(nft);
    setUpdatedData({
      NFTName: nft.NFTName,
      description: nft.description,
      price: nft.price,
      image: nft.image,
    });

    if (userId === nft.creator) {
      setIsCreator(true);
    } else {
      setIsCreator(false);
    }

    setOpenModal(true);
  };

  const handleUpdate = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/nft/update/${selectedNft._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        setNfts((prevNfts) =>
          prevNfts.map((nft) =>
            nft._id === selectedNft._id ? { ...nft, ...updatedData } : nft
          )
        );
        toast.success("NFT updated successfully");
        setOpenModal(false);
      } else {
        toast.error("Failed to update NFT");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error updating NFT");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleResell = async (nftId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/nft/list/${nftId}`, {
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
      const res = await fetch(`${API_BASE_URL}/nft/unlist/${nftId}`, {
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

  if (error)
    return (
      <Typography variant="h6" color="textSecondary">
        {error}
      </Typography>
    );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4">NFT Collection</Typography>

      {loading ? (
        <Box
          sx={{
            height: "60vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress size={50} />
        </Box>
      ) : null}

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
                  <img
                    src={NFToken}
                    alt="NFToken"
                    style={{ width: 35, height: 35 }}
                  />
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
                      List NFT
                    </Button>
                  )}
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => handleUpdateClick(nft)}
                  >
                    Update
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))
        )}
      </Box>

      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        aria-labelledby="update-nft-modal"
        aria-describedby="modal-to-update-nft-details"
      >
        <Box
          sx={{
            maxWidth: 400,
            margin: "auto",
            mt: 25,
            p: 3,
            bgcolor: "white",
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Update NFT
          </Typography>
          <TextField
            fullWidth
            label="NFT Name"
            name="NFTName"
            value={updatedData.NFTName}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
            disabled={!isCreator}
          />
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={updatedData.description}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
            disabled={!isCreator}
          />
          <TextField
            fullWidth
            label="Price"
            type="number"
            name="price"
            value={updatedData.price}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpdate}
            fullWidth
          >
            Update NFT
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default UserCollection;
