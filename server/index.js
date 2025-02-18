const express = require("express");
const cors = require("cors");

require("dotenv").config();
const { PORT } = process.env;

const { createConnectionWithDb, closeConnectionWithDb } = require("./db");
const userRouter = require("./router/userRouter");

const app = express();

const configureApi = () => {
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use("/user", userRouter);
}

const startUpServer = async () => {
    console.log("Starting up server...");

    configureApi();
    await createConnectionWithDb();

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

const shutDownServer = async () => {
    await closeConnectionWithDb();
    process.exit(0);
}

process.on("SIGINT", shutDownServer);

startUpServer().catch((error) => {
    console.error("Error starting up server:", error);
    shutDownServer();
});