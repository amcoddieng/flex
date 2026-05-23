const { Client } = require('pg');

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL_PG || process.env.DATABASE_URL;
if (!connectionString) {
  console.error('POSTGRES_URL not set in environment. Set it in .env or pass it as env var.');
  process.exit(1);
}

const client = new Client({ connectionString });

(async () => {
  try {
    await client.connect();
    const res = await client.query('SELECT NOW()');
    console.log('Connected to Postgres — server time:', res.rows[0]);
    await client.end();
    process.exit(0);
  } catch (err) {
    console.error('Connection failed:', err.message || err);
    process.exit(1);
  }
})();
