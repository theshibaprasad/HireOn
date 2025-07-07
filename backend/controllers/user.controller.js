import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { Job } from "../models/job.model.js";

// Configure nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const register = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, password, role } = req.body;

        // Input validation
        if (!fullname || !email || !phoneNumber || !password || !role) {
            return res.status(400).json({
                message: "Something is missing",
                success: false
            });
        }

         // File handling (only if file is uploaded)
         const file = req.file;
         let cloudResponse = null;
         let profilePhoto = "https://www.shutterstock.com/image-vector/circle-line-simple-design-logo-600nw-2174926871.jpg"; // Default
 
         if (file) {
             const fileUri = getDataUri(file);
             cloudResponse = await cloudinary.uploader.upload(fileUri.content);
             profilePhoto = cloudResponse.secure_url;
         }
        // Check if the user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                message: 'User already exists with this email.',
                success: false,
            });
        }

        // Hashing password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate verification token for students
        let verificationToken = null;
        let verificationExpires = null;
        
        if (role === 'student') {
            verificationToken = crypto.randomBytes(32).toString('hex');
            verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        }

        // Create new user
        const newUser = await User.create({
            fullname,
            email,
            phoneNumber,
            password: hashedPassword,
            role,
            isVerified: role === 'student' ? false : (role === 'superadmin' ? true : false), // Only superadmin is auto-verified
            verificationToken: role === 'student' ? verificationToken : null,
            verificationExpires: role === 'student' ? verificationExpires : null,
            profile: {
                profilePhoto: cloudResponse ? cloudResponse.secure_url : null, // Only if a file is uploaded
            }
        });

        // Send welcome email with verification link for students
        if (role === 'student') {
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            const verificationUrl = `${frontendUrl}/verify-email/${verificationToken}`;

            await transporter.sendMail({
                from: "job.hireon@gmail.com",
                to: email,
                subject: 'Welcome to HireOn - Verify Your Account',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                            <h1 style="color: #6A38C2; text-align: center; margin-bottom: 30px;">Welcome to HireOn!</h1>
                            
                            <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
                                Hello ${fullname},
                            </p>
                            
                            <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
                                Welcome to HireOn! We're excited to have you join our platform. To get started and access all features, please verify your email address by clicking the button below.
                            </p>
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${verificationUrl}" style="background-color: #6A38C2; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                                    Verify Email Address
                                </a>
                            </div>
                            
                            <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
                                <strong>Important:</strong> This verification link will expire in 24 hours. If you don't verify your account within this time, your account will be automatically deleted.
                            </p>
                            
                            <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
                                If you didn't create an account with HireOn, please ignore this email.
                            </p>
                            
                            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
                                <p style="color: #666; font-size: 12px; text-align: center;">
                                    Best regards,<br>
                                    The HireOn Team
                                </p>
                            </div>
                        </div>
                    </div>
                `
            });
        }

        return res.status(201).json({
            message: role === 'student'
                ? "Account created successfully. Please check your email to verify your account."
                : role === 'recruiter'
                    ? "Account created successfully. Your account is pending verification by the Super Admin."
                    : "Account created successfully.",
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Something went wrong.",
            success: false
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Input validation
        if (!email || !password) {
            return res.status(400).json({
                message: "Something is missing",
                success: false
            });
        }

        // Find user by email
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: "Incorrect email or password.",
                success: false,
            });
        }

        // Compare password
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({
                message: "Incorrect email or password.",
                success: false,
            });
        }

        // Check if student account is verified
        if (user.role === 'student' && !user.isVerified) {
            return res.status(400).json({
                message: "Please verify your email address before logging in. Check your inbox for the verification link.",
                success: false
            });
        }
        // Check if recruiter account is verified
        if (user.role === 'recruiter' && !user.isVerified) {
            return res.status(400).json({
                message: "Your recruiter account is pending verification by the Super Admin.",
                success: false
            });
        }

        // Generate token
        const tokenData = {
          id: user._id.toString(),
          _id: user._id.toString(),
          role: user.role,
          fullname: user.fullname,
          email: user.email,
          phoneNumber: user.phoneNumber,
          profile: user.profile
        };
        const token = await jwt.sign(tokenData, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.cookie('token', token, {
          httpOnly: true,
          sameSite: 'strict',
          secure: false, // set to true if using HTTPS
          maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        return res.status(200).json({
          success: true,
          message: 'Login successful',
          token,
          user
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Something went wrong.",
            success: false
        });
    }
};

export const logout = async (req, res) => {
    try {
        return res.status(200).cookie("token", "", { maxAge: 0 }).json({
            message: "Logged out successfully.",
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Something went wrong.",
            success: false
        });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: "User not found with this email.",
                success: false
            });
        }

        // Generate reset token
        const resetToken = jwt.sign({ userId: user._id }, process.env.RESET_SECRET_KEY, { expiresIn: '15m' });

        // Create reset password URL
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

        // Log the reset URL for debugging (remove in production)
        console.log('Reset URL:', resetUrl);

        // Send email
        await transporter.sendMail({
            from: "job.hireon@gmail.com",
            to: email,
            subject: 'Password Reset Request - HireOn',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                    <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <h1 style="color: #6A38C2; text-align: center; margin-bottom: 30px;">Password Reset Request</h1>
                        
                        <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
                            Hello ${user.fullname},
                        </p>
                        
                        <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
                            We received a request to reset your password for your HireOn account. Click the button below to reset your password. This link will expire in 15 minutes.
                        </p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetUrl}" style="padding: 15px 30px; background-color: #6A38C2; color: white; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">Reset Password</a>
                        </div>
                        
                        <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
                            If the button doesn't work, you can copy and paste this link into your browser:
                        </p>
                        
                        <p style="color: #6A38C2; font-size: 14px; word-break: break-all; margin-bottom: 20px;">
                            ${resetUrl}
                        </p>
                        
                        <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
                            If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
                        </p>
                        
                        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                        
                        <p style="color: #999; font-size: 12px; text-align: center;">
                            Best regards,<br>
                            <strong>HireOn Team</strong>
                        </p>
                    </div>
                </div>
            `
        });

        return res.status(200).json({
            message: "Password reset link sent to your email.",
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Something went wrong.",
            success: false
        });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        // Verify token
        const decoded = jwt.verify(token, process.env.RESET_SECRET_KEY);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(400).json({
                message: "Invalid or expired reset token.",
                success: false
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({
            message: "Password reset successful.",
            success: true
        });
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(400).json({
                message: "Invalid or expired reset token.",
                success: false
            });
        }
        console.log(error);
        return res.status(500).json({
            message: "Something went wrong.",
            success: false
        });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, bio, skills, university, universityRegistrationNo } = req.body;

        // File handling for profile update
        console.log('Files received:', req.files);
        console.log('All file fields:', Object.keys(req.files || {}));
        
        // Access files more safely
        const file = req.files?.file?.[0]; // Resume file
        const profileImage = req.files?.profileImage?.[0]; // Profile image file
        
        console.log('Resume file:', file);
        console.log('Profile image:', profileImage);
        console.log('Profile image field:', req.files?.profileImage);
        
        // Alternative way to access profile image
        if (!profileImage && req.files?.profileImage) {
            console.log('Profile image array:', req.files.profileImage);
            console.log('Profile image array length:', req.files.profileImage.length);
        }
        
        let cloudResponse = null;
        let profileImageResponse = null;

        // Upload resume if provided
        if (file) {
            try {
                console.log('Uploading resume file:', file.originalname);
                console.log('File buffer size:', file.buffer.length);
                
                const fileUri = getDataUri(file);
                console.log('Data URI generated:', fileUri.content.substring(0, 100) + '...');
                
                cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
                    resource_type: 'raw',
                    folder: 'resumes',
                    public_id: `resume_${Date.now()}`,
                    format: 'pdf',
                    access_mode: 'public'
                });
                
                console.log('Resume uploaded successfully:', cloudResponse.secure_url);
                console.log('Resume public ID:', cloudResponse.public_id);
                console.log('Resume resource type:', cloudResponse.resource_type);
            } catch (uploadError) {
                console.error('Error uploading resume:', uploadError);
                return res.status(500).json({
                    message: "Error uploading resume file: " + uploadError.message,
                    success: false
                });
            }
        }

        // Upload profile image if provided
        let actualProfileImage = profileImage;
        
        // Fallback: try to get profile image from different access patterns
        if (!actualProfileImage && req.files?.profileImage) {
            if (Array.isArray(req.files.profileImage)) {
                actualProfileImage = req.files.profileImage[0];
            } else if (req.files.profileImage) {
                actualProfileImage = req.files.profileImage;
            }
        }
        
        console.log('Final profile image to upload:', actualProfileImage);
        
        if (actualProfileImage) {
            try {
                console.log('Uploading profile image:', actualProfileImage.originalname);
                const imageUri = getDataUri(actualProfileImage);
                profileImageResponse = await cloudinary.uploader.upload(imageUri.content, {
                    folder: 'profile-photos',
                    transformation: [
                        { width: 400, height: 400, crop: 'fill' },
                        { quality: 'auto' }
                    ]
                });
                console.log('Profile image uploaded successfully:', profileImageResponse.secure_url);
            } catch (uploadError) {
                console.error('Error uploading profile image:', uploadError);
                return res.status(500).json({
                    message: "Error uploading profile image: " + uploadError.message,
                    success: false
                });
            }
        }

        // Skills handling
        let skillsArray = [];
        if (skills) {
            skillsArray = skills.split(",").map(skill => skill.trim()).filter(skill => skill.length > 0);
        }

        // User ID from middleware (authentication)
        const userId = req.id;
        let user = await User.findById(userId);

        if (!user) {
            return res.status(400).json({
                message: "User not found.",
                success: false
            });
        }

        // Update user profile fields
        if (fullname) user.fullname = fullname;
        if (email) user.email = email;
        if (phoneNumber && !isNaN(Number(phoneNumber))) user.phoneNumber = Number(phoneNumber);
        if (bio) user.profile.bio = bio;
        if (skills) user.profile.skills = skillsArray;
        if (university) user.profile.university = university;
        if (universityRegistrationNo) user.profile.universityRegistrationNo = universityRegistrationNo;

        // Update resume if uploaded
        if (cloudResponse) {
            user.profile.resume = cloudResponse.secure_url;
            user.profile.resumeOriginalName = file.originalname;
            console.log('Resume URL:', cloudResponse.secure_url);
        }

        // Update profile photo if uploaded
        if (profileImageResponse) {
            user.profile.profilePhoto = profileImageResponse.secure_url;
            console.log('Profile photo updated in user object:', user.profile.profilePhoto);
        }

        await user.save();

        // Prepare updated user object for response
        user = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile
        };

        // Generate new JWT token after profile update
        const tokenData = {
            id: user._id.toString(),
            _id: user._id.toString(),
            role: user.role,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            profile: user.profile
        };
        const token = await jwt.sign(tokenData, process.env.JWT_SECRET, { expiresIn: '1d' });

        // Set new token as cookie (optional, for consistency)
        res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'strict',
            secure: false, // set to true if using HTTPS
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        return res.status(200).json({
            message: "Profile updated successfully.",
            user,
            token,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Something went wrong.",
            success: false
        });
    }
};

export const deleteAccount = async (req, res) => {
    try {
        const { email, password } = req.body;
        const userId = req.id; // From authentication middleware
        console.log('deleteAccount: userId from JWT:', userId);
        console.log('deleteAccount: request body:', req.body);
        // Find user by ID
        const user = await User.findById(userId);
        console.log('deleteAccount: user found:', user);
        if (!user) {
            return res.status(404).json({
                message: "User not found.",
                success: false
            });
        }

        // Verify email matches
        if (user.email !== email) {
            return res.status(400).json({
                message: "Email does not match your account.",
                success: false
            });
        }

        // Verify password
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({
                message: "Incorrect password.",
                success: false
            });
        }

        // Delete user account
        await User.findByIdAndDelete(userId);

        // Clear the authentication cookie
        res.cookie("token", "", { maxAge: 0 });

        return res.status(200).json({
            message: "Account deleted successfully.",
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Something went wrong.",
            success: false
        });
    }
};

// Migration function to handle existing users without verification fields
const migrateExistingUsers = async () => {
    try {
        const usersWithoutVerification = await User.find({
            $or: [
                { isVerified: { $exists: false } },
                { verificationToken: { $exists: false } },
                { verificationExpires: { $exists: false } }
            ]
        });

        if (usersWithoutVerification.length > 0) {
            console.log(`Found ${usersWithoutVerification.length} users without verification fields. Migrating...`);
            
            for (const user of usersWithoutVerification) {
                // Set default values for existing users
                if (user.isVerified === undefined) {
                    user.isVerified = false;
                }
                if (!user.verificationToken) {
                    user.verificationToken = undefined;
                }
                if (!user.verificationExpires) {
                    user.verificationExpires = undefined;
                }
                await user.save();
            }
            
            console.log('Migration completed successfully');
        }
    } catch (error) {
        console.log('Migration error:', error);
    }
};

export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;
        console.log('Verification attempt with token:', token);

        // Run migration for existing users
        await migrateExistingUsers();

        // First, let's check if any user has this token (for debugging)
        const allUsersWithToken = await User.find({ verificationToken: token });
        console.log('All users with this token:', allUsersWithToken.length);
        
        // Let's also check all users to see if verification fields exist
        const allUsers = await User.find({});
        console.log('Total users in database:', allUsers.length);
        console.log('Users with verification fields:');
        allUsers.forEach(user => {
            console.log(`- ${user.email}: isVerified=${user.isVerified}, hasToken=${!!user.verificationToken}, expires=${user.verificationExpires}`);
        });
        
        // Find user with the verification token and not expired
        let user = await User.findOne({ 
            verificationToken: token,
            verificationExpires: { $gt: Date.now() }
        });

        console.log('User found with valid token:', user ? 'Yes' : 'No');
        
        // If no user found with valid token, check if user exists but token is expired or missing
        if (!user) {
            // Try to find user by token without expiration check
            user = await User.findOne({ verificationToken: token });
            
            if (user) {
                console.log('User found but token expired or invalid');
                console.log('User email:', user.email);
                console.log('User verification token:', user.verificationToken);
                console.log('User verification expires:', user.verificationExpires);
                console.log('Current time:', new Date());
                
                if (user.verificationExpires && user.verificationExpires < new Date()) {
                    return res.status(400).json({
                        message: "Verification token has expired. Please register again.",
                        success: false
                    });
                }
            }
        }

        if (!user) {
            console.log('Verification failed: User not found');
            return res.status(400).json({
                message: "Invalid verification token. Please check your email link.",
                success: false
            });
        }

        // Check if user is already verified
        if (user.isVerified) {
            console.log('User already verified:', user.email);
            return res.status(400).json({
                message: "Email is already verified. You can now log in.",
                success: false
            });
        }

        // Update user as verified
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationExpires = undefined;
        await user.save();

        console.log('User verified successfully:', user.email);

        return res.status(200).json({
            message: "Email verified successfully!",
            success: true
        });
    } catch (error) {
        console.log('Verification error:', error);
        return res.status(500).json({
            message: "Something went wrong.",
            success: false
        });
    }
};

export const getResume = async (req, res) => {
    try {
        const userId = req.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found.",
                success: false
            });
        }

        if (!user.profile?.resume) {
            return res.status(404).json({
                message: "No resume found.",
                success: false
            });
        }

        console.log('Fetching resume from:', user.profile.resume);

        // Fetch the PDF from Cloudinary
        const response = await fetch(user.profile.resume);
        
        if (!response.ok) {
            console.error('Failed to fetch from Cloudinary:', response.status, response.statusText);
            return res.status(404).json({
                message: "Resume not found.",
                success: false
            });
        }

        // Get the content type from the response
        const contentType = response.headers.get('content-type');
        console.log('Content-Type from Cloudinary:', contentType);

        // Get the PDF as a buffer
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        console.log('PDF buffer size:', buffer.length);

        // Set proper headers for PDF serving
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.setHeader('Content-Type', contentType || 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${user.profile.resumeOriginalName || 'resume.pdf'}"`);
        res.setHeader('Content-Length', buffer.length);
        res.setHeader('Cache-Control', 'no-cache');

        // Send the PDF buffer
        res.send(buffer);
    } catch (error) {
        console.error('Error serving resume:', error);
        return res.status(500).json({
            message: "Error serving resume.",
            success: false
        });
    }
};

// Temporary endpoint for debugging - remove this in production
export const debugUserVerification = async (req, res) => {
    try {
        const { email } = req.params;
        console.log('Debug verification for email:', email);
        
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }
        
        console.log('User found:', {
            email: user.email,
            isVerified: user.isVerified,
            hasVerificationToken: !!user.verificationToken,
            verificationExpires: user.verificationExpires,
            createdAt: user.createdAt
        });
        
        // Manually verify the user
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationExpires = undefined;
        await user.save();
        
        console.log('User manually verified:', user.email);
        
        return res.status(200).json({
            message: "User manually verified for debugging",
            success: true,
            user: {
                email: user.email,
                isVerified: user.isVerified
            }
        });
    } catch (error) {
        console.log('Debug verification error:', error);
        return res.status(500).json({
            message: "Something went wrong.",
            success: false
        });
    }
};

export const changePassword = async (req, res) => {
    try {
        const userId = req.id; // From authentication middleware
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                message: 'Old password and new password are required.',
                success: false
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: 'User not found.',
                success: false
            });
        }

        // Check old password
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({
                message: 'Old password is incorrect.',
                success: false
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        return res.status(200).json({
            message: 'Password changed successfully.',
            success: true
        });
    } catch (error) {
        console.error('Change password error:', error);
        return res.status(500).json({
            message: 'Something went wrong.',
            success: false
        });
    }
};

// Save a job for later
export const saveJobForLater = async (req, res) => {
    try {
        const userId = req.id;
        const jobId = req.params.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }
        if (user.savedJobs.includes(jobId)) {
            return res.status(400).json({ message: "Job already saved", success: false });
        }
        user.savedJobs.push(jobId);
        await user.save();
        return res.status(200).json({ message: "Job saved for later", success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Something went wrong", success: false });
    }
};

// Unsave a job
export const unsaveJobForLater = async (req, res) => {
    try {
        const userId = req.id;
        const jobId = req.params.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }
        user.savedJobs = user.savedJobs.filter(jid => jid.toString() !== jobId);
        await user.save();
        return res.status(200).json({ message: "Job removed from saved", success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Something went wrong", success: false });
    }
};

// Get all saved jobs for the user
export const getSavedJobs = async (req, res) => {
    try {
        const userId = req.id;
        const user = await User.findById(userId).populate({
            path: 'savedJobs',
            populate: { path: 'company' }
        });
        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }
        return res.status(200).json({ jobs: user.savedJobs, success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Something went wrong", success: false });
    }
};
