const nftModel = require("../models/NftModel");
const userModel = require("../models/UserModel");

const getTopNFTs = async () => {
    try{
        const trendingNFTs = await nftModel
        .find({ listed: true })
        .sort({ likedBy: -1 })
        .limit(15) //Top 15 Liked NFT's
        .populate("creator", "fullname profilePicture")
        .populate("owner", "fullname profilePicture");

        return trendingNFTs;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

module.exports = { getTopNFTs };