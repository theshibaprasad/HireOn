// Script to check users in database
import mongoose from 'mongoose';
import { User } from './models/user.model.js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/hireon";

async function checkUsers() {
    try {
        // Connect to database
        await mongoose.connect(MONGO_URI);
        console.log('Connected to database');
        
        // Get all users
        const users = await User.find({});
        console.log(`Total users: ${users.length}`);
        
        users.forEach((user, index) => {
            console.log(`\nUser ${index + 1}:`);
            console.log(`  Email: ${user.email}`);
            console.log(`  Role: ${user.role}`);
            console.log(`  isVerified: ${user.isVerified}`);
            console.log(`  hasVerificationToken: ${!!user.verificationToken}`);
            console.log(`  verificationExpires: ${user.verificationExpires}`);
            console.log(`  Created: ${user.createdAt}`);
        });
        
        // Check for users with verification tokens
        const usersWithTokens = await User.find({ verificationToken: { $exists: true, $ne: null } });
        console.log(`\nUsers with verification tokens: ${usersWithTokens.length}`);
        
        usersWithTokens.forEach(user => {
            console.log(`  ${user.email}: ${user.verificationToken}`);
        });
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

async function createSuperAdmin() {
    await mongoose.connect(MONGO_URI);
    const email = "superadmin@hireon.com";
    const existing = await User.findOne({ email });
    if (existing) {
        console.log("Super Admin already exists.");
        process.exit(0);
    }
    const hashedPassword = await bcrypt.hash("hireon@super", 10);
    const superAdmin = new User({
        fullname: "SuperAdmin",
        email,
        phoneNumber: 9999999999,
        password: hashedPassword,
        role: "superadmin",
        isVerified: true,
        profile: {},
    });
    await superAdmin.save();
    console.log("Super Admin created successfully.");
    process.exit(0);
}

checkUsers();
createSuperAdmin(); 