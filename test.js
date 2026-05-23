const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_Zg9dfD8xEKvN@ep-tiny-salad-al5cdk5z-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require',
  ssl: {
    require: true,
    rejectUnauthorized: false
  }
});

async function testConnection() {
  let client;
  try {
    console.log('Tentative de connexion à NeonDB...');
    client = await pool.connect();
    console.log('✅ Connexion réussie !');
    
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('📅 Heure actuelle:', result.rows[0].current_time);
    console.log('🐘 Version PostgreSQL:', result.rows[0].pg_version);
    
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

testConnection();