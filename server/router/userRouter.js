const express = require("express");
const { signUp, login, getUsers } = require("../services/userService");
const { validateAccessToken } = require("../services/authService");
const { authenticateUser } = require("../middlewares/authMiddleware");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const userModel = require("../models/UserModel");
const sendEmail = require("../utils/sendResetEmail");

const userRouter = express.Router();

{/*Sign Up*/}
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
    });
  }
});

{/*Login*/}
userRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { user, accessToken } = await login({ email, password });

    res.setHeader("Access-Control-Allow-Credentials", "true");

    res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 30 * 60 * 1000,
      })
      .status(200)
      .json({
        success: true,
        user,
        accessToken,
      });
  } catch (error) {
    console.error(error);
    res.status(401).json({
      success: false,
      error: "Email or password is incorrect",
    });
  }
});

{/*Logout*/}
userRouter.post("/logout", (req, res, next) => {
  console.log("Clearing cookie...");
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
  });
  res.json({
    success: true,
    message: "Logged out successfully",
  });
});

{/*Get User Profile*/}
userRouter.get("/me", authenticateUser, (req, res, next) => {
  res.json({
    success: true,
    user: req.user,
  });
});

{/*Update User Profile*/}
userRouter.put("/update", authenticateUser, async (req, res, next) => {
  const userId = req.user._id;
  const { fullname, age, profilePicture, oldPassword, newPassword } = req.body;

  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    if (fullname) {
      user.fullname = fullname;
    }
    if (age) {
      user.age = age;
    }
    if (profilePicture) {
      user.profilePicture = profilePicture;
    }

    if (oldPassword && newPassword) {
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Old password is incorrect",
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
    }

    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
});

{/*LoggedIn User Favorite NFT's*/}
userRouter.get("/favorites", authenticateUser, async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user._id).populate("favorites");
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      favorites: user.favorites,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch favorites",
    });
  }
});

{/*Send Pasword Reset Via Email*/}
userRouter.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;

    await user.save();

    const resetURL = `http://localhost:3000/reset-password/${resetToken}`;

    const emailContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center; background-color: #f4f4f4;">
      <div style="max-width: 500px; background: white; padding: 20px; margin: auto; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0,0,0,0.1);">
        <h2 style="color: #333;">Reset Your Password</h2>
          <p style="color: #555;">You requested a password reset. Click the "Reset Password" button below to set a new one.</p>
            <a href="${resetURL}" style="display: inline-block; padding: 12px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
          <p style="margin-top: 20px; color: #888;">If you did not request this, please ignore this email.</p>
        </div>
      </div>
    `;

    await sendEmail(user.email, "Password Reset", emailContent);

    res.json({
      success: true,
      message: "Password reset email sent",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error sending password reset email",
    });
  }
});

{/*Change Password Through Email*/}
userRouter.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await userModel.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    res.json({
      success: true,
      message: "Password reset successful.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to reset password",
    });
  }
});

{/*Contact Form for Bug Reports or Requests*/}
userRouter.post("/contact", authenticateUser, async (req, res) => {
  try {
    const { subject, message } = req.body;
    const user = req.user;

    if (!subject || !message) {
      return res
        .status(400)
        .json({ success: false, message: "Subject and message are required." });
    }

    const validSubjects = [
      "Bug Report",
      "Feature Recommendation",
      "General Inquiry",
      "Account Issue",
      "Become a Partner"
    ];
    if (!validSubjects.includes(subject)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subject.",
      });
    }

    const emailContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h3 style="color: #007bff;">New Contact Request</h3>
        <p><strong>From:</strong> ${user.fullname} (${user.email})</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p style="border-left: 4px solid #007bff; padding-left: 10px; color: #555;">${message}</p>
      </div>
    `;

    await sendEmail(
      process.env.GMAIL_USER,
      `NFTrade Contact Request: ${subject}`,
      emailContent
    );

    res.json({
      success: true,
      message: "Message sent successfully!",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to send message.",
    });
  }
});

{/*Get Daily Rewards*/}
userRouter.post("/daily-reward", authenticateUser, async (req, res, next) => {
  const reward_amount = 0.25;
  const reward_interval_hrs = 12;

  try {
    const user = await userModel.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const now = new Date();
    if (user.lastClaimedReward) {
      const diff = (now - user.lastClaimedReward) / (1000 * 60 * 60);
      if (diff < reward_interval_hrs) {
        return res.status(400).json({
          success: false,
          message: `You can claim your next reward in ${Math.ceil(
            reward_interval_hrs - diff
          )} hours.`,
        });
      }
    }

    user.balance += reward_amount;
    user.lastClaimedReward = now;
    await user.save();

    res.status(200).json({
      success: true,
      message: `You have claimed ${reward_amount} NFTokens.`,
      balance: user.balance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to claim daily reward",
    });
  }
});

{/*Get All Users*/}
userRouter.get(
  "",
  authenticateUser,
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

    const [_, accessToken] = authorization.split("Bearer ");
    console.log("accessToken", accessToken);

    req.accessToken = accessToken;

    try {
      const payload = validateAccessToken(accessToken);
      console.log("payload", payload);

      req.userId = payload.userId;
      req.email = payload.email;
      req.permissions = payload.permissions;

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).send({
        success: false,
        error: "Unauthorized",
      });
    }
  },
  async (req, res, next) => {
    try {
      const users = await getUsers();

      return res.send({
        success: true,
        data: users,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({
        success: false,
        error: "Failed to fetch users",
      });
    }
  }
);

{/*Check Duplicate Email on SignUp*/}
userRouter.get("/check-email", async (req, res, next) => {
  const { email } = req.query;
  try {
    const user = await userModel.findOne({ email });
    res.json({ exists: !!user });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to check duplicate email"
    })
  }
});

module.exports = userRouter;