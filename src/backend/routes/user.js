// routes/user.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/db'); // Adjust path if needed
const authenticateToken = require('../middleware/authMiddleware'); // Adjust path if needed

const router = express.Router();


// --- Multer Configuration for Profile Picture Uploads ---

// Ensure the upload directory exists
// Correct path assuming 'routes' and 'public' are siblings in the parent directory
const uploadDir = path.join(__dirname, '..','..','..', 'public', 'uploads', 'profile-pics');
if (!fs.existsSync(uploadDir)){
    try {
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log(`Created upload directory: ${uploadDir}`);
    } catch (mkdirErr) {
        console.error(`Error creating upload directory ${uploadDir}:`, mkdirErr);
        // Consider stopping server startup if directory can't be created
        process.exit(1);
    }
}

// Configure disk storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); // Use the verified/created directory path
    },
    filename: function (req, file, cb) {
        // Create a unique filename: userId-timestamp.extension
        // Ensure req.user exists BEFORE this is called (authenticateToken middleware runs first)
        const userId = req.user?.userId || 'unknown_user'; // Get userId from authenticated user, provide fallback
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `user-${userId}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

// File filter to accept only specific image types
const imageFileFilter = (req, file, cb) => {
    // Regular expression to check mimetype
    const allowedTypes = /jpeg|jpg|png|gif/;
    const isMimeTypeAllowed = allowedTypes.test(file.mimetype);
    // Check file extension as well
    const isExtAllowed = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (isMimeTypeAllowed && isExtAllowed) {
        cb(null, true); // Accept the file
    } else {
        // Reject the file with a specific error message
        cb(new Error('Invalid file type. Only JPG, JPEG, PNG, and GIF files are allowed.'), false);
    }
};

// *** CORRECTED Multer upload instance definition ***
const upload = multer({
    storage: storage,         // Use the defined storage configuration
    fileFilter: imageFileFilter, // Use the defined file filter
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB file size limit
    }
}); // <<< Semicolon added, removed duplicated text

// --- API Routes ---

// Route to Update Profile Details (Username, Email)
// PROTECTED: Requires authentication
router.put('/details', authenticateToken, async (req, res) => {
    const { userId } = req.user;
    const { username, email } = req.body;

    console.log(`Attempting to update details for userId: ${userId}`, { username, email });

    if (!username || !email) { /* ... validation ... */ return res.status(400).json({ message: 'Username and email required.' }); }

    try {
        const checkQuery = 'SELECT user_id FROM foolu_users WHERE (username = ? OR email = ?) AND userId != ?';
        db.query(checkQuery, [username, email, userId], (checkErr, checkResults) => {
            if (checkErr) { /* ... error handling ... */ return res.status(500).json({ message: "Error checking user details." }); }
            if (checkResults.length > 0) { /* ... conflict handling ... */ const conflictField = checkResults[0].username === username ? 'Username' : 'Email'; return res.status(409).json({ message: `${conflictField} is already taken.` }); }

            // !! Use your actual DB column names !! (e.g., foolu_username, foolu_email)
            const updateQuery = 'UPDATE foolu_users SET username = ?, foolu_email = ?, updated_at = CURRENT_TIMESTAMP WHERE userId = ?';
            db.query(updateQuery, [username, email, userId], (updateErr, updateResult) => {
                if (updateErr) { /* ... error handling ... */ return res.status(500).json({ message: "Database error updating details." }); }
                if (updateResult.affectedRows === 0) { /* ... error handling ... */ return res.status(404).json({ message: "User not found to update." }); }
                console.log(`User details updated successfully for userId: ${userId}`);
                res.status(200).json({ message: "Profile details updated successfully!" });
            });
        });
    } catch (error) { /* ... error handling ... */ res.status(500).json({ message: "An unexpected server error occurred." }); }
});


// Route to Upload/Update Profile Picture
// PROTECTED: Requires authentication
router.post('/profile-picture', authenticateToken, (req, res) => { // <<< METHOD is POST, PATH is /profile-picture
    upload.single('profileImage')(req, res, function (err) {
        console.log("MULTER DEBUG: Callback entered."); // Check if callback runs
    
        // --- Handle Multer/Filter Errors FIRST ---
        if (err instanceof multer.MulterError) {
            console.error("MULTER ERROR:", err.message);
            return res.status(400).json({ message: `File Upload Error: ${err.message}` });
        } else if (err) { // Catch errors from fileFilter or other issues during upload
            console.error("FILE UPLOAD ERROR (Non-Multer):", err.message);
            return res.status(400).json({ message: err.message || "Invalid file uploaded." });
        }
    
        // --- Check if file object exists AFTER error checks ---
        if (!req.file) {
            console.error("UPLOAD ERROR: req.file is undefined after upload attempt (no specific error caught).");
            return res.status(400).json({ message: 'File upload failed or no file provided.' });
        }
    
        // --- If we reach here, multer THINKS it saved the file ---
        console.log("MULTER DEBUG: req.file seems valid:", JSON.stringify(req.file));
        const { userId } = req.user; // Assume authenticateToken worked
        const imageUrl = `/uploads/profile-pics/${req.file.filename}`;
        try {
            // !! Use your actual DB column names !!
            const updateQuery = 'UPDATE foolu_users SET profile_picture_url = ?, updated_at = CURRENT_TIMESTAMP WHERE userId = ?';
            db.query(updateQuery, [imageUrl, userId], (updateErr, updateResult) => {
                if (updateErr) {
                    console.error("DB Error updating profile picture URL:", updateErr);
                    fs.unlink(req.file.path, (unlinkErr) => { if(unlinkErr) console.error("Error deleting file after DB fail:", unlinkErr); });
                    return res.status(500).json({ message: "Database error updating profile picture." });
                }
                if (updateResult.affectedRows === 0) {
                    fs.unlink(req.file.path, (unlinkErr) => { if(unlinkErr) console.error("Error deleting file for non-existent user:", unlinkErr); });
                    return res.status(404).json({ message: "User not found to update picture." });
                }

                console.log(`Profile picture updated successfully for userId: ${userId}`);
                res.status(200).json({
                    message: "Profile picture updated successfully!",
                    newImageUrl: imageUrl // Send the URL back
                });
            });
        } catch (error) {
            console.error("Unexpected error during profile picture DB update:", error);
            fs.unlink(req.file.path, (unlinkErr) => { if(unlinkErr) console.error("Error deleting file after unexpected error:", unlinkErr); });
            res.status(500).json({ message: "Server error processing upload." });
        }
    });
});

/*router.get('/test', (req, res) => {
    console.log("--- TEST /api/user/test route hit! ---");
    res.status(200).send("User route test successful!");
});*/



// Route for Requesting Password Change
// PROTECTED: Requires authentication
router.post('/request-password-change', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) { /* ... validation ... */ return res.status(400).json({ message: "Current/new passwords required."}); }
    if (newPassword.length < 8) { /* ... validation ... */ return res.status(400).json({ message: "New password too short."}); }

    try {
        // !! Use your actual DB column name !! (e.g., foolu_pass)
        const query = 'SELECT password_hash FROM users WHERE user_id = ?';
        db.query(query, [userId], async (err, results) => {
            if (err) { /* ... error handling ... */ return res.status(500).json({ message: "Database error." }); }
            if (results.length === 0) { /* ... error handling ... */ return res.status(404).json({ message: "User not found." }); }

            const user = results[0];
            const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);

            if (!isPasswordValid) { return res.status(401).json({ message: "Incorrect current password." }); }

            // --- TODO: Implement secure token generation & email sending ---
            console.log(`Password change requested for user ${userId}. Email flow should be triggered.`);

            res.status(200).json({ message: "Password change requested. Please check your email." });
        });
    } catch (error) { /* ... error handling ... */ res.status(500).json({ message: "Server error." }); }
});

module.exports = router;