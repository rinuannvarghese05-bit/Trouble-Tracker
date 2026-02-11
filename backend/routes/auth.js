import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt'; // 👈 Import Bcrypt for password comparison
import User from '../models/User.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

// @route POST /api/auth/login
// @desc Authenticate user & get JWT token
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    
    // 1. Check if user exists
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // 2. 🚀 CRITICAL FIX: Use bcrypt.compare to verify the password 🚀
    // It compares the plaintext password with the stored hash (user.password).
    // WARNING: For security, the model field should be renamed to 'passwordHash'.
    const isMatch = await bcrypt.compare(password, user.password); 

    if (!isMatch) {
        // Log a generic message for security
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Payload uses _id and role
    const payload = { user: { _id: user._id, role: user.role } };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    // Send necessary user info in the response
    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        category: user.category, 
      },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;