const mysql = require('mysql2/promise');

// Configuration de connexion à adapter
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'job_platform', // Corrigé: job_platform au lieu de flexjob
});

async function debugConversations() {
  console.log('🔍 Diagnostic des tables de conversation...');
  
  try {
    const connection = await pool.getConnection();
    
    // 1. Vérifier si les tables existent
    console.log('\n📋 Vérification des tables:');
    
    try {
      const [tables] = await connection.execute(`
        SHOW TABLES LIKE '%conversation%'
      `);
      console.log('Tables trouvées:', tables);
    } catch (err) {
      console.error('❌ Erreur vérification tables:', err.message);
    }
    
    try {
      const [messageTables] = await connection.execute(`
        SHOW TABLES LIKE '%message%'
      `);
      console.log('Tables message trouvées:', messageTables);
    } catch (err) {
      console.error('❌ Erreur vérification tables message:', err.message);
    }
    
    // 2. Vérifier la structure des tables
    console.log('\n🏗 Structure des tables:');
    
    try {
      const [conversationStructure] = await connection.execute(`
        DESCRIBE conversation
      `);
      console.log('Structure conversation:', conversationStructure);
    } catch (err) {
      console.error('❌ Erreur structure conversation:', err.message);
    }
    
    try {
      const [messageStructure] = await connection.execute(`
        DESCRIBE message
      `);
      console.log('Structure message:', messageStructure);
    } catch (err) {
      console.error('❌ Erreur structure message:', err.message);
    }
    
    // 3. Test d'insertion simple
    console.log('\n🧪 Test d\'insertion:');
    
    try {
      const [testResult] = await connection.execute(`
        INSERT INTO conversation (employer_id, student_id, offer_id)
        VALUES (1, 1, 1)
      `);
      console.log('Insertion test réussie:', testResult);
      
      // Nettoyer le test
      await connection.execute(`DELETE FROM conversation WHERE id = ?`, [testResult.insertId]);
      
    } catch (err) {
      console.error('❌ Erreur insertion test:', err.message);
      console.error('Code SQL:', err.sql);
      console.error('Paramètres:', err.parameters);
    }
    
    await connection.release();
    console.log('\n✅ Diagnostic terminé');
    
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
  }
}

debugConversations();
