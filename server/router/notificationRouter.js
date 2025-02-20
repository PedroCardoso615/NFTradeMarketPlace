const express = require("express");
const { authenticateUser } = require("../middlewares/authMiddleware");
const notificationModel = require("../models/NotificationModel");

const notificationRouter = express.Router();

{/*Get LoggedIn User Notifications*/}
notificationRouter.get("/", authenticateUser, async (req, res, next) => {
    try {
        const notifications = await notificationModel
        .find({ user: req.user._id })
        .sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            data: notifications,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch notifications",
        });
    }
});

{/*Mark All Notifications as Read*/}
notificationRouter.put("/read", authenticateUser, async (req, res, next) => {
    try {
        await notificationModel.updateMany(
            { user: req.user._id },
            { isRead: true }
        );

        res.json({
            success: true,
            message: "All notifications marked as read",
        });
    } catch(error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Failed to mark notifications as read",
        });
    }
});

{/*Mark Notification as Read*/}
notificationRouter.put("/read/:id", authenticateUser, async (req, res, next) => {
    try {
        const notification = await notificationModel.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { isRead: true },
            { new: true }
        )

        if(!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found",
            });
        }

        res.json({
            success: true,
            message: "Notification marked as read",
            data: notification,
        });
    } catch(error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Failed to mark notification as read",
        });
    }
});

module.exports = notificationRouter;