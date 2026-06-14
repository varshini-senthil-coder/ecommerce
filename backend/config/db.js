const mysql = require('mysql2/promise');
require('dotenv').config();

// Centralized connection pool for scalability.
// Pooling avoids the overhead of opening a new TCP/MySQL handshake per request.
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'MyP@$$123',
  database: process.env.DB_NAME || 'ecommerce_db',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT, 10) || 10,
  queueLimit: 0,
  namedPlaceholders: true,
  dateStrings: true,
});

// Quick connectivity check on boot
async function testConnection() {
  try {
    const conn = await pool.getConnection();
    console.log('✅ MySQL connected successfully');
    conn.release();
  } catch (err) {
    console.error('❌ MySQL connection failed:', err.message);
  }
}

module.exports = { pool, testConnection };
