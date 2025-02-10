const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recipeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', required: true }, // Link note to a recipe
    content: { type: String, required: true }
  },
  { timestamps: true }
);

const Note = mongoose.model('Note', noteSchema);
module.exports = Note;