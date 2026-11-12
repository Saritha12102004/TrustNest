const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        agentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Agent",
            required: true
        },

        title: {
            type: String,
            required: true,
            trim: true
        },

        message: {
            type: String,
            required: true,
            trim: true
        },

        type: {
            type: String,
            enum: [
                "reminder",
                "system",
                "lead",
                "policy",
                "ai"
            ],
            default: "system"
        },

        priority: {
            type: String,
            enum: [
                "low",
                "medium",
                "high"
            ],
            default: "medium"
        },

        relatedCustomerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
            default: null
        },

        relatedPolicyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Policy",
            default: null
        },

        isRead: {
            type: Boolean,
            default: false
        },

        createdAt: {
            type: Date,
            default: Date.now
        }
    }
);

module.exports = mongoose.model(
    "Notification",
    notificationSchema
);