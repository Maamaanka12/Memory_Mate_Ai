const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  generateQuiz,
  submitQuiz,
  getQuizHistory,
  getQuizById,
  exportQuizPDF,
} = require('../controllers/quizController');

// POST /quiz/generate
router.post('/generate', authMiddleware, generateQuiz);

// POST /quiz/submit
router.post('/submit', authMiddleware, submitQuiz);

// GET /quiz/history
router.get('/history', authMiddleware, getQuizHistory);

// GET /quiz/export/:quizId  — must be before /:id
router.get('/export/:quizId', authMiddleware, exportQuizPDF);

// GET /quiz/:id
router.get('/:id', authMiddleware, getQuizById);

module.exports = router;
