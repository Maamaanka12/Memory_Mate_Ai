const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getReports } = require('../controllers/reportsController');

// GET /reports
router.get('/', authMiddleware, getReports);

module.exports = router;
