const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const { ApiError } = require('../middleware/errorHandler');
require('dotenv').config();

function signToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

// POST /api/auth/register
async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    const [existing] = await pool.query('SELECT id FROM users WHERE email = :email', { email });
    if (existing.length > 0) throw new ApiError(409, 'Email already registered');

    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES (:name, :email, :passwordHash)',
      { name, email, passwordHash }
    );

    const user = { id: result.insertId, role: 'customer' };
    const token = signToken(user);

    res.status(201).json({
      success: true,
      data: { token, user: { id: user.id, name, email, role: user.role } },
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const [rows] = await pool.query(
      'SELECT id, name, email, password_hash, role FROM users WHERE email = :email',
      { email }
    );
    if (rows.length === 0) throw new ApiError(401, 'Invalid email or password');

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) throw new ApiError(401, 'Invalid email or password');

    const token = signToken(user);
    res.json({
      success: true,
      data: { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login };
