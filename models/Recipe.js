const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
  item: { type: String, required: true },
  quantity: { type: String, required: true },
});

const recipeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  short_description: { type: String },
  ingredients: [ingredientSchema], // Nested schema for ingredients
  instructions: { type: [String], required: true },
  why_this_recipe_is_sustainable: { type: [String] }, // Array of strings for sustainability info
  sustainability_ratings: {
    water_usage: { type: Number, min: 0, max: 5 },
    energy_impact: { type: Number, min: 0, max: 5 },
    waste_consideration: { type: Number, min: 0, max: 5 },
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // This creates the reference to the User model
  },  

});

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;