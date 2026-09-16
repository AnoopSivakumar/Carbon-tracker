const pool = require('../db/pool');

// Admin: manage reward campaigns
async function listCampaigns(req, res) {
  try {
    const { rows } = await pool.query('SELECT * FROM campaigns ORDER BY start_date DESC');
    res.json({ campaigns: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load campaigns.' });
  }
}

async function createCampaign(req, res) {
  try {
    const { title, description, start_date, end_date, points_multiplier } = req.body;
    if (!title || !start_date || !end_date) {
      return res.status(400).json({ message: 'Title, start_date and end_date are required.' });
    }
    const { rows } = await pool.query(
      `INSERT INTO campaigns (title, description, start_date, end_date, points_multiplier, created_by)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [title, description || null, start_date, end_date, points_multiplier || 1.0, req.user.id]
    );
    res.status(201).json({ campaign: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create campaign.' });
  }
}

async function updateCampaign(req, res) {
  try {
    const { title, description, start_date, end_date, points_multiplier, is_active } = req.body;
    const { rows } = await pool.query(
      `UPDATE campaigns SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        start_date = COALESCE($3, start_date),
        end_date = COALESCE($4, end_date),
        points_multiplier = COALESCE($5, points_multiplier),
        is_active = COALESCE($6, is_active)
       WHERE id = $7 RETURNING *`,
      [title, description, start_date, end_date, points_multiplier, is_active, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Campaign not found.' });
    res.json({ campaign: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update campaign.' });
  }
}

async function deleteCampaign(req, res) {
  try {
    const { rows } = await pool.query('DELETE FROM campaigns WHERE id = $1 RETURNING id', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Campaign not found.' });
    res.json({ message: 'Campaign deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete campaign.' });
  }
}

module.exports = { listCampaigns, createCampaign, updateCampaign, deleteCampaign };
