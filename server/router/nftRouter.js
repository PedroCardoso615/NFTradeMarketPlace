const express = require("express");
const mongoose = require("mongoose");
const { authenticateUser } = require("../middlewares/authMiddleware");
const nftModel = require("../models/NFTModel");
const transactionModel = require("../models/TransactionModel");
const userModel = require("../models/UserModel");
const notificationModel = require("../models/NotificationModel");

const nftRouter = express.Router();

{/*Create NFT*/}
nftRouter.post("/create", authenticateUser, async (req, res, next) => {
  const { NFTName, description, price, image, royalty } = req.body;

  try {
    const newNFT = new nftModel({
      NFTName,
      description,
      price,
      image,
      creator: req.user._id,
      owner: req.user._id,
      listed: true,
      royalty: royalty || 5,
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

    const isCreator = nft.creator.toString() === req.user._id.toString();
    const isOwner = nft.owner.toString() === req.user._id.toString();

    if (isCreator && isOwner) {
      nft.NFTName = NFTName || nft.NFTName;
      nft.description = description || nft.description;
      nft.price = price || nft.price;
      nft.image = image || nft.image;
    } else if (!isCreator && isOwner) {
      nft.price = price || nft.price;
    } else {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this NFT",
      });
    }

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

{/*Buy and Transfer NFT ownership, Refund and Royalties*/}
nftRouter.post("/buy/:nftId", authenticateUser, async (req, res) => {
  const { nftId } = req.params;
  const buyerId = req.user._id;
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const nft = await nftModel.findById(nftId).populate("owner creator").session(session);
    if (!nft || !nft.listed) {
      throw new Error("NFT not found or not for sale");
    }

    const buyer = await userModel.findById(buyerId).session(session);
    const seller = await userModel.findById(nft.owner).session(session);
    const creator = nft.creator;

    if (!buyer || !seller || !creator) {
      throw new Error("User not found");
    }

    if (buyer.balance < nft.price) {
      throw new Error("Insufficient balance");
    }

    const royaltyPercentage = Number(nft.royalty) || 5;
    let royaltyFee = seller._id.toString() !== creator._id.toString()
      ? Math.max(nft.price * (royaltyPercentage / 100), 0.01)
      : 0;

    royaltyFee = parseFloat(royaltyFee.toFixed(2));

    console.log(`Royalty Fee: ${royaltyFee} | Seller: ${seller.fullname} | Creator: ${creator.fullname}`);

    buyer.balance -= nft.price;
    seller.balance += nft.price - royaltyFee;

    if (royaltyFee > 0) {
      creator.balance += royaltyFee;
      console.log(`Paying royalties of ${royaltyFee} to ${creator.fullname}`);
      await creator.save({ session });

      await notificationModel.create({
        user: creator._id,
        message: `You received ${royaltyFee} NFTokens in royalties from the resale of ${nft.NFTName}.`,
      });
    }

    await notificationModel.create({
      user: seller._id,
      message: `Your NFT ${nft.NFTName} was purchased by ${buyer.fullname} for ${nft.price} NFTokens.`,
    });

    nft.owner = buyer._id;
    nft.listed = false;

    await buyer.save({ session });
    await seller.save({ session });
    await nft.save({ session });

    await transactionModel.create([{
      nft: nft._id,
      seller: seller._id,
      buyer: buyer._id,
      creator: creator._id,
      price: nft.price,
      royalties: royaltyFee,
      transactionStatus: "Completed",
    }], { session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: "NFT purchased successfully",
      data: nft,
    });

  } catch (error) {
    console.log("Transaction error:", error);

    await session.abortTransaction();
    session.endSession();

    res.status(500).json({
      success: false,
      message: "Transaction failed, amount refunded",
    });
  }
});

{/*Re-sell NFT*/}
nftRouter.put("/list/:nftId", authenticateUser, async (req, res, next) => {
  const { nftId } = req.params;

  try {
    const nft = await nftModel.findById(nftId);
    if (!nft) {
      return res.status(404).json({
        success: false,
        message: "NFT not found",
      });
    }
    
    if(nft.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to list this NFT",
      });
    }

    nft.listed = true;
    await nft.save();

    res.status(200).json({
      success: true,
      message: "NFT listed successfully",
      data: nft,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to list NFT",
    });
  }
});

{/*Remove NFT from Sale*/}
nftRouter.put("/unlist/:nftId", authenticateUser, async (req, res, next) => {
  const { nftId } = req.params;

  try {
    const nft = await nftModel.findById(nftId);

    if (!nft) {
      return res.status(404).json({
        success: false,
        message: "NFT not found",
      });
    }

    if(nft.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to unlist this NFT",
      });
    }

    nft.listed = false;
    await nft.save();

    await userModel.updateMany(
      { favorites: nftId },
      { $pull: { favorites: nftId } }
    );

    if (nft.likedBy.length > 0) {
      const notifications = nft.likedBy.map((userId) => ({
        user: userId,
        message: `The NFT ${nft.NFTName} is no longer for sale.`,
      }));

      await notificationModel.insertMany(notifications);
    }

    res.status(200).json({
      success: true,
      message: "NFT unlisted successfully",
      data: nft,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to unlist NFT",
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

    if (!nft.likedBy.includes(req.user._id)) {
      nft.likedBy.push(req.user._id);
      await nft.save();
    }

    if (!nft.owner) {
      return res.status(500).json({
        success: false,
        message: "NFT owner information is missing",
      });
    }

    if (nft.owner.toString() !== req.user._id.toString()) {
      try {
        await notificationModel.create({
          user: nft.owner,
          message: `${req.user.fullname || "Someone"} added your NFT ${nft.NFTName} to favorites.`,
        });
      } catch (notifError) {
        console.error("Failed to create notification:", notifError);
      }
    }

    res.json({
      success: true,
      message: "NFT added to favorites",
    });
  } catch (error) {
    console.error("Error in adding NFT to favorites:", error);
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
    const nft = await nftModel.findById(nftId);

    if (!nft) {
      return res.status(404).json({
        success: false,
        message: "NFT not found",
      });
    }

    user.favorites = user.favorites.filter((id) => id.toString() !== nftId);
    await user.save();

    nft.likedBy = nft.likedBy.filter((id) => id.toString() !== req.user._id.toString());
    await nft.save();

    res.json({
      success: true,
      message: "NFT removed from favorites",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to remove NFT from favorites",
    });
  }
});

{/*Get All NFT's*/}
nftRouter.get("", async (req, res, next) => {
  try {
    const listedNfts = await nftModel.find({listed: true}).populate("owner").populate("creator");
    res.status(200).json({
      success: true,
      data: listedNfts,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch NFTs",
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

{/*Total Earnings*/}
nftRouter.get("/earnings", authenticateUser, async (req, res, next) => {
  try {
    const userId = req.user._id;
    const soldNFTs = await transactionModel.find({ seller: userId });

    const royaltyEarnings = await transactionModel.find({ 
      creator: userId,
      royalties: { $gt: 0 } 
    });

    const totalSales = soldNFTs.reduce((sum, txn) => sum + (txn.price - txn.royalties), 0);

    const totalRoyalties = royaltyEarnings.reduce((sum, txn) => sum + txn.royalties, 0);

    res.status(200).json({
      success: true,
      totalSales,
      totalRoyalties,
      totalEarnings: totalSales + totalRoyalties,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch earnings",
    });
  }
});

module.exports = nftRouter;
