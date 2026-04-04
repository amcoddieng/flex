// Vérifier les variables d'environnement
console.log('🔍 Variables d\'environnement:');
console.log('DB_HOST:', process.env.DB_HOST || 'NON DÉFINI');
console.log('DB_USER:', process.env.DB_USER || 'NON DÉFINI');
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : 'NON DÉFINI');
console.log('DB_NAME:', process.env.DB_NAME || 'NON DÉFINI');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '***' : 'NON DÉFINI');

// Test de connexion simple
const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    console.log('\n🧪 Test de connexion à la base...');
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'job_platform',
    });
    
    console.log('✅ Connexion réussie!');
    
    // Test simple
    const [result] = await connection.execute('SELECT 1 as test');
    console.log('Test query:', result);
    
    await connection.end();
    console.log('✅ Connexion fermée');
    
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    console.error('Code:', error.code);
  }
}

testConnection();
