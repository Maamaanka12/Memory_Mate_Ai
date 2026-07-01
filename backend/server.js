require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const { getPool } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Routes
const authRoutes      = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const notesRoutes     = require('./routes/notes');
const quizRoutes      = require('./routes/quiz');
const reportsRoutes   = require('./routes/reports');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ───────────────────────────────────────────────
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically (protected in production)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Routes ───────────────────────────────────────────────────
app.use('/auth',      authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/notes',     notesRoutes);
app.use('/quiz',      quizRoutes);
app.use('/reports',   reportsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', app: 'MemoryMate AI', timestamp: new Date() });
});

// ── Error Handler ────────────────────────────────────────────
app.use(errorHandler);

// ── Start ────────────────────────────────────────────────────
const start = async () => {
  try {
    await getPool(); // Test DB connection on boot
    app.listen(PORT, () => {
      console.log(`[Server] MemoryMate AI running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('[Server] Failed to start:', err.message);
    process.exit(1);
  }
};

start();
