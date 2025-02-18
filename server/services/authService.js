const JWT = require("jsonwebtoken");
const { ACCESS_TOKEN_SECRET } = process.env;

const createAccessToken = ({ userId, email, permissions }) => {
  return JWT.sign(
    {
      userId,
      email,
      permissions,
    },
    ACCESS_TOKEN_SECRET,
    {
      expiresIn: 30 * 60,
    }
  );
};

const validateAccessToken = (accessToken) => {
  return JWT.verify(accessToken, ACCESS_TOKEN_SECRET);
};

module.exports = {
    createAccessToken,
    validateAccessToken,
    };