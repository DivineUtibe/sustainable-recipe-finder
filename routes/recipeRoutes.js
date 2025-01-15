// routes/recipeRoutes.js
const express = require('express');
const mongoose = require('mongoose');
const Recipe = require('../models/Recipe'); // Import Recipe model
const authenticate = require('../middleware/authenticate'); // Import the authentication middleware

const router = express.Router();

// Get all recipes (Public route)
router.get('/', async (req, res) => {
  try {
    const recipes = await Recipe.find();
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching recipes', error: err.message });
  }
});

// Get recipe by ID (Public route)
router.get('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching recipe', error: err.message });
  }
});

// Get all recipes submitted by the authenticated user
router.post('/submittedby', authenticate, async (req, res) => {
  try {
    // Extract userId from JWT token
    let userId = req.user && req.user.userId;

    // Optionally, allow overriding the userId via the request body for testing (not recommended in production)
    if (!userId && req.body.userId) {
      userId = req.body.userId;
    }

    console.log('User ID for Recipe Fetch:', userId); // Debug log

    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log('Invalid userId:', userId); // Log invalid userId
      return res.status(400).json({ message: 'Invalid User ID' });
    }

    // Convert userId to ObjectId
    const validUserId = new mongoose.Types.ObjectId(userId); // Use 'new' here to avoid the TypeError
    console.log('Converted User ID (ObjectId):', validUserId);

    // Query recipes submitted by the user
    const submittedRecipes = await Recipe.find({ submittedBy: validUserId });

    // Handle no recipes found
    if (submittedRecipes.length === 0) {
      return res.status(404).json({ message: 'No submitted recipes found' });
    }

    // Return the recipes
    res.json(submittedRecipes);
  } catch (err) {
    console.error('Error during recipe fetch:', err); // Log error for debugging
    res.status(500).json({ message: 'Error fetching submitted recipes', error: err.message });
  }
});

// Add a new recipe (Protected route)
router.post('/', authenticate, async (req, res) => {
  const { name, short_description, ingredients, instructions, why_this_recipe_is_sustainable, sustainability_ratings } = req.body;

  const newRecipe = new Recipe({
    name,
    short_description,
    ingredients,
    instructions,
    why_this_recipe_is_sustainable,
    sustainability_ratings,
    submittedBy: req.user.userId, // Link recipe to the logged-in user
  });

  try {
    await newRecipe.save();
    res.status(201).json({ message: 'Recipe created successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error saving recipe', error: err.message });
  }
});

// Update Recipe by ID (Protected route)
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    // Ensure the user updating the recipe is the one who created it
    if (!recipe || recipe.submittedBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You are not authorized to update this recipe' });
    }

    const updatedRecipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedRecipe);
  } catch (err) {
    res.status(500).json({ message: 'Error updating recipe', error: err.message });
  }
});

// Delete Recipe by ID (Protected route)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    // Ensure the user deleting the recipe is the one who created it
    if (!recipe || recipe.submittedBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You are not authorized to delete this recipe' });
    }

    await Recipe.findByIdAndDelete(req.params.id);
    res.json({ message: 'Recipe deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting recipe', error: err.message });
  }
});

module.exports = router;