const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  fullname: {
    type: String,
    required: true,
    max: 25
  },
  age: {
    type: Number,
    required: true,
    min: [18, "You must be at least 18 years old to register"],
  },
  email: {
    type: String,
    required: true,
    unique: [true, "Email already exists"],
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  profilePicture: { 
    type: String
  },
  balance: {
    type: Number,
    default: 5.00,
  },
  favorites: [{
    type: Schema.Types.ObjectId,
    ref: "NFT",
  }],
  lastClaimedReward: {
    type: Date,
    default: null
  },
  permissions: {},
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpires: {
    type: Date,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema, "Users");