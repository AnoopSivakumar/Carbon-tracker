const bcrypt = require('bcryptjs');
const pool = require('../db/pool');

// Module 1: User Management (primarily Admin-facing, plus self-service profile)

// Add User (Admin) - can create user/employee/admin accounts directly
async function addUser(req, res) {
  try {
    const { name, email, password, role, phone } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Name, email, password and role are required.' });
    }
    if (!['user', 'employee', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role.' });
    }

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length) {
      return res.status(409).json({ message: 'A user with this email already exists.' });
    }

    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, phone)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING id, name, email, role, phone, is_active, created_at`,
      [name, email, hash, role, phone || null]
    );
    res.status(201).json({ user: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to add user.' });
  }
}

// Search / List users (Admin) - supports ?q=&role=
async function searchUsers(req, res) {
  try {
    const { q, role } = req.query;
    const conditions = [];
    const params = [];

    if (q) {
      params.push(`%${q}%`);
      conditions.push(`(name ILIKE $${params.length} OR email ILIKE $${params.length})`);
    }
    if (role) {
      params.push(role);
      conditions.push(`role = $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const { rows } = await pool.query(
      `SELECT id, name, email, role, phone, is_active, created_at
       FROM users ${where} ORDER BY created_at DESC`,
      params
    );
    res.json({ users: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to search users.' });
  }
}

async function getUser(req, res) {
  try {
    if (req.user.role !== 'admin' && req.user.id !== Number(req.params.id)) {
      return res.status(403).json({ message: 'You can only view your own profile.' });
    }
    const { rows } = await pool.query(
      'SELECT id, name, email, role, phone, avatar_url, is_active, created_at FROM users WHERE id = $1',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'User not found.' });
    res.json({ user: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load user.' });
  }
}

// Update User Profile - self-service or Admin editing anyone
async function updateUser(req, res) {
  try {
    const targetId = Number(req.params.id);
    const isSelf = req.user.id === targetId;
    const isAdmin = req.user.role === 'admin';

    if (!isSelf && !isAdmin) {
      return res.status(403).json({ message: 'You can only update your own profile.' });
    }

    const { name, phone, password, avatar_url, role, is_active } = req.body;
    if (role !== undefined && (!isAdmin || !['user', 'employee', 'admin'].includes(role))) {
      return res.status(400).json({ message: 'Invalid role.' });
    }
    if (is_active !== undefined && (!isAdmin || typeof is_active !== 'boolean')) {
      return res.status(400).json({ message: 'is_active must be a boolean and can only be changed by an admin.' });
    }
    if (avatar_url !== undefined && avatar_url !== null &&
      (!/^data:image\/(png|jpeg|jpg|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(avatar_url) || avatar_url.length > 5 * 1024 * 1024)) {
      return res.status(400).json({ message: 'Profile picture must be a valid image smaller than 5 MB.' });
    }
    const fields = [];
    const params = [];
    let i = 1;

    if (name !== undefined) { fields.push(`name = $${i++}`); params.push(name); }
    if (phone !== undefined) { fields.push(`phone = $${i++}`); params.push(phone); }
    if (password) { fields.push(`password_hash = $${i++}`); params.push(await bcrypt.hash(password, 10)); }
    if (avatar_url !== undefined) { fields.push(`avatar_url = $${i++}`); params.push(avatar_url); }

    // Only an admin may change role / active status
    if (isAdmin && role !== undefined) { fields.push(`role = $${i++}`); params.push(role); }
    if (isAdmin && is_active !== undefined) { fields.push(`is_active = $${i++}`); params.push(is_active); }

    if (!fields.length) return res.status(400).json({ message: 'No fields to update.' });

    fields.push(`updated_at = NOW()`);
    params.push(targetId);

    const { rows } = await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${i} RETURNING id, name, email, role, phone, avatar_url, is_active, created_at`,
      params
    );
    if (!rows.length) return res.status(404).json({ message: 'User not found.' });
    res.json({ user: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update user.' });
  }
}

// Delete User (Admin)
async function deleteUser(req, res) {
  try {
    const { rows } = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'User not found.' });
    res.json({ message: 'User deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete user.' });
  }
}

module.exports = { addUser, searchUsers, getUser, updateUser, deleteUser };
