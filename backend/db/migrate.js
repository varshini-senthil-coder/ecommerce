/**
 * Runs schema.sql against the configured MySQL database.
 * Usage: npm run migrate
 */
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

  // multipleStatements is required to run a multi-statement schema file
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });

  try {
    console.log('Running schema migration...');
    await connection.query(sql);
    console.log('✅ Schema created/updated successfully.');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    await connection.end();
  }
}

migrate();
