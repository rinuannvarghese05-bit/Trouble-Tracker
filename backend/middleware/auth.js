// middleware/auth.js
import jwt from 'jsonwebtoken';

// Use the same secret key as your login route
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key'; 

const auth = (req, res, next) => {
    // 1. Get token from the header 
    // The convention is to send the token in the 'Authorization' header as: 'Bearer <token>'
    const token = req.header('Authorization')?.replace('Bearer ', ''); 
    
    if (!token) {
        // 401: Unauthorized - User is not logged in 
        return res.status(401).json({ message: 'No token, authorization denied.' });
    }

    try {
        // 2. Verify the token
        // This checks the signature and if the token is expired.
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // 3. Attach the decoded user payload to the request object (req.user)
        // Now every protected route can access req.user._id and req.user.role
        req.user = decoded.user;
        
        // 4. Continue to the next middleware or the route handler
        next(); 
        
    } catch (error) {
        // If verification fails (e.g., wrong secret, expired token)
        // 403: Forbidden - Authentication failed
        res.status(403).json({ message: 'Token is not valid.' });
    }
};

export default auth;