const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'job_platform',
});

async function debugProfiles() {
  console.log('🔍 Diagnostic des tables de profils...');
  
  try {
    const connection = await pool.getConnection();
    
    // 1. Vérifier les tables de profils
    console.log('\n📋 Tables de profils:');
    
    const [etudiantTables] = await connection.execute(`SHOW TABLES LIKE '%etudiant%'`);
    console.log('Tables étudiant:', etudiantTables);
    
    const [employerTables] = await connection.execute(`SHOW TABLES LIKE '%employer%'`);
    console.log('Tables employer:', employerTables);
    
    // 2. Structure des tables
    console.log('\n🏗 Structure des tables:');
    
    try {
      const [etudiantStructure] = await connection.execute(`DESCRIBE etudiant_profil`);
      console.log('Structure etudiant_profil:');
      etudiantStructure.forEach(col => {
        console.log(`  - ${col.Field}: ${col.Type}`);
      });
    } catch (err) {
      console.error('❌ Erreur structure etudiant_profil:', err.message);
    }
    
    try {
      const [employerStructure] = await connection.execute(`DESCRIBE employer_profil`);
      console.log('Structure employer_profil:');
      employerStructure.forEach(col => {
        console.log(`  - ${col.Field}: ${col.Type}`);
      });
    } catch (err) {
      console.error('❌ Erreur structure employer_profil:', err.message);
    }
    
    // 3. Structure de la table conversation
    try {
      const [conversationStructure] = await connection.execute(`DESCRIBE conversation`);
      console.log('Structure conversation:');
      conversationStructure.forEach(col => {
        console.log(`  - ${col.Field}: ${col.Type}`);
      });
    } catch (err) {
      console.error('❌ Erreur structure conversation:', err.message);
    }
    
    // 4. Test de jointure
    console.log('\n🧪 Test de jointure:');
    
    try {
      const [testJoin] = await connection.execute(`
        SELECT 
          ep.id as etudiant_id,
          ep.user_id as etudiant_user_id,
          ep.first_name,
          ep.last_name,
          emp.id as employer_id,
          emp.user_id as employer_user_id,
          emp.company_name
        FROM etudiant_profil ep
        CROSS JOIN employer_profil emp
        LIMIT 1
      `);
      console.log('Test jointure réussi:', testJoin);
      
    } catch (err) {
      console.error('❌ Erreur jointure:', err.message);
    }
    
    await connection.release();
    console.log('\n✅ Diagnostic terminé');
    
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
  }
}

debugProfiles();
