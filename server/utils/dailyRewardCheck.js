const userModel = require("../models/UserModel");
const notificationModel = require("../models/NotificationModel");

const checkDailyRewards = async () => {
  try {
    const now = new Date();

    const eligibleUsers = await userModel.find({
      $or: [
        { lastDailyReward: { $exists: false } },
        { lastDailyReward: { $lt: new Date(now - 12 * 60 * 60 * 1000) } },
      ],
    });

    for (const user of eligibleUsers) {
      const checkNotification = await notificationModel.findOne({
        user: user._id,
        message: "Your daily reward is ready to be claimed!",
      });

      if (!checkNotification) {
        await notificationModel.create({
          user: user._id,
          message: "Your daily reward is ready to be claimed!",
        });
      }
    }
  } catch (error) {
    console.error(error);
  }
};

setInterval(checkDailyRewards, 60 * 60 * 1000);

module.exports = checkDailyRewards;