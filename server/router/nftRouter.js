const express = require("express");
const { authenticateUser } = require("../middlewares/authMiddleware");
const nftModel = require("../models/NFTModel");
const transactionModel = require("../models/TransactionModel");
const userModel = require("../models/UserModel");

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

    await userModel.findByIdAndUpdate(req.user._id, { $inc: { balance: -nft.price } });
    await userModel.findByIdAndUpdate(nft.owner._id, { $inc: { balance: nft.price } });

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
