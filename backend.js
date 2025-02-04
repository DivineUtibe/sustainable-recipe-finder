require('dotenv').config(); // Load environment variables
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Initialize Express App
const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(cors({origin:'*'}));

// Determine MongoDB URI based on environment
const mongoURI = process.env.NODE_ENV === 'test' 
    ? process.env.TEST_MONGO_URI 
    : process.env.MONGO_URI;

// MongoDB Connection
mongoose.connect(mongoURI)
  .then(() => {
    console.log(`MongoDB connected to ${process.env.NODE_ENV === 'test' ? 'test' : 'main'} database`);
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit the application on connection failure
  });

// Import Routes
const userRoutes = require('./routes/userRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const noteRoutes = require('./routes/noteRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');

// Use Routes
app.use('/api/users', userRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/favorites', favoriteRoutes);

// Test Route
app.get('/', (req, res) => {
  res.send('Sustainable Recipe Finder Backend');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});