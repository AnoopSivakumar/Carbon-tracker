const pool = require('../db/pool');

// Module 3: Rewards & Reports (Admin) + user-facing reward view

async function myRewards(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT r.*, a.activity_date, c.title AS campaign_title
       FROM rewards r
       LEFT JOIN activities a ON a.id = r.activity_id
       LEFT JOIN campaigns c ON c.id = r.campaign_id
       WHERE r.user_id = $1 ORDER BY r.created_at DESC`,
      [req.user.id]
    );
    const approvedTotal = rows.filter(r => r.status === 'approved')
      .reduce((sum, r) => sum + Number(r.points), 0);
    res.json({ rewards: rows, total_approved_points: approvedTotal });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load rewards.' });
  }
}

// Pending rewards queue for Admin approval
async function pendingRewards(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT r.*, u.name AS user_name, u.email AS user_email, a.activity_date
       FROM rewards r
       JOIN users u ON u.id = r.user_id
       LEFT JOIN activities a ON a.id = r.activity_id
       WHERE r.status = 'pending' ORDER BY r.created_at ASC`
    );
    res.json({ rewards: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load pending rewards.' });
  }
}

// Approve/Reject Reward Points (Admin)
async function decideReward(req, res) {
  try {
    const { decision } = req.body; // 'approved' | 'rejected'
    if (!['approved', 'rejected'].includes(decision)) {
      return res.status(400).json({ message: "Decision must be 'approved' or 'rejected'." });
    }

    const { rows } = await pool.query(
      `UPDATE rewards SET status = $1, approved_by = $2, decided_at = NOW()
       WHERE id = $3 AND status = 'pending' RETURNING *`,
      [decision, req.user.id, req.params.id]
    );

    if (!rows.length) {
      return res.status(409).json({ message: 'Reward not found or already decided.' });
    }
    res.json({ reward: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update reward.' });
  }
}

// User Leaderboard Summary - approved points ranking
async function leaderboard(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT u.id, u.name, COALESCE(SUM(r.points), 0) AS total_points,
              COUNT(r.id) FILTER (WHERE r.status = 'approved') AS approved_rewards
       FROM users u
       LEFT JOIN rewards r ON r.user_id = u.id AND r.status = 'approved'
       WHERE u.role = 'user'
       GROUP BY u.id, u.name
       ORDER BY total_points DESC
       LIMIT 20`
    );
    res.json({ leaderboard: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load leaderboard.' });
  }
}

module.exports = { myRewards, pendingRewards, decideReward, leaderboard };
