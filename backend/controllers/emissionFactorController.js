const pool = require('../db/pool');

// Admin: configure emission-factor rules used by the carbon calculator
async function listFactors(req, res) {
  const { rows } = await pool.query('SELECT * FROM emission_factors ORDER BY category, key');
  res.json({ emission_factors: rows });
}

async function createFactor(req, res) {
  try {
    const { category, key, label, factor_value, unit } = req.body;
    if (!category || !key || !label || factor_value === undefined || !unit) {
      return res.status(400).json({ message: 'category, key, label, factor_value and unit are required.' });
    }
    const { rows } = await pool.query(
      `INSERT INTO emission_factors (category, key, label, factor_value, unit, updated_by)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [category, key, label, factor_value, unit, req.user.id]
    );
    res.status(201).json({ emission_factor: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create emission factor (category/key pair may already exist).' });
  }
}

async function updateFactor(req, res) {
  try {
    const { label, factor_value, unit, is_active } = req.body;
    const { rows } = await pool.query(
      `UPDATE emission_factors SET
        label = COALESCE($1, label),
        factor_value = COALESCE($2, factor_value),
        unit = COALESCE($3, unit),
        is_active = COALESCE($4, is_active),
        updated_by = $5,
        updated_at = NOW()
       WHERE id = $6 RETURNING *`,
      [label, factor_value, unit, is_active, req.user.id, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Emission factor not found.' });
    res.json({ emission_factor: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update emission factor.' });
  }
}

async function deleteFactor(req, res) {
  const { rows } = await pool.query('DELETE FROM emission_factors WHERE id = $1 RETURNING id', [req.params.id]);
  if (!rows.length) return res.status(404).json({ message: 'Emission factor not found.' });
  res.json({ message: 'Emission factor deleted.' });
}

module.exports = { listFactors, createFactor, updateFactor, deleteFactor };
