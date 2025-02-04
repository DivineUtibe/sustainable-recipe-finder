const express = require('express');
const Note = require('../models/Note');  // Import Note model
const authenticate = require('../middleware/authenticate');

const router = express.Router();

/* ======= NOTES FUNCTIONALITY ======= */

// Add a Note (secure route)
router.post('/', authenticate, async (req, res) => {
  try {
    const { note } = req.body;
    const userId = req.user.userId;

    const newNote = new Note({ userId, note });
    await newNote.save();

    res.status(201).json({ message: 'Note added successfully!', newNote });
  } catch (error) {
    res.status(500).json({ message: 'Error adding note', error: error.message });
  }
});

// Update a Note (secure route)
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const { note } = req.body;
    const noteId = req.params.id;
    const userId = req.user.userId;

    const existingNote = await Note.findOne({ _id: noteId, userId });

    if (!existingNote) {
      return res.status(404).json({ message: 'Note not found' });
    }

    existingNote.note = note;
    await existingNote.save();

    res.json({ message: 'Note updated successfully', existingNote });
  } catch (error) {
    res.status(500).json({ message: 'Error updating note', error: error.message });
  }
});

// Get All Notes for a User (secure route)
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;

    const notes = await Note.find({ userId });

    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notes', error: error.message });
  }
});

// Delete a Note (secure route)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const noteId = req.params.id;
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