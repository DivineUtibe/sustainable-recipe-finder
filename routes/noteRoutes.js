const express = require('express');
const Note = require('../models/Note');  // Import Note model
const authenticate = require('../middleware/authenticate');

const router = express.Router();

/* ======= NOTES FUNCTIONALITY ======= */

// Add a Note to a Recipe (secure route)
router.post('/:recipeId/notes', authenticate, async (req, res) => {
  try {
    const { recipeId } = req.params;  // Get recipeId from URL params
    const { content } = req.body;
    const userId = req.user.userId;

    if (!content) {
      return res.status(400).json({ message: 'Note content is required' });
    }

    const newNote = new Note({ userId, recipeId, content });
    await newNote.save();

    res.status(201).json({ message: 'Note added successfully!', newNote });
  } catch (error) {
    res.status(500).json({ message: 'Error adding note', error: error.message });
  }
});

// Update a Note (secure route)
router.patch('/:recipeId/notes/:id', authenticate, async (req, res) => {
  try {
    const { content } = req.body;
    const { id: noteId } = req.params;  // Get noteId from URL params
    const userId = req.user.userId;

    const existingNote = await Note.findOne({ _id: noteId, userId });

    if (!existingNote) {
      return res.status(404).json({ message: 'Note not found' });
    }

    existingNote.content = content;
    await existingNote.save();

    res.json({ message: 'Note updated successfully', existingNote });
  } catch (error) {
    res.status(500).json({ message: 'Error updating note', error: error.message });
  }
});

// Get All Notes for a Specific Recipe (secure route)
router.get('/:recipeId/notes', authenticate, async (req, res) => {
  try {
    const { recipeId } = req.params;
    const userId = req.user.userId;

    const notes = await Note.find({ userId, recipeId });

    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notes', error: error.message });
  }
});

// Delete a Note (secure route)
router.delete('/:recipeId/notes/:id', authenticate, async (req, res) => {
  try {
    const { id: noteId } = req.params;
    const { recipeId } = req.params;  // You could use this to double-check the recipeId if needed
    const userId = req.user.userId;

    const deletedNote = await Note.findOneAndDelete({ _id: noteId, userId });

    if (!deletedNote) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting note', error: error.message });
  }
});

module.exports = router;