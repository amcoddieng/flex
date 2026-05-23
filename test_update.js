const mysql = require('./lib/db');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'job_platform',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function testUpdate() {
  try {
    console.log('Test de mise à jour directe...');
    
    const connection = await pool.getConnection();
    console.log('Connexion établie');
    
    const [result] = await connection.execute(
      'UPDATE collaborative_projects SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      ['Test Direct Update', 2]
    );
    
    console.log('Résultat:', result);
    console.log('Rows affected:', result.affectedRows);
    
    await connection.end();
    console.log('Test terminé');
    
  } catch (error) {
    console.error('Erreur:', error);
  }
}

testUpdate();
