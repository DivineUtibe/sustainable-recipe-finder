const express = require('express');
const User = require('../models/User');  // Import User model
const Recipe = require('../models/Recipe');  // Import Recipe model
const authenticate = require('../middleware/authenticate');  // Import authentication middleware

const router = express.Router();

// Add a recipe to favorites (secure route)
router.post('/add', authenticate, async (req, res) => {
  const { name } = req.body;  // Use 'name' for recipe name
  const userId = req.user.userId;  // Get userId from token (from authMiddleware)

  console.log('User ID from Token:', userId);  // Log user ID to verify

  try {
    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find the recipe by name
    const recipe = await Recipe.findOne({ name });
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Add the recipe's ObjectId to the user's favorites if not already added
    if (!user.favorites.includes(recipe._id.toString())) {
      user.favorites.push(recipe._id);  // Store ObjectId in favorites array
      await user.save();
      res.json({ message: 'Recipe added to favorites' });
    } else {
      res.status(400).json({ message: 'Recipe is already in favorites' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Error adding recipe to favorites', error: err.message });
  }
});

// Get all favorite recipes for a user (secure route)
router.get('/:userId', authenticate, async (req, res) => {
  const userId = req.params.userId;  // Get userId from token (from authMiddleware)

  console.log('User ID from URL:', userId);  // Log user ID to verify

  try {
    // Find the user by ID
    const user = await User.findById(userId).populate('favorites');  // Populate the favorites with full recipe data
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return the populated favorite recipes (with full recipe details)
    res.json(user.favorites);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching favorite recipes', error: err.message });
  }
});

// Remove a recipe from favorites (Protected route)
router.delete('/remove', authenticate, async (req, res) => {
  const { recipeId } = req.body; // Recipe ID to remove from favorites
  const userId = req.user.userId; // User ID from token (from authMiddleware)

  console.log('User ID from Token:', userId); // Log user ID to verify
  console.log('Recipe ID to Remove:', recipeId); // Log recipe ID to verify

  try {
    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the recipe ID exists in the user's favorites
    if (!user.favorites.includes(recipeId)) {
      return res.status(400).json({ message: 'Recipe is not in favorites' });
    }

    // Remove the recipe ID from the favorites array
    user.favorites = user.favorites.filter((id) => id.toString() !== recipeId);
    await user.save();

    res.json({ message: 'Recipe removed from favorites' });
  } catch (err) {
    res.status(500).json({ message: 'Error removing recipe from favorites', error: err.message });
  }
});

module.exports = router;