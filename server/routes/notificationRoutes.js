const express = require("express");
const router = express.Router();

const Notification = require("../models/Notification");


// ==========================================
// GET ALL NOTIFICATIONS FOR AGENT
// ==========================================

router.get("/", async (req, res) => {

    try {

        const { agentId } = req.query;

        if (!agentId) {
            return res.status(400).json({
                message: "agentId is required"
            });
        }

        const notifications =
            await Notification
                .find({ agentId })
                .sort({ createdAt: -1 });

        res.json({
            notifications
        });

    } catch (error) {

        console.error(
            "Get notifications error:",
            error
        );

        res.status(500).json({
            message: "Failed to fetch notifications"
        });

    }

});


// ==========================================
// MARK ONE NOTIFICATION AS READ
// ==========================================

router.put("/:id/read", async (req, res) => {

    try {

        const notification =
            await Notification.findByIdAndUpdate(
                req.params.id,
                {
                    isRead: true
                },
                {
                    new: true
                }
            );

        if (!notification) {

            return res.status(404).json({
                message: "Notification not found"
            });

        }

        res.json({
            message: "Notification marked as read",
            notification
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to update notification"
        });

    }

});


// ==========================================
// MARK ALL AS READ
// ==========================================

router.put("/mark-all-read", async (req, res) => {

    try {

        const { agentId } = req.body;

        if (!agentId) {

            return res.status(400).json({
                message: "agentId is required"
            });

        }

        await Notification.updateMany(
            {
                agentId: agentId,
                isRead: false
            },
            {
                $set: {
                    isRead: true
                }
            }
        );

        res.json({
            message:
                "All notifications marked as read"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message:
                "Failed to mark notifications as read"
        });

    }

});


// ==========================================
// DELETE NOTIFICATION
// ==========================================

router.delete("/:id", async (req, res) => {

    try {

        const notification =
            await Notification.findByIdAndDelete(
                req.params.id
            );

        if (!notification) {

            return res.status(404).json({
                message: "Notification not found"
            });

        }

        res.json({
            message: "Notification deleted"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message:
                "Failed to delete notification"
        });

    }

});


module.exports = router;