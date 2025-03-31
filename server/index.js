const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const { PORT } = process.env;

const { createConnectionWithDb, closeConnectionWithDb } = require("./db");
const userRouter = require("./router/userRouter");
const nftRouter = require("./router/nftRouter");
const creatorsRouter = require("./router/topCreatorsRouter");
const trendnftRouter = require("./router/topNFTsRouter");
const notificationRouter = require("./router/notificationRouter");
const checkDailyRewards = require("./utils/dailyRewardCheck");

const app = express();

const corsOptions = {
  origin: ["http://localhost:3000", "https://nftrade-marketplace.vercel.app"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
};

const configureApi = () => {
  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.use(cookieParser());

  app.use("/user", userRouter);
  app.use("/nft", nftRouter);
  app.use("/top-creators", creatorsRouter);
  app.use("/trending-nfts", trendnftRouter);
  app.use("/notification", notificationRouter);
};

const startUpServer = async () => {
  console.log("Starting up server...");

  configureApi();
  await createConnectionWithDb();

  checkDailyRewards();
  
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

const shutDownServer = async () => {
  await closeConnectionWithDb();
  process.exit(0);
};

process.on("SIGINT", shutDownServer);

startUpServer().catch((error) => {
  console.error("Error starting up server:", error);
  shutDownServer();
});