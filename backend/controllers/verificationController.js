const pool = require('../db/pool');
const { computeRewardPoints } = require('../utils/carbonCalculator');

// Verify/Reject Activity (Employee) - Module 2
async function decideActivity(req, res) {
  const client = await pool.connect();
  try {
    const activityId = req.params.activityId;
    const { decision, remarks } = req.body; // 'verified' | 'rejected'

    if (!['verified', 'rejected'].includes(decision)) {
      return res.status(400).json({ message: "Decision must be 'verified' or 'rejected'." });
    }

    await client.query('BEGIN');

    const activityRes = await client.query('SELECT * FROM activities WHERE id = $1 FOR UPDATE', [activityId]);
    const activity = activityRes.rows[0];
    if (!activity) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Activity not found.' });
    }
    if (activity.status !== 'pending') {
      await client.query('ROLLBACK');
      return res.status(409).json({ message: 'This activity has already been reviewed.' });
    }

    await client.query('UPDATE activities SET status = $1 WHERE id = $2', [decision, activityId]);

    await client.query(
      `INSERT INTO verifications (activity_id, verifier_id, decision, remarks)
       VALUES ($1, $2, $3, $4)`,
      [activityId, req.user.id, decision, remarks || null]
    );

    // If verified, generate a pending reward for admin approval.
    if (decision === 'verified') {
      const campaignRes = await client.query(
        `SELECT * FROM campaigns WHERE is_active = TRUE AND CURRENT_DATE BETWEEN start_date AND end_date
         ORDER BY points_multiplier DESC LIMIT 1`
      );
      const campaign = campaignRes.rows[0];
      const multiplier = campaign ? campaign.points_multiplier : 1;
      const points = computeRewardPoints(activity, multiplier);

      await client.query(
        `INSERT INTO rewards (user_id, activity_id, campaign_id, points, status)
         VALUES ($1, $2, $3, $4, 'pending')`,
        [activity.user_id, activityId, campaign ? campaign.id : null, points]
      );
    }

    await client.query('COMMIT');
    res.json({ message: `Activity ${decision}.` });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ message: 'Failed to record verification decision.' });
  } finally {
    client.release();
  }
}

async function verificationsForActivity(req, res) {
  try {
    const params = [req.params.activityId];
    let query = `SELECT v.*, u.name AS verifier_name FROM verifications v
      JOIN users u ON u.id = v.verifier_id
      JOIN activities a ON a.id = v.activity_id
      WHERE v.activity_id = $1`;
    if (req.user.role === 'user') {
      params.push(req.user.id);
      query += ' AND a.user_id = $2';
    }
    query += ' ORDER BY v.verified_at DESC';
    const { rows } = await pool.query(query, params);
    res.json({ verifications: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load verification history.' });
  }
}

module.exports = { decideActivity, verificationsForActivity };
