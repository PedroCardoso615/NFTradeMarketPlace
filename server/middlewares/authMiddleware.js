const jwt = require("jsonwebtoken");
const UserModel = require("../models/UserModel");
const { ACCESS_TOKEN_SECRET } = process.env;

const authenticateUser = async (req, res, next) => {
  try {
    let token =
      req.cookies?.accessToken ||
      req.headers.authorization?.split("Bearer ")[1];

      console.log("Token Extracted:", token);

    if (!token) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const payload = jwt.verify(token, ACCESS_TOKEN_SECRET);
    console.log("Payload:", payload);

    const user = await UserModel.findById(payload.userId).select(
      "-password -__v"
    );
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }
};

module.exports = { authenticateUser };
