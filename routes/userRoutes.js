require('dotenv').config(); // Load environment variables

const express = require('express');
const User = require('../models/User'); // Import User model
const bcrypt = require('bcryptjs'); // To hash passwords
const jwt = require('jsonwebtoken'); // To generate authentication tokens
const authenticate = require('../middleware/authenticate'); // Import authentication middleware

const router = express.Router();

// Register route
router.post('/register', async (req, res) => {
  const { name, email, password, termsAgreed } = req.body;

  if (!termsAgreed) {
    return res.status(400).json({ message: 'You must agree to the terms and conditions' });
  }

  try {
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({ name, email, password: hashedPassword, termsAgreed });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error registering user', error: err.message });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token using the JWT_SECRET from environment variables
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    res.cookie('accessToken', token, { httpOnly: true }); // Set token as a cookie

    res.json({ message: 'Login successful', token });
  } catch (err) {
    res.status(500).json({ message: 'Error logging in', error: err.message });
  }
});

// Get all users (for development/debugging only; remove in production)
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Exclude passwords
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users', error: err.message });
  }
});

// Get user profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId; // Extract userId from req.user
    console.log('User ID from Token:', userId); // Debug log

    const user = await User.findById(userId)
      .select('-password') // Exclude password
      .populate('favorites', 'name short_description'); // Populate favorites

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Profile fetched successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        favorites: user.favorites,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching profile', error: err.message });
  }
});

// Logout route (clears the token cookie)
router.post('/logout', authenticate, (req, res) => {
  try {
    console.log('User Logged Out:', req.user.userId); // Log the user logging out
    res.clearCookie('accessToken'); // Clear the token cookie
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Error during logout:', err);
    res.status(500).json({ message: 'Error during logout', error: err.message });
  }
});


module.exports = router;