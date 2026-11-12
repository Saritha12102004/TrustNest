
const mongoose = require("mongoose");

const agentSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },

        phone: {
            type: String,
            required: true,
            trim: true
        },

        city: {
            type: String,
            required: true,
            trim: true
        },

        agentId: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        branch: {
            type: String,
            required: true,
            trim: true
        },

        password: {
            type: String,
            required: true
        },

        role: {
            type: String,
            default: "agent"
        },

        status: {
            type: String,
            default: "Account Active"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Agent", agentSchema);