const express = require("express");
const { signUp, login, getUsers } = require("../services/userService");
const { validateAccessToken } = require("../services/authService");

const userRouter = express.Router();

userRouter.post("/signup", async (req, res, next) => {
  const { fullname, age, email, password, profilePicture } = req.body;

  try {
    const user = await signUp({
      fullname,
      age,
      email,
      password,
      profilePicture,
    });

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error,
    });
  }
});

userRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { user, accessToken } = await login({ email, password });

    res
      .setHeader(
        "Set-Cookie",
        `accessToken=${accessToken}; HttpOnly; Max-Age=1800;`
      )
      .json({
        success: true,
        user,
        accessToken,
      });
  } catch (error) {
    console.error(error);
    res.status(401).json({
      success: false,
      error: "Unauthorized",
    });
  }
});

userRouter.get(
  "",
  async (req, res, next) => {
    console.log("req.headers", req.headers);
    const { authorization } = req.headers;

    if (!authorization || "" === authorization) {
      return res.status(401).send({
        success: false,
        error: "Unauthorized",
      });
    }

    req.authorization = authorization;
    next();
  },
  (req, res, next) => {
    const { authorization } = req;

    const [_, accessToken] = authorization.split('Bearer ');
    console.log('accessToken', accessToken);

    req.accessToken = accessToken;

    try {
        const payload = validateAccessToken(accessToken);
        console.log('payload', payload);

        req.userId = payload.userId;
        req.email = payload.email;
        req.permissions = payload.permissions;

        next();
    } catch (error) {
        console.error(error);
        return res.status(401).send({
            success: false,
            error: "Unauthorized",
        })
    }
  },
  async (req, res, next) => {
    try {
        const users = await getUsers();
    
        return res.send({
            success: true,
            users,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            error
        });
    }
  }
);

module.exports = userRouter;