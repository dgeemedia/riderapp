// backend/migrate.js
require('dotenv').config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: {
    require: true,
    rejectUnauthorized: false
  }
});

(async () => {
  try {
    console.log('Running clean setup migration...');
    const filePath = path.join(__dirname, '..', 'migrations', '007_clean_setup.sql');
    const sql = fs.readFileSync(filePath, 'utf8');
    
    // Run the SQL
    await pool.query(sql);
    
    console.log('Migration completed successfully!');
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    await pool.end();
    process.exit(1);
  }
})();