const pool = require('../db/pool');

// Module 3: Reports (Admin) - analytical dashboard data

// Community-wide carbon trend, daily, last 30 days
async function carbonFootprintReport(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT activity_date, ROUND(SUM(carbon_score)::numeric, 2) AS total_carbon_kg,
              COUNT(DISTINCT user_id) AS active_users
       FROM activities
       WHERE status = 'verified' AND activity_date >= CURRENT_DATE - INTERVAL '30 days'
       GROUP BY activity_date ORDER BY activity_date ASC`
    );
    res.json({ trend: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load carbon report.' });
  }
}

// Monthly Community Impact Report
async function monthlyImpactReport(req, res) {
  try {
    const { rows } = await pool.query(
    `SELECT to_char(activity_date, 'YYYY-MM') AS month,
            ROUND(SUM(carbon_score)::numeric, 2) AS total_carbon_kg,
            COUNT(DISTINCT user_id) AS active_users,
            COUNT(*) AS verified_activities
     FROM activities
     WHERE status = 'verified'
     GROUP BY month ORDER BY month DESC LIMIT 12`
    );

    const rewardsRes = await pool.query(
    `SELECT to_char(COALESCE(decided_at, created_at), 'YYYY-MM') AS month, SUM(points) AS points_awarded
     FROM rewards WHERE status = 'approved'
     GROUP BY month ORDER BY month DESC LIMIT 12`
    );

    res.json({ carbon_by_month: rows, points_by_month: rewardsRes.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load monthly impact report.' });
  }
}

// High-level dashboard summary counts for Admin landing page
async function dashboardSummary(req, res) {
  try {
    const [users, pendingActivities, pendingRewards, totalCarbon, activeCampaigns] = await Promise.all([
    pool.query(`SELECT COUNT(*)::int AS count FROM users WHERE role = 'user'`),
    pool.query(`SELECT COUNT(*)::int AS count FROM activities WHERE status = 'pending'`),
    pool.query(`SELECT COUNT(*)::int AS count FROM rewards WHERE status = 'pending'`),
    pool.query(`SELECT COALESCE(ROUND(SUM(carbon_score)::numeric, 2), 0) AS total FROM activities WHERE status = 'verified'`),
    pool.query(`SELECT COUNT(*)::int AS count FROM campaigns WHERE is_active = TRUE AND CURRENT_DATE BETWEEN start_date AND end_date`)
    ]);

    res.json({
    total_users: users.rows[0].count,
    pending_activity_reviews: pendingActivities.rows[0].count,
    pending_reward_approvals: pendingRewards.rows[0].count,
    total_verified_carbon_kg: totalCarbon.rows[0].total,
    active_campaigns: activeCampaigns.rows[0].count
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load dashboard summary.' });
  }
}

module.exports = { carbonFootprintReport, monthlyImpactReport, dashboardSummary };
