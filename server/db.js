const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    // Questo è il comando magico per risolvere "self-signed certificate"
    rejectUnauthorized: false 
  }
});

module.exports = pool;