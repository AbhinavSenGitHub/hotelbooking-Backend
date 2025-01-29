const passport = require('passport');
const jwt = require('jsonwebtoken');

const mixedAuth = (req, res, next) => {
    // Check for session-based authentication (Google OAuth)
    if (req.isAuthenticated && req.isAuthenticated()) {
        return next(); // Session-based user authenticated
    }

    
    // Check for JWT-based authentication
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err) {
            return res.status(401).json({ message: 'Authentication error', error: err.message });
        }
        if (!user) {
            return res.status(401).json({ message: 'Unauthenticated: Token or session required' });
        }
        req.user = user; // Attach user data to req.user
        next();
    })(req, res, next); 
};

module.exports = mixedAuth;
