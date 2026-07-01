const { sql, getPool } = require('../config/db');
const quizGeneratorService = require('../services/quiz_generator/quizGeneratorService');
const pdfService = require('../services/pdfService');

// POST /quiz/generate
const generateQuiz = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { note_id, title, topic, quiz_type = 'mixed', num_questions = 5 } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Quiz title is required.' });
    }

    const pool = await getPool();

    // Fetch extracted text from note if note_id provided
    let sourceText = null;
    if (note_id) {
      const noteResult = await pool.request()
        .input('id',      sql.Int, note_id)
        .input('user_id', sql.Int, userId)
        .query('SELECT extracted_text FROM notes WHERE id = @id AND user_id = @user_id');

      if (noteResult.recordset.length === 0) {
        return res.status(404).json({ success: false, message: 'Note not found.' });
      }
      sourceText = noteResult.recordset[0].extracted_text;
    }

    // Placeholder question generation — replaced by OpenAI/Cognee later
    const questions = await quizGeneratorService.generate({ sourceText, quiz_type, num_questions, topic });

    // Insert quiz
    const quizResult = await pool.request()
      .input('user_id',         sql.Int,      userId)
      .input('note_id',         sql.Int,      note_id || null)
      .input('title',           sql.NVarChar, title)
      .input('topic',           sql.NVarChar, topic || null)
      .input('quiz_type',       sql.NVarChar, quiz_type)
      .input('total_questions', sql.Int,      questions.length)
      .query(`
        INSERT INTO quizzes (user_id, note_id, title, topic, quiz_type, total_questions)
        OUTPUT INSERTED.*
        VALUES (@user_id, @note_id, @title, @topic, @quiz_type, @total_questions)
      `);

    const quiz = quizResult.recordset[0];

    // Insert questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      await pool.request()
        .input('quiz_id',       sql.Int,      quiz.id)
        .input('question_text', sql.NVarChar, q.question_text)
        .input('question_type', sql.NVarChar, q.question_type)
        .input('options',       sql.NVarChar, q.options ? JSON.stringify(q.options) : null)
        .input('correct_answer',sql.NVarChar, q.correct_answer)
        .input('explanation',   sql.NVarChar, q.explanation || null)
        .input('order_index',   sql.Int,      i)
        .query(`
          INSERT INTO quiz_questions (quiz_id, question_text, question_type, options, correct_answer, explanation, order_index)
          VALUES (@quiz_id, @question_text, @question_type, @options, @correct_answer, @explanation, @order_index)
        `);
    }

    res.status(201).json({ success: true, message: 'Quiz generated.', data: { quiz, questions } });
  } catch (err) {
    next(err);
  }
};

// POST /quiz/submit
const submitQuiz = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { quiz_id, answers, time_taken_seconds } = req.body;
    // answers: [{ question_id, user_answer }]

    if (!quiz_id || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: 'quiz_id and answers array required.' });
    }

    const pool = await getPool();

    // Verify quiz ownership
    const quizResult = await pool.request()
      .input('quiz_id', sql.Int, quiz_id)
      .input('user_id', sql.Int, userId)
      .query('SELECT * FROM quizzes WHERE id = @quiz_id AND user_id = @user_id');

    if (quizResult.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Quiz not found.' });
    }

    // Fetch correct answers
    const questionsResult = await pool.request()
      .input('quiz_id', sql.Int, quiz_id)
      .query('SELECT id, correct_answer FROM quiz_questions WHERE quiz_id = @quiz_id');

    const correctMap = {};
    questionsResult.recordset.forEach(q => { correctMap[q.id] = q.correct_answer; });

    let correct = 0;
    const answerRecords = [];

    for (const ans of answers) {
      const isCorrect = correctMap[ans.question_id]?.toLowerCase().trim() === ans.user_answer?.toLowerCase().trim();
      if (isCorrect) correct++;

      answerRecords.push({
        quiz_id,
        user_id: userId,
        question_id: ans.question_id,
        user_answer: ans.user_answer,
        is_correct: isCorrect ? 1 : 0,
        score: isCorrect ? (100 / answers.length) : 0,
      });
    }

    // Insert answers
    for (const a of answerRecords) {
      await pool.request()
        .input('quiz_id',     sql.Int,      a.quiz_id)
        .input('user_id',     sql.Int,      a.user_id)
        .input('question_id', sql.Int,      a.question_id)
        .input('user_answer', sql.NVarChar, a.user_answer)
        .input('is_correct',  sql.Bit,      a.is_correct)
        .input('score',       sql.Decimal,  a.score)
        .query(`
          INSERT INTO quiz_answers (quiz_id, user_id, question_id, user_answer, is_correct, score)
          VALUES (@quiz_id, @user_id, @question_id, @user_answer, @is_correct, @score)
        `);
    }

    const scorePercentage = (correct / answers.length) * 100;
    const quiz = quizResult.recordset[0];

    // Update quiz status
    await pool.request()
      .input('quiz_id', sql.Int, quiz_id)
      .query("UPDATE quizzes SET status = 'completed' WHERE id = @quiz_id");

    // Save report
    await pool.request()
      .input('user_id',           sql.Int,     userId)
      .input('quiz_id',           sql.Int,     quiz_id)
      .input('total_questions',   sql.Int,     answers.length)
      .input('correct_answers',   sql.Int,     correct)
      .input('wrong_answers',     sql.Int,     answers.length - correct)
      .input('score_percentage',  sql.Decimal, scorePercentage)
      .input('topic',             sql.NVarChar,quiz.topic || null)
      .input('time_taken_seconds',sql.Int,     time_taken_seconds || null)
      .query(`
        INSERT INTO reports (user_id, quiz_id, total_questions, correct_answers, wrong_answers, score_percentage, topic, time_taken_seconds)
        VALUES (@user_id, @quiz_id, @total_questions, @correct_answers, @wrong_answers, @score_percentage, @topic, @time_taken_seconds)
      `);

    res.status(200).json({
      success: true,
      message: 'Quiz submitted.',
      data: {
        score_percentage: scorePercentage,
        correct,
        wrong: answers.length - correct,
        total: answers.length,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /quiz/history
const getQuizHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const pool = await getPool();

    const result = await pool.request()
      .input('user_id', sql.Int, userId)
      .query(`
        SELECT q.id, q.title, q.topic, q.quiz_type, q.total_questions, q.status, q.created_at,
               r.score_percentage, r.completed_at
        FROM quizzes q
        LEFT JOIN reports r ON r.quiz_id = q.id AND r.user_id = @user_id
        WHERE q.user_id = @user_id
        ORDER BY q.created_at DESC
      `);

    res.status(200).json({ success: true, data: result.recordset });
  } catch (err) {
    next(err);
  }
};

// GET /quiz/:id
const getQuizById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const quizId = parseInt(req.params.id);
    const pool = await getPool();

    const quizResult = await pool.request()
      .input('quiz_id', sql.Int, quizId)
      .input('user_id', sql.Int, userId)
      .query('SELECT * FROM quizzes WHERE id = @quiz_id AND user_id = @user_id');

    if (quizResult.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Quiz not found.' });
    }

    const questionsResult = await pool.request()
      .input('quiz_id', sql.Int, quizId)
      .query('SELECT * FROM quiz_questions WHERE quiz_id = @quiz_id ORDER BY order_index');

    const answersResult = await pool.request()
      .input('quiz_id', sql.Int, quizId)
      .input('user_id', sql.Int, userId)
      .query('SELECT * FROM quiz_answers WHERE quiz_id = @quiz_id AND user_id = @user_id');

    const questions = questionsResult.recordset.map(q => ({
      ...q,
      options: q.options ? JSON.parse(q.options) : null,
    }));

    res.status(200).json({
      success: true,
      data: {
        quiz: quizResult.recordset[0],
        questions,
        answers: answersResult.recordset,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /quiz/export/:quizId
const exportQuizPDF = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const quizId = parseInt(req.params.quizId);
    const pool = await getPool();

    const quizResult = await pool.request()
      .input('quiz_id', sql.Int, quizId)
      .input('user_id', sql.Int, userId)
      .query('SELECT * FROM quizzes WHERE id = @quiz_id AND user_id = @user_id');

    if (quizResult.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Quiz not found.' });
    }

    const questionsResult = await pool.request()
      .input('quiz_id', sql.Int, quizId)
      .query('SELECT * FROM quiz_questions WHERE quiz_id = @quiz_id ORDER BY order_index');

    const answersResult = await pool.request()
      .input('quiz_id', sql.Int, quizId)
      .input('user_id', sql.Int, userId)
      .query('SELECT * FROM quiz_answers WHERE quiz_id = @quiz_id AND user_id = @user_id');

    const reportResult = await pool.request()
      .input('quiz_id', sql.Int, quizId)
      .input('user_id', sql.Int, userId)
      .query('SELECT * FROM reports WHERE quiz_id = @quiz_id AND user_id = @user_id');

    const answerMap = {};
    answersResult.recordset.forEach(a => { answerMap[a.question_id] = a; });

    const payload = {
      quiz: quizResult.recordset[0],
      questions: questionsResult.recordset.map(q => ({
        ...q,
        options: q.options ? JSON.parse(q.options) : null,
        user_answer: answerMap[q.id]?.user_answer || 'Not answered',
        is_correct: answerMap[q.id]?.is_correct ?? false,
      })),
      report: reportResult.recordset[0] || null,
      user: req.user,
    };

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="quiz-${quizId}-report.pdf"`);

    await pdfService.generateQuizPDF(payload, res);
  } catch (err) {
    next(err);
  }
};

module.exports = { generateQuiz, submitQuiz, getQuizHistory, getQuizById, exportQuizPDF };
