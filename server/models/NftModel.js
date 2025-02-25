const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NftSchema = new Schema({
    NFTName: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0.01
    },
    image: {
        type: String,
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    likedBy: {
        type: [Schema.Types.ObjectId],
        ref: "User"
    },
    listed: {
        type: Boolean,
        default: true
    },
    royalty: {
        type: Number,
        default: 5,
        min: 0,
        max: 20
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("NFT", NftSchema, "NFT's");