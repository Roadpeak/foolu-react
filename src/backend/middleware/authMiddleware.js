// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.status(401).json({ message: 'Authentication token required' });
    }

    // Verify using the correct SECRET_KEY from your .env file
    if (!process.env.SECRET_KEY) {
        console.error("FATAL ERROR (Middleware): SECRET_KEY environment variable not set.");
        return res.status(500).json({ message: "Server configuration error." });
    }

    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
            console.error("JWT Verification Error:", err.message); // Log specific verify error
            // Common errors: TokenExpiredError, JsonWebTokenError (invalid signature)
            let message = 'Invalid or expired token';
            if (err.name === 'TokenExpiredError') {
                message = 'Authentication token has expired. Please sign in again.';
            } else if (err.name === 'JsonWebTokenError') {
                 message = 'Invalid authentication token.';
            }
            return res.status(403).json({ message: message }); // Use 403 Forbidden for invalid/expired token
        }

        console.log("Decoded JWT Payload in middleware:", decoded);

        // --- CORRECTED PROPERTY ACCESS ---
        // Access properties from 'decoded' using the keys defined
        // in the payload during jwt.sign (which are userId, email, role)
        req.user = {
            userId: decoded.userId,  // <<< Access decoded.userId
            role: decoded.role,      // <<< Access decoded.role
            email: decoded.email     // <<< Access decoded.email
         };
         // --- END CORRECTION ---

         // Add a check to ensure userId was actually decoded
         if(typeof req.user.userId === 'undefined') {
             console.error("Middleware Error: userId is undefined in decoded token payload!", decoded);
             return res.status(403).json({ message: "Invalid token payload: User identifier missing." });
         }

         console.log("Authenticated User attached to req.user:", req.user);
         next(); // Proceed to the next middleware or route handler
    });
};

module.exports = authenticateToken;