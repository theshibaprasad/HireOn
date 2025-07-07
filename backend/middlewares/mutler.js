import multer from "multer";

const storage = multer.memoryStorage();

// Single file upload (for resume)
export const singleUpload = multer({storage}).single("file");

// Multiple files upload (for profile update with both resume and profile image)
export const multipleUpload = multer({storage}).fields([
    { name: 'file', maxCount: 1 }, // Resume
    { name: 'profileImage', maxCount: 1 } // Profile image
]);