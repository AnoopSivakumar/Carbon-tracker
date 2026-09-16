const jwt = require('jsonwebtoken');
const pool = require('../db/pool');

/**
 * Verifies the JWT sent in the Authorization header and attaches
 * { id, role, name, email } to req.user.
 */
async function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Authentication token missing.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const { rows } = await pool.query(
      'SELECT id, name, email, role FROM users WHERE id = $1 AND is_active = TRUE',
      [payload.id]
    );
    if (!rows.length) {
      return res.status(401).json({ message: 'Account is inactive or no longer exists.' });
    }
    req.user = rows[0];
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

/**
 * Restricts a route to one or more roles.
 * Usage: requireRole('admin') or requireRole('admin', 'employee')
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to perform this action.' });
    }
    next();
  };
}

module.exports = { authenticate, requireRole };
