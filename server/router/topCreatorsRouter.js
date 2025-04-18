const express = require("express");
const { getTopCreators } = require("../services/topCreatorsService");

const creatorsRouter = express.Router();

creatorsRouter.get("/:timeFrame", async (req, res) => {
  const { timeFrame } = req.params;

  try {
    if (!["24h", "7d", "30d"].includes(timeFrame)) {
      return res.status(400).json("Invalid time frame");
    }

    const topCreators = await getTopCreators(timeFrame);

    if (topCreators.length === 0) {
      return res.status(200).json([]);
    }

    res.json(topCreators);
  } catch(error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch Top Creators"
    });
  }
});

module.exports = creatorsRouter;