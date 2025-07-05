// user.route.js
import express from "express";
import { login, logout, register, updateProfile } from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { singleUpload } from "../middlewares/mutler.js";

import { User } from '../models/user.model.js'; // Correct way to import a named export


const router = express.Router();

// Existing routes
router.route("/register").post(singleUpload, register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/profile/update").post(isAuthenticated, singleUpload, updateProfile);

// New route to fetch universities
router.route("/universities").get(async (req, res) => {
    try {
        // Fetch universities where role is 'university'
        const universities = await User.find({ role: 'university' }).select('fullname');  // Select only fullname or add more fields if needed
        if (universities.length === 0) {
            return res.status(404).json({ message: 'No universities found' });
        }
        return res.json({ success: true, universities });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching universities' });
    }
});

export default router;
