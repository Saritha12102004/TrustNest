// =========================================
// DNS FIX FOR MONGODB ATLAS
// =========================================

const dns = require("dns");

dns.setServers([
    "8.8.8.8",
    "8.8.4.4"
]);


// =========================================
// IMPORT PACKAGES
// =========================================

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// =========================================
// IMPORT CONFIGURATION & MODELS
// =========================================

const connectDB = require("./config/db");

const Agent = require("./models/Agent");

const Policy = require("./models/policy");


// =========================================
// LOAD ENVIRONMENT VARIABLES
// =========================================

dotenv.config();


// =========================================
// CREATE EXPRESS APP
// =========================================

const app = express();


// =========================================
// MIDDLEWARE
// =========================================

app.use(cors());

app.use(express.json());


// =========================================
// CONNECT TO MONGODB
// =========================================

connectDB();


// =========================================
// JWT SECRET
// =========================================

const JWT_SECRET =
    process.env.JWT_SECRET ||
    "trustnest_customer_secret_2026";


// =========================================
// CUSTOMER MODEL
// =========================================

const customerSchema = new mongoose.Schema(
    {
        // =====================================
        // AGENT RELATION
        // =====================================

        agentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Agent",
            required: true
        },


        // =====================================
        // PERSONAL INFORMATION
        // =====================================

        fullName: {
            type: String,
            required: true,
            trim: true
        },

        dateOfBirth: {
            type: String
        },

        gender: {
            type: String
        },

        maritalStatus: {
            type: String
        },

        occupation: {
            type: String
        },

        income: {
            type: String
        },

        familySize: {
            type: String
        },

        dependents: {
            type: String
        },

        insuranceNeed: {
            type: String
        },


        // =====================================
        // CONTACT INFORMATION
        // =====================================

        email: {
            type: String,
            trim: true,
            lowercase: true
        },

        phone: {
            type: String,
            trim: true
        },

        address: {
            type: String
        },

        city: {
            type: String,
            trim: true
        },

        state: {
            type: String
        },

        pincode: {
            type: String
        },

        preferredContact: {
            type: String
        },


        // =====================================
        // BRANCH INFORMATION
        // =====================================

        branch: {
            type: String,
            trim: true
        },


        // =====================================
        // ADDITIONAL INFORMATION
        // =====================================

        financialGoal: {
            type: String
        },

        leadSource: {
            type: String
        },

        notes: {
            type: String
        },

        status: {
            type: String,
            default: "Active"
        },


        // =====================================
        // CUSTOMER LOGIN
        // =====================================

        customerLoginId: {
            type: String,
            trim: true,
            lowercase: true,
            unique: true,
            sparse: true
        },

        passwordHash: {
            type: String,
            default: null
        },

        customerLoginEnabled: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);


const Customer =
    mongoose.models.Customer ||
    mongoose.model(
        "Customer",
        customerSchema
    );


// =========================================
// FOLLOW-UP MODEL
// =========================================

const followupSchema = new mongoose.Schema(
    {
        agentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Agent",
            required: true
        },

        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer"
        },

        title: {
            type: String,
            trim: true
        },

        dueDate: {
            type: Date
        },

        status: {
            type: String,
            default: "Pending"
        }
    },
    {
        timestamps: true
    }
);


const Followup =
    mongoose.models.Followup ||
    mongoose.model(
        "Followup",
        followupSchema
    );


// =========================================
// LEAD MODEL
// =========================================

const leadSchema = new mongoose.Schema(
    {
        agentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Agent",
            required: true
        },

        customerName: {
            type: String,
            trim: true
        },

        phone: {
            type: String,
            trim: true
        },

        priority: {
            type: String,
            default: "Normal"
        },

        status: {
            type: String,
            default: "New"
        }
    },
    {
        timestamps: true
    }
);


const Lead =
    mongoose.models.Lead ||
    mongoose.model(
        "Lead",
        leadSchema
    );


// =========================================
// NOTIFICATION MODEL
// =========================================

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

        relatedFollowupId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Followup",
            default: null
        },

        notificationKey: {
            type: String,
            default: null
        },

        isRead: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);


const Notification =
    mongoose.models.Notification ||
    mongoose.model(
        "Notification",
        notificationSchema
    );


// =========================================
// HELPER FUNCTION
// CREATE NOTIFICATION
// =========================================

async function createNotification(data) {

    try {

        if (!data.agentId) {
            return null;
        }


        if (data.notificationKey) {

            const existing =
                await Notification.findOne({
                    agentId:
                        data.agentId,

                    notificationKey:
                        data.notificationKey
                });


            if (existing) {
                return existing;
            }
        }


        const notification =
            new Notification({

                agentId:
                    data.agentId,

                title:
                    data.title,

                message:
                    data.message,

                type:
                    data.type || "system",

                priority:
                    data.priority || "medium",

                relatedCustomerId:
                    data.relatedCustomerId || null,

                relatedPolicyId:
                    data.relatedPolicyId || null,

                relatedFollowupId:
                    data.relatedFollowupId || null,

                notificationKey:
                    data.notificationKey || null,

                isRead:
                    false
            });


        return await notification.save();

    }

    catch (error) {

        console.error(
            "Create notification error:",
            error
        );

        return null;
    }
}


// =========================================
// SYNC AUTOMATIC NOTIFICATIONS
// =========================================

async function syncAutomaticNotifications(agentId) {

    try {

        const today = new Date();

        today.setHours(
            0,
            0,
            0,
            0
        );


        const tomorrow =
            new Date(today);

        tomorrow.setDate(
            tomorrow.getDate() + 1
        );


        // =====================================
        // FOLLOW-UPS DUE TODAY
        // =====================================

        const todayFollowups =
            await Followup.find({

                agentId: agentId,

                status: {
                    $in: [
                        "Pending",
                        "pending"
                    ]
                },

                dueDate: {
                    $gte: today,
                    $lt: tomorrow
                }

            }).populate(
                "customerId",
                "fullName"
            );


        for (
            const followup
            of todayFollowups
        ) {

            const customerName =
                followup.customerId
                    ? followup.customerId.fullName
                    : "customer";


            await createNotification({

                agentId:
                    agentId,

                title:
                    "Follow-up due today",

                message:
                    `${followup.title || "Customer follow-up"} for ${customerName} is due today.`,

                type:
                    "reminder",

                priority:
                    "high",

                relatedCustomerId:
                    followup.customerId
                        ? followup.customerId._id
                        : null,

                relatedFollowupId:
                    followup._id,

                notificationKey:
                    `followup-today-${followup._id}-${today.toISOString().split("T")[0]}`
            });

        }


        // =====================================
        // FOLLOW-UPS DUE TOMORROW
        // =====================================

        const dayAfterTomorrow =
            new Date(tomorrow);

        dayAfterTomorrow.setDate(
            dayAfterTomorrow.getDate() + 1
        );


        const tomorrowFollowups =
            await Followup.find({

                agentId: agentId,

                status: {
                    $in: [
                        "Pending",
                        "pending"
                    ]
                },

                dueDate: {
                    $gte: tomorrow,
                    $lt: dayAfterTomorrow
                }

            }).populate(
                "customerId",
                "fullName"
            );


        for (
            const followup
            of tomorrowFollowups
        ) {

            const customerName =
                followup.customerId
                    ? followup.customerId.fullName
                    : "customer";


            await createNotification({

                agentId:
                    agentId,

                title:
                    "Upcoming follow-up",

                message:
                    `${followup.title || "Customer follow-up"} for ${customerName} is scheduled for tomorrow.`,

                type:
                    "reminder",

                priority:
                    "medium",

                relatedCustomerId:
                    followup.customerId
                        ? followup.customerId._id
                        : null,

                relatedFollowupId:
                    followup._id,

                notificationKey:
                    `followup-tomorrow-${followup._id}-${tomorrow.toISOString().split("T")[0]}`
            });

        }


        // =====================================
        // POLICIES DUE WITHIN 7 DAYS
        // =====================================

        const sevenDaysLater =
            new Date(today);

        sevenDaysLater.setDate(
            sevenDaysLater.getDate() + 7
        );


        const upcomingPolicies =
            await Policy.find({

                agentId: agentId,

                status: {
                    $in: [
                        "Active",
                        "active"
                    ]
                },

                nextDueDate: {
                    $gte: today,
                    $lte: sevenDaysLater
                }

            }).populate(
                "customerId",
                "fullName"
            );


        for (
            const policy
            of upcomingPolicies
        ) {

            const customerName =
                policy.customerId
                    ? policy.customerId.fullName
                    : "customer";


            const dueDate =
                new Date(
                    policy.nextDueDate
                );


            const difference =
                Math.ceil(
                    (
                        dueDate.getTime() -
                        today.getTime()
                    ) /
                    (
                        1000 *
                        60 *
                        60 *
                        24
                    )
                );


            let message;


            if (difference <= 0) {

                message =
                    `Premium payment for ${customerName}'s policy ${policy.policyNumber} is due today.`;

            }

            else if (difference === 1) {

                message =
                    `Premium payment for ${customerName}'s policy ${policy.policyNumber} is due tomorrow.`;

            }

            else {

                message =
                    `Premium payment for ${customerName}'s policy ${policy.policyNumber} is due in ${difference} days.`;

            }


            await createNotification({

                agentId:
                    agentId,

                title:
                    "Premium payment reminder",

                message:
                    message,

                type:
                    "policy",

                priority:
                    difference <= 2
                        ? "high"
                        : "medium",

                relatedCustomerId:
                    policy.customerId
                        ? policy.customerId._id
                        : null,

                relatedPolicyId:
                    policy._id,

                notificationKey:
                    `policy-due-${policy._id}-${dueDate.toISOString().split("T")[0]}`
            });

        }


        // =====================================
        // HIGH PRIORITY LEADS
        // =====================================

        const highPriorityLeads =
            await Lead.find({

                agentId: agentId,

                priority: {
                    $in: [
                        "High",
                        "high"
                    ]
                },

                status: {
                    $in: [
                        "New",
                        "new",
                        "Contacted",
                        "contacted"
                    ]
                }

            }).limit(20);


        for (
            const lead
            of highPriorityLeads
        ) {

            await createNotification({

                agentId:
                    agentId,

                title:
                    "High-priority lead",

                message:
                    `${lead.customerName || "A lead"} is marked as a high-priority lead and may need your attention.`,

                type:
                    "lead",

                priority:
                    "high",

                notificationKey:
                    `high-lead-${lead._id}`
            });

        }


        return true;

    }

    catch (error) {

        console.error(
            "Automatic notification sync error:",
            error
        );

        return false;
    }
}


// =========================================
// CUSTOMER AUTHENTICATION MIDDLEWARE
// =========================================

function customerAuth(req, res, next) {

    try {

        const authHeader =
            req.headers.authorization;


        if (
            !authHeader ||
            !authHeader.startsWith("Bearer ")
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Customer authentication required."

            });

        }


        const token =
            authHeader.split(" ")[1];


        if (!token) {

            return res.status(401).json({

                success: false,

                message:
                    "Customer token missing."

            });

        }


        const decoded =
            jwt.verify(
                token,
                JWT_SECRET
            );


        if (
            decoded.role !== "customer" ||
            !decoded.customerId
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "Customer access only."

            });

        }


        req.customerId =
            decoded.customerId;


        next();

    }

    catch (error) {

        console.error(
            "Customer authentication error:",
            error.message
        );


        return res.status(401).json({

            success: false,

            message:
                "Invalid or expired customer login session."

        });

    }
}


// =========================================
// TEST ROUTE
// =========================================

app.get(
    "/",
    (req, res) => {

        res.send(
            "TrustNest Backend Running"
        );

    }
);


// =========================================
// AGENT REGISTRATION
// =========================================

app.post(
    "/api/agents/register",
    async (req, res) => {

        try {

            const {
                fullName,
                email,
                phone,
                city,
                agentId,
                branch,
                password
            } = req.body;


            if (
                !fullName ||
                !email ||
                !phone ||
                !city ||
                !agentId ||
                !branch ||
                !password
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Please provide all required fields."

                });

            }


            const existingEmail =
                await Agent.findOne({

                    email:
                        email.toLowerCase()

                });


            if (existingEmail) {

                return res.status(400).json({

                    success: false,

                    message:
                        "An account with this email already exists."

                });

            }


            const existingAgent =
                await Agent.findOne({

                    agentId:
                        agentId

                });


            if (existingAgent) {

                return res.status(400).json({

                    success: false,

                    message:
                        "This Agent ID is already registered."

                });

            }


            const newAgent =
                new Agent({

                    fullName:
                        fullName,

                    email:
                        email.toLowerCase(),

                    phone:
                        phone,

                    city:
                        city,

                    agentId:
                        agentId,

                    branch:
                        branch,

                    password:
                        password,

                    role:
                        "agent",

                    status:
                        "Account Active"

                });


            const savedAgent =
                await newAgent.save();


            res.status(201).json({

                success: true,

                message:
                    "Agent account created successfully.",

                agent: {

                    id:
                        savedAgent._id,

                    fullName:
                        savedAgent.fullName,

                    email:
                        savedAgent.email,

                    phone:
                        savedAgent.phone,

                    city:
                        savedAgent.city,

                    agentId:
                        savedAgent.agentId,

                    branch:
                        savedAgent.branch,

                    role:
                        savedAgent.role,

                    status:
                        savedAgent.status

                }

            });

        }

        catch (error) {

            console.error(
                "Agent registration error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Server error while creating agent account."

            });

        }

    }
);


// =========================================
// AGENT LOGIN
// =========================================

app.post(
    "/api/agents/login",
    async (req, res) => {

        try {

            const {
                email,
                password,
                role
            } = req.body;


            if (
                !email ||
                !password ||
                !role
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Please provide email, password and role."

                });

            }


            if (
                role !== "agent"
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Customer login should use the customer login endpoint."

                });

            }


            const agent =
                await Agent.findOne({

                    email:
                        email.toLowerCase()

                });


            if (!agent) {

                return res.status(401).json({

                    success: false,

                    message:
                        "No account found with this email."

                });

            }


            if (
                agent.password !== password
            ) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Incorrect password."

                });

            }


            res.status(200).json({

                success: true,

                message:
                    "Login successful.",

                agent: {

                    id:
                        agent._id,

                    fullName:
                        agent.fullName,

                    email:
                        agent.email,

                    phone:
                        agent.phone,

                    city:
                        agent.city,

                    agentId:
                        agent.agentId,

                    branch:
                        agent.branch,

                    role:
                        agent.role,

                    status:
                        agent.status

                }

            });

        }

        catch (error) {

            console.error(
                "Agent login error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Server error during login."

            });

        }

    }
);


// =========================================
// ADD CUSTOMER
// =========================================

app.post(
    "/api/customers",
    async (req, res) => {

        try {

            const {
                agentId,
                fullName,
                dob,
                gender,
                maritalStatus,
                occupation,
                income,
                familySize,
                dependents,
                insuranceNeed,
                mobile,
                email,
                address,
                city,
                state,
                pincode,
                preferredContact,
                branch,
                financialGoal,
                leadSource,
                notes,
                customerLoginId,
                password,
                customerPassword
            } = req.body;


            // =================================
            // CUSTOMER PASSWORD
            // =================================

            const loginPassword =
                customerPassword ||
                password;


            // =================================
            // BASIC VALIDATION
            // =================================

            if (
                !agentId ||
                !fullName
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Agent ID and customer name are required."

                });

            }


            if (!loginPassword) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Customer login password is required."

                });

            }


            if (!customerLoginId) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Customer Login ID is required."

                });

            }


            const agent =
                await Agent.findById(
                    agentId
                );


            if (!agent) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Agent not found."

                });

            }


            // =================================
            // NORMALIZE LOGIN ID
            // =================================

            const normalizedLoginId =
                customerLoginId
                    .trim()
                    .toLowerCase();


            // =================================
            // CHECK CUSTOMER EMAIL
            // =================================

            if (email) {

                const existingCustomer =
                    await Customer.findOne({

                        email:
                            email.toLowerCase()

                    });


                if (existingCustomer) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "A customer with this email already exists."

                    });

                }

            }


            // =================================
            // CHECK CUSTOMER LOGIN ID
            // =================================

            const existingLoginId =
                await Customer.findOne({

                    customerLoginId:
                        normalizedLoginId

                });


            if (existingLoginId) {

                return res.status(400).json({

                    success: false,

                    message:
                        "This Customer Login ID is already in use."

                });

            }


            // =================================
            // HASH CUSTOMER PASSWORD
            // =================================

            const passwordHash =
                await bcrypt.hash(
                    loginPassword,
                    10
                );


            // =================================
            // BRANCH
            // =================================

            const customerBranch =
                branch ||
                agent.branch ||
                "";


            // =================================
            // CREATE CUSTOMER
            // =================================

            const newCustomer =
                new Customer({

                    agentId:
                        agentId,

                    fullName:
                        fullName,

                    dateOfBirth:
                        dob,

                    gender:
                        gender,

                    maritalStatus:
                        maritalStatus,

                    occupation:
                        occupation,

                    income:
                        income,

                    familySize:
                        familySize,

                    dependents:
                        dependents,

                    insuranceNeed:
                        insuranceNeed,

                    phone:
                        mobile,

                    email:
                        email
                            ? email.toLowerCase()
                            : undefined,

                    address:
                        address,

                    city:
                        city,

                    state:
                        state,

                    pincode:
                        pincode,

                    preferredContact:
                        preferredContact,

                    branch:
                        customerBranch,

                    financialGoal:
                        financialGoal,

                    leadSource:
                        leadSource,

                    notes:
                        notes,

                    status:
                        "Active",

                    customerLoginId:
                        normalizedLoginId,

                    passwordHash:
                        passwordHash,

                    customerLoginEnabled:
                        true

                });


            const savedCustomer =
                await newCustomer.save();


            // =================================
            // CREATE NOTIFICATION
            // =================================

            await createNotification({

                agentId:
                    agentId,

                title:
                    "New customer added",

                message:
                    `${savedCustomer.fullName} has been added to your customer list.`,

                type:
                    "system",

                priority:
                    "medium",

                relatedCustomerId:
                    savedCustomer._id,

                notificationKey:
                    `new-customer-${savedCustomer._id}`

            });


            // =================================
            // RESPONSE
            // =================================

            res.status(201).json({

                success: true,

                message:
                    "Customer added successfully.",

                customer: {

                    _id:
                        savedCustomer._id,

                    fullName:
                        savedCustomer.fullName,

                    customerLoginId:
                        savedCustomer.customerLoginId,

                    email:
                        savedCustomer.email,

                    phone:
                        savedCustomer.phone,

                    city:
                        savedCustomer.city,

                    branch:
                        savedCustomer.branch,

                    status:
                        savedCustomer.status,

                    customerLoginEnabled:
                        savedCustomer.customerLoginEnabled

                }

            });

        }

        catch (error) {

            console.error(
                "Add customer error:",
                error
            );


            if (error.code === 11000) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Customer Login ID already exists. Please choose another one."

                });

            }


            res.status(500).json({

                success: false,

                message:
                    "Server error while adding customer."

            });

        }

    }
);


// =========================================
// CUSTOMER LOGIN
// LOGIN USING CUSTOMER LOGIN ID OR EMAIL
// =========================================

app.post(
    "/api/customers/login",
    async (req, res) => {

        try {

            const {
                loginId,
                customerLoginId,
                email,
                password
            } = req.body;


            const loginValue =
                loginId ||
                customerLoginId ||
                email;


            // =================================
            // VALIDATION
            // =================================

            if (
                !loginValue ||
                !password
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Please enter Customer Login ID/email and password."

                });

            }


            // =================================
            // NORMALIZE LOGIN
            // =================================

            const normalizedLogin =
                loginValue
                    .trim()
                    .toLowerCase();


            // =================================
            // FIND CUSTOMER
            // =================================

            const customer =
                await Customer.findOne({

                    $or: [

                        {
                            customerLoginId:
                                normalizedLogin
                        },

                        {
                            email:
                                normalizedLogin
                        }

                    ]

                });


            if (!customer) {

                return res.status(401).json({

                    success: false,

                    message:
                        "No customer account found with this Login ID or email."

                });

            }


            // =================================
            // CHECK LOGIN STATUS
            // =================================

            if (
                !customer.customerLoginEnabled ||
                !customer.passwordHash
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "Customer login has not been enabled for this account."

                });

            }


            // =================================
            // CHECK PASSWORD
            // =================================

            const passwordMatch =
                await bcrypt.compare(
                    password,
                    customer.passwordHash
                );


            if (!passwordMatch) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Incorrect password."

                });

            }


            // =================================
            // CREATE JWT
            // =================================

            const token =
                jwt.sign(

                    {
                        customerId:
                            customer._id.toString(),

                        role:
                            "customer"

                    },

                    JWT_SECRET,

                    {
                        expiresIn:
                            "2h"
                    }

                );


            // =================================
            // GET AGENT
            // =================================

            const agent =
                await Agent.findById(
                    customer.agentId
                )
                .select(
                    "fullName agentId branch city status"
                );


            // =================================
            // LOGIN RESPONSE
            // =================================

            res.status(200).json({

                success: true,

                message:
                    "Customer login successful.",

                token:
                    token,

                customer: {

                    id:
                        customer._id,

                    fullName:
                        customer.fullName,

                    customerLoginId:
                        customer.customerLoginId,

                    email:
                        customer.email,

                    phone:
                        customer.phone,

                    city:
                        customer.city,

                    state:
                        customer.state,

                    branch:
                        customer.branch,

                    status:
                        customer.status

                },

                agent:
                    agent
                        ? {

                            fullName:
                                agent.fullName,

                            agentId:
                                agent.agentId,

                            branch:
                                agent.branch,

                            city:
                                agent.city,

                            status:
                                agent.status

                        }
                        : null

            });

        }

        catch (error) {

            console.error(
                "Customer login error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Server error during customer login."

            });

        }

    }
);


// =========================================
// CUSTOMER PORTAL
// GET LOGGED-IN CUSTOMER INFORMATION
// =========================================

app.get(
    "/api/customer-portal/me",
    customerAuth,
    async (req, res) => {

        try {

            const customer =
                await Customer.findById(
                    req.customerId
                )
                .select(
                    "-passwordHash"
                );


            if (!customer) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Customer account not found."

                });

            }


            // =================================
            // GET CUSTOMER POLICIES
            // =================================

            const policies =
                await Policy.find({

                    customerId:
                        customer._id

                })
                .sort({

                    createdAt:
                        -1

                });


            // =================================
            // GET AGENT
            // =================================

            const agent =
                await Agent.findById(
                    customer.agentId
                )
                .select(
                    "fullName email phone city agentId branch status"
                );


            // =================================
            // CUSTOMER PORTAL RESPONSE
            // =================================

            res.status(200).json({

                success: true,

                customer: {

                    id:
                        customer._id,

                    fullName:
                        customer.fullName,

                    customerLoginId:
                        customer.customerLoginId,

                    dateOfBirth:
                        customer.dateOfBirth,

                    gender:
                        customer.gender,

                    maritalStatus:
                        customer.maritalStatus,

                    occupation:
                        customer.occupation,

                    income:
                        customer.income,

                    familySize:
                        customer.familySize,

                    dependents:
                        customer.dependents,

                    insuranceNeed:
                        customer.insuranceNeed,

                    email:
                        customer.email,

                    phone:
                        customer.phone,

                    address:
                        customer.address,

                    city:
                        customer.city,

                    state:
                        customer.state,

                    pincode:
                        customer.pincode,

                    preferredContact:
                        customer.preferredContact,

                    branch:
                        customer.branch,

                    financialGoal:
                        customer.financialGoal,

                    leadSource:
                        customer.leadSource,

                    status:
                        customer.status,

                    createdAt:
                        customer.createdAt

                },

                policies:
                    policies,

                agent:
                    agent
                        ? {

                            fullName:
                                agent.fullName,

                            email:
                                agent.email,

                            phone:
                                agent.phone,

                            city:
                                agent.city,

                            agentId:
                                agent.agentId,

                            branch:
                                agent.branch,

                            status:
                                agent.status

                        }
                        : null

            });

        }

        catch (error) {

            console.error(
                "Customer portal error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Server error while loading customer portal."

            });

        }

    }
);


// =========================================
// CUSTOMER PORTAL
// GET POLICIES OF LOGGED-IN CUSTOMER ONLY
// =========================================

app.get(
    "/api/customer-portal/policies",
    customerAuth,
    async (req, res) => {

        try {

            // =====================================
            // IMPORTANT:
            // CUSTOMER ID COMES FROM JWT
            // NOT FROM FRONTEND
            // =====================================

            const policies =
                await Policy.find({

                    customerId:
                        req.customerId

                })
                .sort({

                    createdAt:
                        -1

                });


            // =====================================
            // RESPONSE
            // =====================================

            res.status(200).json({

                success: true,

                count:
                    policies.length,

                policies:
                    policies

            });

        }

        catch (error) {

            console.error(
                "Customer policies error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Server error while loading customer policies."

            });

        }

    }
);


// =========================================
// GET SINGLE CUSTOMER
// AGENT ONLY
// =========================================

app.get(
    "/api/customers/:id",
    async (req, res) => {

        try {

            const customerId =
                req.params.id;

            const agentId =
                req.query.agentId;


            if (!agentId) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Agent ID is required."

                });

            }


            const customer =
                await Customer.findOne({

                    _id:
                        customerId,

                    agentId:
                        agentId

                })
                .select(
                    "-passwordHash"
                );


            if (!customer) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Customer not found."

                });

            }


            res.status(200).json({

                success: true,

                customer:
                    customer

            });

        }

        catch (error) {

            console.error(
                "Get customer by ID error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Server error while loading customer."

            });

        }

    }
);


// =========================================
// GET CUSTOMERS
// =========================================

app.get(
    "/api/customers",
    async (req, res) => {

        try {

            const {
                agentId
            } = req.query;


            if (!agentId) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Agent ID is required."

                });

            }


            const agent =
                await Agent.findById(
                    agentId
                );


            if (!agent) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Agent not found."

                });

            }


            const customers =
                await Customer.find({

                    agentId:
                        agent._id

                })
                .select(
                    "-passwordHash"
                )
                .sort({

                    createdAt:
                        -1

                });


            res.status(200).json({

                success: true,

                count:
                    customers.length,

                customers:
                    customers

            });

        }

        catch (error) {

            console.error(
                "Get customers error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Server error while loading customers."

            });

        }

    }
);


// =========================================
// UPDATE CUSTOMER
// AGENT ONLY
// =========================================

app.put(
    "/api/customers/:id",
    async (req, res) => {

        try {

            const customerId =
                req.params.id;


            const {
                agentId,
                fullName,
                dob,
                gender,
                maritalStatus,
                occupation,
                income,
                familySize,
                dependents,
                insuranceNeed,
                mobile,
                email,
                address,
                city,
                state,
                pincode,
                preferredContact,
                branch,
                financialGoal,
                leadSource,
                notes,
                customerLoginId,
                customerPassword
            } = req.body;


            // =================================
            // VALIDATION
            // =================================

            if (
                !agentId ||
                !fullName
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Agent ID and customer name are required."

                });

            }


            const agent =
                await Agent.findById(
                    agentId
                );


            if (!agent) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Agent not found."

                });

            }


            const customer =
                await Customer.findOne({

                    _id:
                        customerId,

                    agentId:
                        agentId

                });


            if (!customer) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Customer not found for this agent."

                });

            }


            // =================================
            // UPDATE CUSTOMER LOGIN ID
            // =================================

            if (
                customerLoginId &&
                customerLoginId.trim().toLowerCase() !==
                    (customer.customerLoginId || "").toLowerCase()
            ) {

                const normalizedLoginId =
                    customerLoginId
                        .trim()
                        .toLowerCase();


                const existingLoginId =
                    await Customer.findOne({

                        customerLoginId:
                            normalizedLoginId,

                        _id:
                            {
                                $ne:
                                    customerId
                            }

                    });


                if (existingLoginId) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "This Customer Login ID is already in use."

                    });

                }


                customer.customerLoginId =
                    normalizedLoginId;

            }


            // =================================
            // UPDATE CUSTOMER INFORMATION
            // =================================

            customer.fullName =
                fullName;

            customer.dateOfBirth =
                dob;

            customer.gender =
                gender;

            customer.maritalStatus =
                maritalStatus;

            customer.occupation =
                occupation;

            customer.income =
                income;

            customer.familySize =
                familySize;

            customer.dependents =
                dependents;

            customer.insuranceNeed =
                insuranceNeed;

            customer.phone =
                mobile;

            customer.email =
                email
                    ? email.toLowerCase()
                    : undefined;

            customer.address =
                address;

            customer.city =
                city;

            customer.state =
                state;

            customer.pincode =
                pincode;

            customer.preferredContact =
                preferredContact;


            // =================================
            // UPDATE BRANCH
            // =================================

            customer.branch =
                branch ||
                agent.branch ||
                customer.branch ||
                "";


            customer.financialGoal =
                financialGoal;

            customer.leadSource =
                leadSource;

            customer.notes =
                notes;


            // =================================
            // OPTIONAL PASSWORD UPDATE
            // =================================

            if (customerPassword) {

                customer.passwordHash =
                    await bcrypt.hash(
                        customerPassword,
                        10
                    );

                customer.customerLoginEnabled =
                    true;

            }


            const updatedCustomer =
                await customer.save();


            // =================================
            // RESPONSE WITHOUT PASSWORD
            // =================================

            const customerResponse =
                updatedCustomer.toObject();


            delete customerResponse.passwordHash;


            res.status(200).json({

                success: true,

                message:
                    "Customer updated successfully.",

                customer:
                    customerResponse

            });

        }

        catch (error) {

            console.error(
                "Update customer error:",
                error
            );


            if (error.code === 11000) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Customer Login ID already exists."

                });

            }


            res.status(500).json({

                success: false,

                message:
                    "Server error while updating customer."

            });

        }

    }
);


// =========================================
// ADD POLICY
// =========================================

app.post(
    "/api/policies",
    async (req, res) => {

        try {

            const {
                agentId,
                customerId,
                policyNumber,
                policyType,
                premiumAmount,
                premiumFrequency,
                sumAssured,
                startDate,
                nextDueDate,
                status,
                notes
            } = req.body;


            if (
                !agentId ||
                !customerId ||
                !policyNumber ||
                !policyType ||
                premiumAmount === undefined ||
                premiumAmount === null ||
                (
                    !sumAssured &&
                    sumAssured !== 0
                ) ||
                !startDate ||
                !nextDueDate
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Please provide all required policy fields."

                });

            }


            if (
                Number(premiumAmount) <= 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Premium amount must be greater than 0."

                });

            }


            if (
                Number(sumAssured) <= 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Sum assured must be greater than 0."

                });

            }


            const agent =
                await Agent.findById(
                    agentId
                );


            if (!agent) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Agent not found."

                });

            }


            const customer =
                await Customer.findOne({

                    _id:
                        customerId,

                    agentId:
                        agentId

                });


            if (!customer) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Customer not found for this agent."

                });

            }


            const existingPolicy =
                await Policy.findOne({

                    policyNumber:
                        policyNumber

                });


            if (existingPolicy) {

                return res.status(400).json({

                    success: false,

                    message:
                        "This policy number already exists."

                });

            }


            const newPolicy =
                new Policy({

                    agentId:
                        agentId,

                    customerId:
                        customerId,

                    policyNumber:
                        policyNumber,

                    policyType:
                        policyType,

                    premiumAmount:
                        Number(
                            premiumAmount
                        ),

                    premiumFrequency:
                        premiumFrequency ||
                        "Yearly",

                    sumAssured:
                        Number(
                            sumAssured
                        ),

                    startDate:
                        startDate,

                    nextDueDate:
                        nextDueDate,

                    status:
                        status ||
                        "Active",

                    notes:
                        notes ||
                        ""

                });


            const savedPolicy =
                await newPolicy.save();


            await createNotification({

                agentId:
                    agentId,

                title:
                    "New policy added",

                message:
                    `Policy ${savedPolicy.policyNumber} for ${customer.fullName} has been added successfully.`,

                type:
                    "policy",

                priority:
                    "medium",

                relatedCustomerId:
                    customer._id,

                relatedPolicyId:
                    savedPolicy._id,

                notificationKey:
                    `new-policy-${savedPolicy._id}`

            });


            res.status(201).json({

                success: true,

                message:
                    "Policy added successfully.",

                policy:
                    savedPolicy

            });

        }

        catch (error) {

            console.error(
                "Add policy error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Server error while adding policy."

            });

        }

    }
);


// =========================================
// GET POLICIES
// AGENT
// =========================================

app.get(
    "/api/policies",
    async (req, res) => {

        try {

            const {
                agentId
            } = req.query;


            if (!agentId) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Agent ID is required."

                });

            }


            const agent =
                await Agent.findById(
                    agentId
                );


            if (!agent) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Agent not found."

                });

            }


            const policies =
                await Policy.find({

                    agentId:
                        agent._id

                })
                .populate(
                    "customerId",
                    "fullName phone email city branch"
                )
                .sort({

                    createdAt:
                        -1

                });


            res.status(200).json({

                success: true,

                count:
                    policies.length,

                policies:
                    policies

            });

        }

        catch (error) {

            console.error(
                "Get policies error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Server error while loading policies."

            });

        }

    }
);


// =========================================
// GET NOTIFICATIONS
// =========================================

app.get(
    "/api/notifications",
    async (req, res) => {

        try {

            const {
                agentId
            } = req.query;


            if (!agentId) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Agent ID is required."

                });

            }


            const agent =
                await Agent.findById(
                    agentId
                );


            if (!agent) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Agent not found."

                });

            }


            await syncAutomaticNotifications(
                agent._id
            );


            const notifications =
                await Notification.find({

                    agentId:
                        agent._id

                })
                .populate(
                    "relatedCustomerId",
                    "fullName phone"
                )
                .populate(
                    "relatedPolicyId",
                    "policyNumber policyType"
                )
                .populate(
                    "relatedFollowupId",
                    "title dueDate status"
                )
                .sort({

                    createdAt:
                        -1

                })
                .limit(100);


            const unreadCount =
                notifications.filter(
                    notification =>
                        !notification.isRead
                ).length;


            const reminderCount =
                notifications.filter(
                    notification =>
                        notification.type ===
                        "reminder"
                ).length;


            const systemCount =
                notifications.filter(
                    notification =>
                        notification.type ===
                        "system"
                ).length;


            const leadCount =
                notifications.filter(
                    notification =>
                        notification.type ===
                        "lead"
                ).length;


            const policyCount =
                notifications.filter(
                    notification =>
                        notification.type ===
                        "policy"
                ).length;


            const aiCount =
                notifications.filter(
                    notification =>
                        notification.type ===
                        "ai"
                ).length;


            res.status(200).json({

                success: true,

                count:
                    notifications.length,

                unreadCount:
                    unreadCount,

                counts: {

                    reminder:
                        reminderCount,

                    system:
                        systemCount,

                    lead:
                        leadCount,

                    policy:
                        policyCount,

                    ai:
                        aiCount

                },

                notifications:
                    notifications

            });

        }

        catch (error) {

            console.error(
                "Get notifications error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Server error while loading notifications."

            });

        }

    }
);


// =========================================
// MARK ONE NOTIFICATION AS READ
// =========================================

app.put(
    "/api/notifications/:id/read",
    async (req, res) => {

        try {

            const notificationId =
                req.params.id;

            const {
                agentId
            } = req.body;


            if (!agentId) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Agent ID is required."

                });

            }


            const notification =
                await Notification.findOne({

                    _id:
                        notificationId,

                    agentId:
                        agentId

                });


            if (!notification) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Notification not found."

                });

            }


            notification.isRead =
                true;


            await notification.save();


            res.status(200).json({

                success: true,

                message:
                    "Notification marked as read.",

                notification:
                    notification

            });

        }

        catch (error) {

            console.error(
                "Mark notification read error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Server error while updating notification."

            });

        }

    }
);


// =========================================
// MARK ALL NOTIFICATIONS AS READ
// =========================================

app.put(
    "/api/notifications/mark-all-read",
    async (req, res) => {

        try {

            const {
                agentId
            } = req.body;


            if (!agentId) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Agent ID is required."

                });

            }


            const result =
                await Notification.updateMany(

                    {
                        agentId:
                            agentId,

                        isRead:
                            false
                    },

                    {
                        $set: {

                            isRead:
                                true

                        }
                    }

                );


            res.status(200).json({

                success: true,

                message:
                    "All notifications marked as read.",

                modifiedCount:
                    result.modifiedCount

            });

        }

        catch (error) {

            console.error(
                "Mark all notifications read error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Server error while updating notifications."

            });

        }

    }
);


// =========================================
// DELETE NOTIFICATION
// =========================================

app.delete(
    "/api/notifications/:id",
    async (req, res) => {

        try {

            const notificationId =
                req.params.id;

            const agentId =
                req.query.agentId ||
                req.body.agentId;


            if (!agentId) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Agent ID is required."

                });

            }


            const deletedNotification =
                await Notification.findOneAndDelete({

                    _id:
                        notificationId,

                    agentId:
                        agentId

                });


            if (!deletedNotification) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Notification not found."

                });

            }


            res.status(200).json({

                success: true,

                message:
                    "Notification deleted successfully."

            });

        }

        catch (error) {

            console.error(
                "Delete notification error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Server error while deleting notification."

            });

        }

    }
);


// =========================================
// AGENT DASHBOARD
// =========================================

app.get(
    "/api/dashboard",
    async (req, res) => {

        try {

            const {
                agentId
            } = req.query;


            if (!agentId) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Agent ID is required."

                });

            }


            const agent =
                await Agent.findById(
                    agentId
                )
                .select("-password");


            if (!agent) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Agent not found."

                });

            }


            const customerCount =
                await Customer.countDocuments({

                    agentId:
                        agent._id

                });


            const policyCount =
                await Policy.countDocuments({

                    agentId:
                        agent._id,

                    status:
                        "Active"

                });


            const followupCount =
                await Followup.countDocuments({

                    agentId:
                        agent._id,

                    status:
                        "Pending"

                });


            const leadCount =
                await Lead.countDocuments({

                    agentId:
                        agent._id,

                    priority:
                        "High"

                });


            const unreadNotificationCount =
                await Notification.countDocuments({

                    agentId:
                        agent._id,

                    isRead:
                        false

                });


            res.status(200).json({

                success: true,

                agent: {

                    id:
                        agent._id,

                    fullName:
                        agent.fullName,

                    email:
                        agent.email,

                    phone:
                        agent.phone,

                    city:
                        agent.city,

                    agentId:
                        agent.agentId,

                    branch:
                        agent.branch,

                    role:
                        agent.role,

                    status:
                        agent.status

                },

                stats: {

                    customers:
                        customerCount,

                    policies:
                        policyCount,

                    followups:
                        followupCount,

                    leads:
                        leadCount,

                    notifications:
                        unreadNotificationCount

                }

            });

        }

        catch (error) {

            console.error(
                "Dashboard error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Server error while loading dashboard."

            });

        }

    }
);


// =========================================
// SERVER
// =========================================

const PORT =
    process.env.PORT || 5000;


app.listen(
    PORT,
    () => {

        console.log(
            `TrustNest server running on port ${PORT}`
        );

    }
);