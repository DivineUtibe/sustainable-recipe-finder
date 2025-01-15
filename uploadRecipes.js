require('dotenv').config(); // Load environment variables
const mongoose = require('mongoose');
const Recipe = require('./models/Recipe'); // Import Recipe model
const recipesData = require('./recipe.json'); // Import recipes from recipe.json

const recipes = recipesData.recipes; // Reference the "recipes" array from the json data

// Set 'admin' or 'creator' as the value for submittedBy
const submittedBy = 'creator'; 

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    for (let recipe of recipes) {
      try {
        // Assign the 'submittedBy' field to 'creator'
        recipe.submittedBy = submittedBy;

        // Create and save the recipe in the database
        const newRecipe = new Recipe(recipe);
        await newRecipe.save();
        console.log(`Recipe "${recipe.name}" uploaded successfully!`);
      } catch (err) {
        console.log('Error uploading recipe:', err);
      }
    }

    // Close the MongoDB connection after uploading all recipes
    mongoose.disconnect();
    console.log('All recipes uploaded successfully!');
  })
  .catch(err => console.log('Error connecting to MongoDB:', err));
