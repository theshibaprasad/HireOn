// user.route.js
import express from "express";
import { login, logout, register, updateProfile, forgotPassword, resetPassword, getResume, verifyEmail, deleteAccount, debugUserVerification, changePassword } from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { singleUpload, multipleUpload } from "../middlewares/mutler.js";
import nodemailer from 'nodemailer';
import { Message } from '../models/message.model.js';
import passport from '../auth/google.js';
import jwt from 'jsonwebtoken';
import bcrypt from "bcryptjs";
import { ContactMessage } from '../models/contactMessage.model.js';

import { User } from '../models/user.model.js'; // Correct way to import a named export


const router = express.Router();
const FRONTEND_URL = 'http://localhost:8000';

// Auth routes
router.route("/register").post(singleUpload, register);
router.route("/login").post(login);
router.route("/logout").get(logout);

// Password reset routes
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password/:token").post(resetPassword);

// Profile routes
router.route("/profile/update").post(isAuthenticated, multipleUpload, updateProfile);
router.route("/resume").get(isAuthenticated, getResume);

// Email verification route
router.route("/verify-email/:token").get(verifyEmail);

// Account deletion route
router.route("/delete-account").post(isAuthenticated, deleteAccount);

// Debug route (remove in production)
router.route("/debug-verify/:email").get(debugUserVerification);

// Change password route
router.route("/change-password").post(isAuthenticated, changePassword);

// Nodemailer transporter (reuse from controller)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Super Admin: Get all users (optionally filter by role)
router.route("/all").get(async (req, res) => {
    try {
        const { role } = req.query;
        let query = {};
        if (role) query.role = role;
        const users = await User.find(query).select('-password');
        res.json({ success: true, users });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Super Admin: Verify recruiter
router.route("/verify/:id").patch(async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || user.role !== 'recruiter') {
            return res.status(404).json({ success: false, message: 'Recruiter not found' });
        }
        user.isVerified = true;
        await user.save();
        // Send verification email
        await transporter.sendMail({
            from: "job.hireon@gmail.com",
            to: user.email,
            subject: 'Your HireOn Recruiter Account is Verified!',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                    <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <h1 style="color: #6A38C2; text-align: center; margin-bottom: 30px;">Congratulations!</h1>
                        <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
                            Hello ${user.fullname},
                        </p>
                        <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
                            Your recruiter account on <b>HireOn</b> has been verified and activated by our Super Admin. You can now log in and start posting jobs!
                        </p>
                        <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
                            <p style="color: #666; font-size: 12px; text-align: center;">
                                Thanks for using HireOn!<br>
                                The HireOn Team
                            </p>
                        </div>
                    </div>
                </div>
            `
        });
        res.json({ success: true, message: 'Recruiter verified and email sent' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Super Admin: Delete any user
router.route("/:id").delete(async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        // Send deletion email
        await transporter.sendMail({
            from: "job.hireon@gmail.com",
            to: user.email,
            subject: 'Your HireOn Account Has Been Deleted',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                    <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <h1 style="color: #F83002; text-align: center; margin-bottom: 30px;">Account Deleted</h1>
                        <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
                            Hello ${user.fullname},
                        </p>
                        <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
                            Your account on <b>HireOn</b> has been deleted by our Super Admin. If you believe this was a mistake, please contact us.
                        </p>
                        <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
                            <p style="color: #666; font-size: 12px; text-align: center;">
                                Thanks for using HireOn!<br>
                                The HireOn Team
                            </p>
                        </div>
                    </div>
                </div>
            `
        });
        res.json({ success: true, message: 'User deleted and email sent' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Contact form: Save a message
router.route('/contact').post(async (req, res) => {
    try {
        const { name, email, role, message } = req.body;
        if (!name || !email || !role || !message) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }
        const newMsg = await ContactMessage.create({ name, email, role, message });
        res.status(201).json({ success: true, message: 'Message sent successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Super Admin: Get all contact messages
router.route('/contact').get(async (req, res) => {
    try {
        const messages = await ContactMessage.find().sort({ createdAt: -1 });
        res.json({ success: true, messages });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Super Admin: Delete a contact message
router.route('/contact/:id').delete(async (req, res) => {
    try {
        const msg = await Message.findByIdAndDelete(req.params.id);
        if (!msg) {
            return res.status(404).json({ success: false, message: 'Message not found' });
        }
        res.json({ success: true, message: 'Message deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Google OAuth login/signup (student only)
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: FRONTEND_URL + '/login' }), (req, res) => {
  // Issue JWT and redirect to frontend
  const user = req.user;
  const token = jwt.sign({
    id: user._id,
    role: user.role,
    fullname: user.fullname,
    email: user.email,
    profile: user.profile
  }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: false, // set to true if using HTTPS
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
  res.redirect(`${FRONTEND_URL}/google-auth-success?token=${token}`);
});

// TEMP: Reset superadmin password to 'super@hireon' (DEV ONLY, REMOVE AFTER USE)
router.post("/reset-superadmin-password", async (req, res) => {
  const email = "superadmin@hireon.com";
  const user = await User.findOne({ email, role: "superadmin" });
  if (!user) return res.status(404).json({ success: false, message: "Superadmin not found" });

  user.password = await bcrypt.hash("super@hireon", 10);
  await user.save();
  res.json({ success: true, message: "Superadmin password reset to 'super@hireon'" });
});

export default router;
