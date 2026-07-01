const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');
const { uploadNote, getNotes, getNoteById, deleteNote } = require('../controllers/notesController');

// POST /notes/upload
router.post('/upload', authMiddleware, upload.single('file'), uploadNote);

// GET /notes
router.get('/', authMiddleware, getNotes);

// GET /notes/:id
router.get('/:id', authMiddleware, getNoteById);

// DELETE /notes/:id
router.delete('/:id', authMiddleware, deleteNote);

module.exports = router;
