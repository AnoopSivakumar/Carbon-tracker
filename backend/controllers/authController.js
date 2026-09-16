const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// Public self-registration always creates a 'user' role account.
// Employee/Admin accounts are created by an Admin via the User Management module.
async function register(req, res) {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, phone)
      VALUES ($1, $2, $3, 'user', $4)
      RETURNING id, name, email, role, phone, avatar_url, created_at`,
      [name, email, hash, phone || null]
    );

    const user = rows[0];
    const token = signToken(user);
    res.status(201).json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Registration failed.' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = rows[0];

    if (!user || !user.is_active) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = signToken(user);
    delete user.password_hash;
    res.json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login failed.' });
  }
}

async function me(req, res) {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, email, role, phone, avatar_url, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'User not found.' });
    res.json({ user: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load profile.' });
  }
}

module.exports = { register, login, me };
