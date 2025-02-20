const express = require("express");
const { authenticateUser } = require("../middlewares/authMiddleware");
const nftModel = require("../models/NFTModel");
const transactionModel = require("../models/TransactionModel");
const userModel = require("../models/UserModel");
const notificationModel = require("../models/NotificationModel");

const nftRouter = express.Router();

{/*Create NFT*/}
nftRouter.post("/create", authenticateUser, async (req, res, next) => {
  const { NFTName, description, price, image } = req.body;

  try {
    const newNFT = new nftModel({
      NFTName,
      description,
      price,
      image,
      creator: req.user._id,
      owner: req.user._id,
    });

    await newNFT.save();
    res.status(201).json({
      success: true,
      message: "NFT created successfully",
      data: newNFT,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failded to create NFT",
    });
  }
});

{/*Update NFT and Notify Following Users*/}
nftRouter.put("/update/:nftId", authenticateUser, async (req, res, next) => {
  const { NFTName, description, price, image } = req.body;
  const { nftId } = req.params;

  try {
    const nft = await nftModel.findById(nftId);

    if (!nft) {
      return res.status(404).json({
        success: false,
        message: "NFT not found",
      });
    }

    if (nft.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this NFT",
      });
    }

    nft.NFTName = NFTName || nft.NFTName;
    nft.description = description || nft.description;
    nft.price = price || nft.price;
    nft.image = image || nft.image;

    await nft.save();

    const followers = await userModel.find({
      favorites: nftId,
    });

    for (const user of followers) {
      const newNotification = new notificationModel({
        user: user._id,
        message: `NFT ${nft.NFTName} has been updated by ${req.user.fullname}`,
      });

      await newNotification.save();
    }

    res.status(200).json({
      success: true,
      message: "NFT updated successfully",
      data: nft,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to update NFT",
    });
  }
});

{/*Delete NFT*/}
nftRouter.delete("/delete/:nftId", authenticateUser, async (req, res, next) => {
  const { nftId } = req.params;

  try {
    const nft = await nftModel.findById(nftId);

    if(!nft) {
      return res.status(404).json({
        success: false,
        message: "NFT not found",
      });
    }

    if (nft.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this NFT",
      });
    }

    if (nft.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Cannot delete this NFT as it has been sold",
      });
    }

    await nftModel.findByIdAndDelete(nftId);

    res.status(200).json({
      success: true,
      message: "NFT deleted successfully",
    });
  } catch(error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to delete NFT",
    });
  }
});

{/*LoggedIn User NFT's*/}
nftRouter.get("/my-nfts", authenticateUser, async (req, res, next) => {
  try {
    const userNfts = await nftModel.find({ owner: req.user._id });

    if (userNfts.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No NFTs found",
      });
    }

    return res.status(200).json({
      success: true,
      data: userNfts,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch NFTs",
    });
  }
});

{/*Buy and Transfer NFT ownership*/}
nftRouter.post("/buy/:nftId", authenticateUser, async (req, res, next) => {
  const { nftId } = req.params;

  try {
    const nft = await nftModel.findById(nftId).populate("owner");
    if (!nft) {
      return res.status(404).json({
        success: false,
        message: "NFT not found",
      });
    }

    if (nft.owner._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You already own this NFT",
      });
    }

    if (req.user.balance < nft.price) {
      return res.status(400).json({
        success: false,
        message: "Insufficient balance",
      });
    }

    const newTransaction = new transactionModel({
      nft: nft._id,
      seller: nft.owner._id,
      buyer: req.user._id,
      price: nft.price,
    });

    await newTransaction.save();

    await userModel.findByIdAndUpdate(req.user._id, {
      $inc: { balance: -nft.price },
    });
    await userModel.findByIdAndUpdate(nft.owner._id, {
      $inc: { balance: nft.price },
    });

    nft.owner = req.user._id;
    await nft.save();

    res.status(200).json({
      success: true,
      message: "NFT bought successfully",
      data: newTransaction,
    });
  } catch (error) {
    console.log("Error buying the NFT", error);
    res.status(500).json({
      success: false,
      message: "Error buying the NFT",
      error: error.message,
    });
  }
});

{/*Add NFT to Favorites*/}
nftRouter.post("/favorite/:nftId", authenticateUser, async (req, res, next) => {
  const { nftId } = req.params;

  try {
    const nft = await nftModel.findById(nftId);
    if (!nft) {
      return res.status(404).json({
        success: false,
        message: "NFT not found",
      });
    }

    const user = await userModel.findById(req.user._id);
    if (user.favorites.includes(nftId)) {
      return res.status(400).json({
        success: false,
        message: "NFT already in favorites",
      });
    }

    user.favorites.push(nftId);
    await user.save();

    res.json({
      success: true,
      message: "NFT added to favorites",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add NFT to favorites",
    });
  }
});

{/*Remove NFT from Favorites*/}
nftRouter.delete("/favorite/:nftId", authenticateUser, async (req, res, next) => {
  const { nftId } = req.params;

  try {
    const user = await userModel.findById(req.user._id);
    user.favorites = user.favorites.filter((id) => id.toString() !== nftId);
    await user.save();

    res.json({
      success: true,
      message: "NFT removed from favorites",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to remove NFT from favorites",
    });
  }
});

{/*Transaction History*/}
nftRouter.get(
  "/transaction-history",
  authenticateUser,
  async (req, res, next) => {
    try {
      const transactions = await transactionModel
        .find({
          $or: [{ buyer: req.user._id }, { seller: req.user._id }],
        })
        .populate("nft")
        .populate("buyer")
        .populate("seller");

      if (transactions.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No transactions found",
        });
      }

      res.status(200).json({
        success: true,
        data: transactions,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch transactions",
      });
    }
  }
);

module.exports = nftRouter;
