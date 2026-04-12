// Test des variables d'environnement
console.log('=== VARIABLES D\'ENVIRONNEMENT ===');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : 'NON DEFINI');
console.log('DB_NAME:', process.env.DB_NAME);

// Test de connexion avec les mêmes paramètres que les API admin
const mysql = require('mysql2/promise');

async function testAdminConnection() {
  try {
    console.log('\n=== TEST CONNEXION ADMIN ===');
    
    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    console.log('Configuration pool créée');
    
    const connection = await pool.getConnection();
    console.log('Connexion réussie avec les variables d\'environnement !');
    
    // Test simple query
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('Test query:', rows);
    
    // Test table job_offer
    try {
      const [jobs] = await connection.execute('SELECT COUNT(*) as count FROM job_offer LIMIT 1');
      console.log('Table job_offer accessible:', jobs[0]);
    } catch (err) {
      console.log('Erreur table job_offer:', err.message);
    }
    
    connection.release();
    await pool.end();
    console.log('Connexion fermée avec succès');
    
  } catch (error) {
    console.error('Erreur de connexion admin:', error.message);
    console.error('Code erreur:', error.code);
  }
}

testAdminConnection();
