const { sql, getPool } = require('../config/db');

// GET /reports
const getReports = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const pool = await getPool();

    // Score progression
    const progressionResult = await pool.request()
      .input('user_id', sql.Int, userId)
      .query(`
        SELECT quiz_id, quiz_title, topic, score_percentage, completed_at
        FROM vw_score_progression
        WHERE user_id = @user_id
        ORDER BY completed_at ASC
      `);

    // Topic breakdown
    const topicResult = await pool.request()
      .input('user_id', sql.Int, userId)
      .query(`
        SELECT topic,
               COUNT(*)              AS attempts,
               AVG(score_percentage) AS avg_score,
               MAX(score_percentage) AS best_score
        FROM reports
        WHERE user_id = @user_id AND topic IS NOT NULL
        GROUP BY topic
        ORDER BY avg_score DESC
      `);

    // Quiz history
    const historyResult = await pool.request()
      .input('user_id', sql.Int, userId)
      .query(`
        SELECT r.id, r.quiz_id, q.title, r.topic,
               r.total_questions, r.correct_answers, r.wrong_answers,
               r.score_percentage, r.time_taken_seconds, r.completed_at
        FROM reports r
        JOIN quizzes q ON q.id = r.quiz_id
        WHERE r.user_id = @user_id
        ORDER BY r.completed_at DESC
      `);

    res.status(200).json({
      success: true,
      data: {
        progression: progressionResult.recordset,
        topics: topicResult.recordset,
        history: historyResult.recordset,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getReports };
