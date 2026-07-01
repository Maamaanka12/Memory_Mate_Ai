const { sql, getPool } = require('../config/db');

// GET /dashboard
const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const pool = await getPool();

    const result = await pool.request()
      .input('user_id', sql.Int, userId)
      .query(`
        SELECT
          user_id,
          notes_uploaded,
          quizzes_completed,
          ISNULL(avg_score, 0)       AS avg_score,
          ISNULL(strongest_topic, 'N/A') AS strongest_topic,
          ISNULL(weakest_topic, 'N/A')   AS weakest_topic
        FROM vw_user_dashboard_stats
        WHERE user_id = @user_id
      `);

    const stats = result.recordset[0] || {
      user_id: userId,
      notes_uploaded: 0,
      quizzes_completed: 0,
      avg_score: 0,
      strongest_topic: 'N/A',
      weakest_topic: 'N/A',
    };

    res.status(200).json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboard };
