const nftModel = require("../models/NftModel");
const userModel = require("../models/UserModel");

const getTopCreators = async (timeFrame) => {
  try {
    const timeFrames = {
      "24h": 24 * 60 * 60 * 1000, //24H
      "7d": 7 * 24 * 60 * 60 * 1000, //7D
      "30d": 30 * 24 * 60 * 60 * 1000, //30D
    };

    const now = new Date();
    const since = new Date(now - timeFrames[timeFrame]);

    const creators = await nftModel.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: "$creator", nftCount: { $sum: 1 } } },
      { $sort: { nftCount: -1 } },
      { $limit: 10 },
    ]);

    const topCreators = await Promise.all(
      creators.map(async (creator) => {
        const user = await userModel.findById(creator._id).select("fullname profilePicture");
        return {
          userId: user._id,
          fullname: user.fullname,
          profilePicture: user.profilePicture,
          nftCount: creator.nftCount,
        };
      })
    );

    return topCreators;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.exports = { getTopCreators };
