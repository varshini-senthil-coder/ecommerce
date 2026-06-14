const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { register, login } = require('../controllers/authController');

const router = express.Router();

// POST /api/auth/register
router.post(
  '/register',
  [
    body('name').isString().trim().isLength({ min: 2, max: 120 }),
    body('email').isEmail().normalizeEmail(),
    body('password').isString().isLength({ min: 6, max: 100 }),
  ],
  validate,
  register
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isString().notEmpty(),
  ],
  validate,
  login
);

module.exports = router;
