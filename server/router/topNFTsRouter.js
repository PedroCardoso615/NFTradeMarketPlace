const express = require('express');
const { getTopNFTs } = require('../services/topNFTsService');

const trendnftRouter = express.Router();

trendnftRouter.get('/', async (req, res) => {
    try {
        const topNFTs = await getTopNFTs();

        if (topNFTs.length === 0) {
            return res.status(404).json("No NFT's found");
        }

        res.json(topNFTs);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch Trending NFTs"
        });
    }
});

module.exports = trendnftRouter;