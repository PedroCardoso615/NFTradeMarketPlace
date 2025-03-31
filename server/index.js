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

// List of allowed origins
const allowedOrigins = [
  "http://localhost:3000",
  "https://nftrade-marketplace.vercel.app",
];

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Manually set headers for credentials support
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Routes
app.use("/user", userRouter);
app.use("/nft", nftRouter);
app.use("/top-creators", creatorsRouter);
app.use("/trending-nfts", trendnftRouter);
app.use("/notification", notificationRouter);

// Start server
const startUpServer = async () => {
  console.log("Starting up server...");

  await createConnectionWithDb();
  checkDailyRewards();

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

// Shutdown server gracefully
const shutDownServer = async () => {
  await closeConnectionWithDb();
  process.exit(0);
};

// Handle shutdown signals
process.on("SIGINT", shutDownServer);

// Start server
startUpServer().catch((error) => {
  console.error("Error starting up server:", error);
  shutDownServer();
});
