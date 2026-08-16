import pool from './config/db.js';

async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('Connected! Current time from DB:', result.rows[0]);
  } catch (err) {
    console.error('Connection failed:', err.message);
  } finally {
    await pool.end();
  }
}

testConnection();
