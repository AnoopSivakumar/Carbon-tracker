const pool = require('../db/pool');
const { computeCarbonScore } = require('../utils/carbonCalculator');

const commuteModes = new Set(['car', 'bike', 'bus', 'train', 'cycle', 'walk', 'wfh']);

function parseNonNegativeNumber(value, fieldName) {
  const number = value === '' || value == null ? 0 : Number(value);
  if (!Number.isFinite(number) || number < 0) {
    throw new Error(`${fieldName} must be a non-negative number.`);
  }
  return number;
}

function validateActivityInput({ activity_date, commute_mode, commute_distance_km, electricity_kwh, water_liters, waste_segregated }) {
  if (commute_mode && !commuteModes.has(commute_mode)) {
    throw new Error('Invalid commute mode.');
  }
  if (activity_date && !/^\d{4}-\d{2}-\d{2}$/.test(activity_date)) {
    throw new Error('Activity date must use YYYY-MM-DD format.');
  }
  if (waste_segregated !== undefined && typeof waste_segregated !== 'boolean') {
    throw new Error('waste_segregated must be a boolean.');
  }
  return {
    commute_distance_km: parseNonNegativeNumber(commute_distance_km, 'commute_distance_km'),
    electricity_kwh: parseNonNegativeNumber(electricity_kwh, 'electricity_kwh'),
    water_liters: parseNonNegativeNumber(water_liters, 'water_liters'),
    waste_segregated: waste_segregated === true
  };
}

// Module 2: Activity & Verification Management

// Log Daily Activity (User)
async function logActivity(req, res) {
  try {
    const userId = req.user.id;
    const {
      activity_date, commute_mode, commute_distance_km,
      electricity_kwh, water_liters, waste_segregated, notes
    } = req.body;
    const values = validateActivityInput(req.body);

    const existing = await pool.query(
      'SELECT status FROM activities WHERE user_id = $1 AND activity_date = COALESCE($2::date, CURRENT_DATE)',
      [userId, activity_date || null]
    );
    if (existing.rows[0]?.status === 'verified') {
      return res.status(409).json({ message: 'Verified activities cannot be edited.' });
    }

    const carbon_score = await computeCarbonScore({
      commute_mode, ...values
    });

    const { rows } = await pool.query(
      `INSERT INTO activities
        (user_id, activity_date, commute_mode, commute_distance_km, electricity_kwh, water_liters, waste_segregated, notes, carbon_score)
       VALUES ($1, COALESCE($2, CURRENT_DATE), $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (user_id, activity_date)
       DO UPDATE SET
         commute_mode = EXCLUDED.commute_mode,
         commute_distance_km = EXCLUDED.commute_distance_km,
         electricity_kwh = EXCLUDED.electricity_kwh,
         water_liters = EXCLUDED.water_liters,
         waste_segregated = EXCLUDED.waste_segregated,
         notes = EXCLUDED.notes,
         carbon_score = EXCLUDED.carbon_score,
         status = 'pending'
       RETURNING *`,
      [userId, activity_date || null, commute_mode, values.commute_distance_km,
       values.electricity_kwh, values.water_liters, values.waste_segregated, notes || null, carbon_score]
    );

    res.status(201).json({ activity: rows[0] });
  } catch (err) {
    console.error(err);
    if (err.message.includes('must be') || err.message === 'Invalid commute mode.') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Failed to log activity.' });
  }
}

// View Activity / Carbon Score Status (User) - includes insights
async function myActivities(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM activities WHERE user_id = $1 ORDER BY activity_date DESC LIMIT 90`,
      [req.user.id]
    );

    const totalScore = rows.reduce((sum, a) => sum + Number(a.carbon_score), 0);
    const avgScore = rows.length ? totalScore / rows.length : 0;
    const verifiedCount = rows.filter(a => a.status === 'verified').length;

    res.json({
      activities: rows,
      insights: {
        total_logged: rows.length,
        verified_count: verifiedCount,
        average_daily_carbon_kg: Math.round(avgScore * 100) / 100,
        total_carbon_kg: Math.round(totalScore * 100) / 100
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load activities.' });
  }
}

// Activity History (User: own; Employee/Admin: any user via ?userId=)
async function activityHistory(req, res) {
  try {
    const targetUserId = (req.user.role !== 'user' && req.query.userId) ? req.query.userId : req.user.id;
    const { status } = req.query;

    const params = [targetUserId];
    let where = 'WHERE user_id = $1';
    if (status) {
      params.push(status);
      where += ` AND status = $${params.length}`;
    }

    const { rows } = await pool.query(
      `SELECT * FROM activities ${where} ORDER BY activity_date DESC`,
      params
    );
    res.json({ activities: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load activity history.' });
  }
}

// Queue of pending activities for Employee/Admin to review
async function pendingActivities(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT a.*, u.name AS user_name, u.email AS user_email
       FROM activities a JOIN users u ON u.id = a.user_id
       WHERE a.status = 'pending'
       ORDER BY a.activity_date ASC`
    );
    res.json({ activities: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load pending activities.' });
  }
}

async function getActivity(req, res) {
  try {
    const params = [req.params.id];
    let query = 'SELECT * FROM activities WHERE id = $1';
    if (req.user.role === 'user') {
      params.push(req.user.id);
      query += ' AND user_id = $2';
    }
    const { rows } = await pool.query(query, params);
    if (!rows.length) return res.status(404).json({ message: 'Activity not found.' });
    res.json({ activity: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load activity.' });
  }
}

module.exports = { logActivity, myActivities, activityHistory, pendingActivities, getActivity };
