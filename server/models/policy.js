const mongoose = require("mongoose");

const policySchema = new mongoose.Schema(
    {
        agentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Agent",
            required: true
        },

        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
            required: true
        },

        policyNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        policyType: {
            type: String,
            required: true,
            trim: true
        },

        premiumAmount: {
            type: Number,
            required: true
        },

        premiumFrequency: {
            type: String,
            default: "Yearly"
        },

        sumAssured: {
            type: Number,
            required: true
        },

        startDate: {
            type: String,
            required: true
        },

        nextDueDate: {
            type: String,
            required: true
        },

        status: {
            type: String,
            enum: ["Active", "Due Soon", "Lapsed"],
            default: "Active"
        },

        notes: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Policy", policySchema);