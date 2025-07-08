import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";
import companyRoute from "./routes/company.route.js";
import jobRoute from "./routes/job.route.js";
import applicationRoute from "./routes/application.route.js";
import { cleanupUnverifiedUsers } from "./utils/cleanupUnverifiedUsers.js";
import { User } from "./models/user.model.js";
import bcrypt from "bcryptjs";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import chatRoute from "./routes/chat.route.js";
import { Message } from "./models/message.model.js";
import { Application } from "./models/application.model.js";
import { Job } from "./models/job.model.js";
import jwt from "jsonwebtoken";
import resumeRouter from './routes/resume.js';
import passport from './auth/google.js';
import session from 'express-session';
import path from "path";

dotenv.config({});

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        credentials: true,
        methods: ["GET", "POST"]
    },
    transports: ['websocket', 'polling']
});

// middleware
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
};
app.use(cors(corsOptions));

app.use(session({
  secret: process.env.JWT_SECRET || 'supersecretjwtkey123',
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

const PORT = process.env.PORT || 3003;
const _dirname = path.resolve();

// api's
app.use("/api/v1/user", userRoute);
app.use("/api/v1/company", companyRoute);
app.use("/api/v1/job", jobRoute);
app.use("/api/v1/application", applicationRoute);
app.use("/api/v1/chat", chatRoute);
app.use('/api', resumeRouter);
app.use('/api', userRoute);
app.use(express.static(path.join(_dirname, "/frontend/dist")));
app.get('*', (_, res) => {
    res.sendFile(path.resolve(_dirname, "frontend", "dist", "index.html"));
})

// Super Admin registration endpoint (for initial setup only)
app.post("/api/v1/adminsupersign", async (req, res) => {
    try {
        const email = "superadmin@hireon.com";
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(409).json({ message: "Super Admin already exists" });
        }
        const hashedPassword = await bcrypt.hash("hireon@super", 10);
        const superAdmin = new User({
            fullname: "SuperAdmin",
            email,
            phoneNumber: 9999999999,
            password: hashedPassword, // hashed password
            role: "superadmin",
            isVerified: true,
            profile: {},
        });
        await superAdmin.save();
        return res.status(201).json({ message: "Super Admin created successfully" });
    } catch (err) {
        return res.status(500).json({ message: "Server error" });
    }
});

// Socket.io connection event
io.on("connection", (socket) => {
    console.log("A user connected: " + socket.id);

    // Authenticate user via JWT (from handshake auth)
    socket.on("join_application", async ({ token, applicationId }) => {
        try {
            if (!token || !applicationId) return;
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userId = decoded.id;
            // Check if user is allowed to chat on this application
            const application = await Application.findById(applicationId).populate('job applicant');
            if (!application || application.status !== 'accepted') return;
            const isApplicant = application.applicant._id.equals(userId);
            const isRecruiter = application.job && application.job.created_by && application.job.created_by.equals(userId);
            if (!isApplicant && !isRecruiter) return;
            // Join room
            socket.join(`application_${applicationId}`);
            socket.data.userId = userId;
            socket.data.applicationId = applicationId;
        } catch (err) {
            // Invalid token or error
        }
    });

    // Handle sending a message
    socket.on("send_message", async ({ token, applicationId, message, replyTo }) => {
        try {
            if (!token || !applicationId || !message) return;
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userId = decoded.id;
            // Check if user is allowed to chat on this application
            const application = await Application.findById(applicationId).populate('job applicant');
            if (!application || application.status !== 'accepted') return;
            const isApplicant = application.applicant._id.equals(userId);
            const isRecruiter = application.job && application.job.created_by && application.job.created_by.equals(userId);
            if (!isApplicant && !isRecruiter) return;
            // Determine receiver
            const receiverId = isApplicant ? application.job.created_by : application.applicant._id;
            // Save message
            const msg = await Message.create({
                application: applicationId,
                job: application.job._id,
                sender: userId,
                receiver: receiverId,
                message,
                replyTo: replyTo || null
            });
            // Populate sender and receiver for frontend alignment
            const populatedMsg = await Message.findById(msg._id).populate('sender receiver');
            // Emit to both users in the room
            io.to(`application_${applicationId}`).emit("receive_message", {
                _id: populatedMsg._id,
                application: populatedMsg.application,
                job: populatedMsg.job,
                sender: populatedMsg.sender, // now an object with _id
                receiver: populatedMsg.receiver, // now an object with _id
                message: populatedMsg.message,
                replyTo: populatedMsg.replyTo,
                createdAt: populatedMsg.createdAt
            });
        } catch (err) {
            // Invalid token or error
        }
    });

    socket.on("disconnect", () => {
        // Cleanup if needed
    });
});

// Only start server if not in Vercel environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    server.listen(PORT,()=>{
        connectDB();
        console.log(`Server running at port ${PORT}`);
        
        // Run cleanup every hour
        setInterval(cleanupUnverifiedUsers, 60 * 60 * 1000);
        
        // Run initial cleanup
        cleanupUnverifiedUsers();
    })
} else {
    // For Vercel serverless
    connectDB();
    console.log(`Serverless function ready`);
}

// Export io for use in other modules
export { io };

// Export app for Vercel
export default app;

// Patch: emit socket event on message delete
import { deleteMessage as origDeleteMessage } from "./controllers/chat.controller.js";

// Patch the deleteMessage controller to emit socket event
const patchedDeleteMessage = async (req, res) => {
  try {
    const messageId = req.params.messageId;
    const msg = await Message.findById(messageId);
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found.' });
    const applicationId = msg.application;
    await Message.findByIdAndDelete(messageId);
    // Emit to both users in the room
    io.to(`application_${applicationId}`).emit("message_deleted", { messageId, applicationId });
    res.json({ success: true, message: 'Message deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Patch the route
chatRoute.stack.forEach(layer => {
  if (layer.route && layer.route.path === '/message/:messageId' && layer.route.methods.delete) {
    layer.route.stack[0].handle = patchedDeleteMessage;
  }
});