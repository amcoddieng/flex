const mysql = require('mysql2/promise');

// Configuration de test avec les identifiants de l'erreur
const testConfig = {
  host: 'localhost',
  user: 'dieng',
  password: 'Papa1997',
  database: 'job_platform',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

async function testConnection() {
  try {
    console.log('Test de connexion à la base de données...');
    console.log('Configuration:', {
      host: testConfig.host,
      user: testConfig.user,
      database: testConfig.database,
      password: '***'
    });
    
    const connection = await mysql.createConnection(testConfig);
    console.log('Connexion réussie !');
    
    // Test simple query
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('Test query réussi:', rows);
    
    // Test table job_offer
    try {
      const [jobs] = await connection.execute('SELECT COUNT(*) as count FROM job_offer LIMIT 1');
      console.log('Table job_offer accessible:', jobs);
    } catch (err) {
      console.log('Erreur table job_offer:', err.message);
    }
    
    await connection.end();
    console.log('Connexion fermée');
    
  } catch (error) {
    console.error('Erreur de connexion:', error.message);
    console.error('Code erreur:', error.code);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n=== SOLUTIONS POSSIBLES ===');
      console.log('1. Vérifiez que l\'utilisateur MySQL "dieng" existe:');
      console.log('   CREATE USER "dieng"@"localhost" IDENTIFIED BY "Papa1997";');
      console.log('\n2. Donnez les permissions à l\'utilisateur:');
      console.log('   GRANT ALL PRIVILEGES ON job_platform.* TO "dieng"@"localhost";');
      console.log('   FLUSH PRIVILEGES;');
      console.log('\n3. Ou utilisez l\'utilisateur root:');
      console.log('   DB_USER="root"');
      console.log('   DB_PASSWORD=""');
      console.log('\n4. Vérifiez que le service MySQL est démarré');
    }
  }
}

testConnection();
