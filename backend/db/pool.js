const { Pool } = require('pg');
require('dotenv').config();

const poolConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      host: process.env.PGHOST,
      port: process.env.PGPORT,
      database: process.env.PGDATABASE,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD
    };

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL error', err);
});

module.exports = pool;
