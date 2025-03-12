import { useState, useRef } from "react";
import { storage } from "../../config/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from "react-toastify";
import { Box, TextField, Button, Typography, Input, IconButton } from "@mui/material";
import { CloudUpload } from "@mui/icons-material";

const CreateNFT = () => {
  const [NFTName, setNFTName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [royalty, setRoyalty] = useState("");
  const [image, setImage] = useState(null);
  const fileInputRef = useRef();

  const handleNFTCreation = async () => {
    if (!NFTName || !description || !price || !royalty || !image) {
      toast.error("All fields are required!", { position: "top-right" });
      return;
    }

    const parsedPrice = Number(price);
    const parsedRoyalty = Number(royalty);

    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      toast.error("Price must be a positive number.", { position: "top-right" });
      return;
    }

    if (isNaN(parsedRoyalty) || parsedRoyalty < 0 || parsedRoyalty > 20) {
      toast.error("Royalty must be between 0% and 20%.", { position: "top-right" });
      return;
    }

    try {
      const imageRef = ref(storage, `nftImages/${image.name}`);
      await uploadBytes(imageRef, image);
      const imgUrl = await getDownloadURL(imageRef);

      const res = await fetch("https://nftrade-marketplace.vercel.app/nft/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          NFTName,
          description,
          price: parsedPrice,
          image: imgUrl,
          royalty: parsedRoyalty,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create NFT.");

      toast.success("NFT Created Successfully!", { position: "top-right" });

      setNFTName("");
      setDescription("");
      setPrice("");
      setRoyalty("");
      setImage(null);
      fileInputRef.current.value = "";
    } catch (err) {
      toast.error(err.message || "NFT creation failed.", { position: "top-right" });
      console.error(err);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", p: 4, mt: 3, boxShadow: 3, borderRadius: 2 }}>
      <Typography variant="h5" sx={{ textAlign: "center", mb: 2 }}>Create NFT</Typography>

      <TextField
        fullWidth
        label="NFT Name"
        variant="outlined"
        value={NFTName}
        onChange={(e) => setNFTName(e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        multiline
        rows={3}
        label="Description"
        variant="outlined"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        type="number"
        label="Price"
        variant="outlined"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        type="number"
        label="Royalty (0-20%)"
        variant="outlined"
        value={royalty}
        onChange={(e) => setRoyalty(e.target.value)}
        sx={{ mb: 2 }}
      />

      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <Input
          type="file"
          accept="image/*"
          inputRef={fileInputRef}
          onChange={(e) => setImage(e.target.files[0])}
          sx={{ display: "none" }}
        />
        <IconButton color="primary" component="label">
          <input type="file" hidden ref={fileInputRef} onChange={(e) => setImage(e.target.files[0])} />
          <CloudUpload />
        </IconButton>
        <Typography>{image ? image.name : "Upload NFT Image"}</Typography>
      </Box>

      <Button variant="contained" fullWidth onClick={handleNFTCreation}>
        Create NFT
      </Button>
    </Box>
  );
};

export default CreateNFT;
