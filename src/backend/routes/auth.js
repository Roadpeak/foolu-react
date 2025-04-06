// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db'); // Adjust path if needed

const router = express.Router();

// ... (Signup route - Ensure INSERT query uses these exact column names too) ...
router.post('/signup', async (req, res) => {
    const { name, username, email, password, role } = req.body;
    if (!name || !username || !email || !password) { /* ... */ }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUserRole = role || 'viewer';
        // CORRECT INSERT based on your list
        const query = 'INSERT INTO foolu_users (foolu_name, foolu_username, foolu_email, foolu_pass, foolu_role) VALUES (?, ?, ?, ?, ?)';
        db.query(query, [name, username, email, hashedPassword, newUserRole], (err, result) => {
             if (err) { /* ... error handling ... */ }
             res.status(201).json({ message: 'User registered successfully' });
        });
    } catch (error) { /* ... error handling ... */ }
});


// --- Signin Route (Using YOUR exact column names) ---
router.post('/signin', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) { return res.status(400).json({ message: "Username and password required." }); }

    // --- CORRECTED QUERY based on your exact field names ---
    const query = `
        SELECT
            userId,            -- Primary Key column
            foolu_email,       -- Email column
            foolu_role,        -- Role column
            foolu_pass,        -- Password column
            foolu_username,    -- Username column (for response)
            profile_picture_url -- Optional pic URL column
        FROM
            foolu_users        -- Your table name
        WHERE
            foolu_username = ?`; // Lookup using username column

    db.query(query, [username], async (err, results) => {
        if (err) { console.error('DB Error:', err); return res.status(500).json({ message: 'Database error during sign in.' }); }
        if (results.length === 0) { return res.status(401).json({ message: 'Invalid username or password.' }); }

        const user = results[0];
        console.log("<<<<< SIGNIN: User data from DB >>>>>", JSON.stringify(user, null, 2)); // Log fetched data

        // Check essential properties EXIST on the 'user' object
        if (!user || typeof user.foolu_pass !== 'string' || typeof user.userId === 'undefined' || typeof user.foolu_email === 'undefined' || typeof user.foolu_role === 'undefined') {
             console.error("SIGNIN ERROR: Essential properties missing from fetched user data:", user);
             return res.status(500).json({ message: "Server error retrieving complete user credentials." });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.foolu_pass);
        if (!isPasswordValid) { return res.status(401).json({ message: 'Invalid username or password.' }); }

        if (!process.env.SECRET_KEY) { console.error("FATAL: SECRET_KEY missing"); return res.status(500).json({ message: "Server config error." }); }

        // --- CORRECTED PAYLOAD CREATION ---
        // Use the exact property names as selected and logged above
        const payload = {
            userId: user.userId,       // <<< Use userId (matches SELECT)
            email: user.foolu_email,   // <<< Use foolu_email (matches SELECT)
            role: user.foolu_role      // <<< Use foolu_role (matches SELECT)
        };
        console.log("<<<<< SIGNIN: Payload Object Created >>>>>", JSON.stringify(payload, null, 2));

        // Check payload values are not undefined AGAIN just before signing
        if (typeof payload.userId === 'undefined' || typeof payload.email === 'undefined' || typeof payload.role === 'undefined') {
            console.error("SIGNIN FATAL ERROR: Payload STILL contains undefined values BEFORE signing!", payload);
            return res.status(500).json({ message: "Server error preparing authentication (Payload Undefined)." });
        }

        // --- Token Signing ---
        let token;
        try {
            console.log("<<<<< SIGNIN: Attempting jwt.sign >>>>>");
            token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '1h' });
            console.log("<<<<< SIGNIN: jwt.sign successful. >>>>>");
        } catch (signError) {
            console.error("<<<<< SIGNIN FATAL ERROR DURING JWT.SIGN >>>>>", signError);
            return res.status(500).json({ message: "Server error creating session." });
        }

        // --- Sending Response ---
        // Use the correct property names from the 'user' object
        console.log("<<<<< SIGNIN: Sending response >>>>>");
        res.status(200).json({
            token: token,
            role: user.foolu_role,               // Use DB result property
            username: user.foolu_username,       // Use DB result property
            profilePictureUrl: user.profile_picture_url || null // Use DB result property
        });
    });
});

module.exports = router;