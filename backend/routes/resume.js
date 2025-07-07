import express from 'express';
import multer from 'multer';
import fs from 'fs';
import uploadToDrive from '../utils/uploadResume.js';
import { User } from '../models/user.model.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

const FOLDER_ID = '1BZuh04LiYbBjZdtpzTGt0E07Nw-e6BGi'; // Your Google Drive folder ID

router.post('/upload-resume', isAuthenticated, upload.single('resume'), async (req, res) => {
  try {
    const filePath = req.file.path;
    const fileName = req.file.originalname;
    const mimeType = req.file.mimetype;
    const userId = req.id; // From auth middleware

    const result = await uploadToDrive(filePath, fileName, FOLDER_ID, mimeType);

    // Clean up temp file
    fs.unlinkSync(filePath);

    // Save resume links to user profile
    await User.findByIdAndUpdate(userId, {
      'profile.resume': result.viewLink,
      'profile.resumeDownload': result.downloadLink,
      'profile.resumeOriginalName': fileName
    });

    res.json({
      success: true,
      message: 'Uploaded successfully!',
      ...result,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Upload failed.' });
  }
});

export default router; 