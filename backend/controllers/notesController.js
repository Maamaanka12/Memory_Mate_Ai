const path = require('path');
const { sql, getPool } = require('../config/db');
const extractionService = require('../services/summary/extractionService');
const summaryService = require('../services/summary/summaryService');

// POST /notes/upload
const uploadNote = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const userId = req.user.id;
    const { topic } = req.body;
    const { originalname, filename, path: filePath, size, mimetype } = req.file;
    const fileExt = path.extname(originalname).toLowerCase().replace('.', '');

    // Extract text from uploaded file
    const extracted_text = await extractionService.extract(filePath, fileExt);

    // Generate AI summary if text was extracted and Gemini API key is configured
    let summary = null;
    if (extracted_text && process.env.GEMINI_API_KEY) {
      try {
        summary = await summaryService.summarize(extracted_text, { topic });
      } catch (err) {
        console.error('[Notes] Summary generation failed:', err.message);
      }
    }

    const pool = await getPool();

    const result = await pool.request()
      .input('user_id',       sql.Int,       userId)
      .input('file_name',     sql.NVarChar,  originalname)
      .input('file_type',     sql.NVarChar,  fileExt)
      .input('file_size',     sql.BigInt,    size)
      .input('upload_path',   sql.NVarChar,  filePath)
      .input('extracted_text',sql.NVarChar,  extracted_text)
      .input('topic',         sql.NVarChar,  topic || null)
      .input('summary',       sql.NVarChar,  summary ? JSON.stringify(summary) : null)
      .query(`
        INSERT INTO notes (user_id, file_name, file_type, file_size, upload_path, extracted_text, topic, summary)
        OUTPUT INSERTED.*
        VALUES (@user_id, @file_name, @file_type, @file_size, @upload_path, @extracted_text, @topic, @summary)
      `);

    res.status(201).json({ success: true, message: 'Note uploaded.', data: result.recordset[0] });
  } catch (err) {
    next(err);
  }
};

// GET /notes
const getNotes = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const pool = await getPool();

    const result = await pool.request()
      .input('user_id', sql.Int, userId)
      .query(`
        SELECT id, file_name, file_type, file_size, topic, summary,
               CASE WHEN extracted_text IS NOT NULL THEN 1 ELSE 0 END AS has_text,
               created_at
        FROM notes
        WHERE user_id = @user_id
        ORDER BY created_at DESC
      `);

    res.status(200).json({ success: true, data: result.recordset });
  } catch (err) {
    next(err);
  }
};

// GET /notes/:id
const getNoteById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const noteId = parseInt(req.params.id);
    const pool = await getPool();

    const result = await pool.request()
      .input('id',      sql.Int, noteId)
      .input('user_id', sql.Int, userId)
      .query('SELECT * FROM notes WHERE id = @id AND user_id = @user_id');

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Note not found.' });
    }

    res.status(200).json({ success: true, data: result.recordset[0] });
  } catch (err) {
    next(err);
  }
};

// DELETE /notes/:id
const deleteNote = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const noteId = parseInt(req.params.id);
    const pool = await getPool();

    const existing = await pool.request()
      .input('id',      sql.Int, noteId)
      .input('user_id', sql.Int, userId)
      .query('SELECT id FROM notes WHERE id = @id AND user_id = @user_id');

    if (existing.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Note not found.' });
    }

    await pool.request()
      .input('id', sql.Int, noteId)
      .query('DELETE FROM notes WHERE id = @id');

    res.status(200).json({ success: true, message: 'Note deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { uploadNote, getNotes, getNoteById, deleteNote };
