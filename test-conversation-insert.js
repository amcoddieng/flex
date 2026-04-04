const mysql = require('mysql2/promise');

// Configuration de connexion
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'job_platform',
});

async function testConversationInsert() {
  console.log('🧪 Test d\'insertion de conversation...');
  
  try {
    const connection = await pool.getConnection();
    
    // 1. Vérifier si les tables existent
    console.log('\n📋 Vérification des tables:');
    
    const [tables] = await connection.execute(`SHOW TABLES LIKE '%conversation%'`);
    console.log('Tables conversation:', tables);
    
    const [messageTables] = await connection.execute(`SHOW TABLES LIKE '%message%'`);
    console.log('Tables message:', messageTables);
    
    // 2. Vérifier la structure exacte
    console.log('\n🏗 Structure des tables:');
    
    try {
      const [conversationStructure] = await connection.execute(`DESCRIBE conversation`);
      console.log('Structure conversation:');
      conversationStructure.forEach(col => {
        console.log(`  - ${col.Field}: ${col.Type} ${col.Null ? 'NULL' : 'NOT NULL'} ${col.Key ? '(' + col.Key + ')' : ''}`);
      });
    } catch (err) {
      console.error('❌ Erreur structure conversation:', err.message);
    }
    
    try {
      const [messageStructure] = await connection.execute(`DESCRIBE message`);
      console.log('Structure message:');
      messageStructure.forEach(col => {
        console.log(`  - ${col.Field}: ${col.Type} ${col.Null ? 'NULL' : 'NOT NULL'} ${col.Key ? '(' + col.Key + ')' : ''}`);
      });
    } catch (err) {
      console.error('❌ Erreur structure message:', err.message);
    }
    
    // 3. Vérifier les contraintes de clés étrangères
    console.log('\n🔗 Contraintes de clés étrangères:');
    
    try {
      const [constraints] = await connection.execute(`
        SELECT 
          TABLE_NAME,
          COLUMN_NAME,
          REFERENCED_TABLE_NAME,
          REFERENCED_COLUMN_NAME
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
        WHERE TABLE_SCHEMA = 'job_platform' 
        AND (TABLE_NAME = 'conversation' OR TABLE_NAME = 'message')
        AND REFERENCED_TABLE_NAME IS NOT NULL
      `);
      console.log('Contraintes trouvées:', constraints);
    } catch (err) {
      console.error('❌ Erreur contraintes:', err.message);
    }
    
    // 4. Test d'insertion avec IDs valides
    console.log('\n🧪 Test d\'insertion:');
    
    // D'abord vérifier si nous avons des IDs valides
    const [students] = await connection.execute(`SELECT id, first_name FROM student LIMIT 1`);
    const [employers] = await connection.execute(`SELECT id, company_name FROM employer LIMIT 1`);
    const [offers] = await connection.execute(`SELECT id, title FROM offer LIMIT 1`);
    
    console.log('Étudiants disponibles:', students);
    console.log('Employeurs disponibles:', employers);
    console.log('Offres disponibles:', offers);
    
    if (students.length === 0 || employers.length === 0 || offers.length === 0) {
      console.error('❌ Pas assez de données pour tester (besoin d\'étudiant, employeur, offre)');
      await connection.release();
      return;
    }
    
    const studentId = students[0].id;
    const employerId = employers[0].id;
    const offerId = offers[0].id;
    
    console.log(`Test avec: student=${studentId}, employer=${employerId}, offer=${offerId}`);
    
    try {
      const [result] = await connection.execute(`
        INSERT INTO conversation (student_id, employer_id, offer_id)
        VALUES (?, ?, ?)
      `, [studentId, employerId, offerId]);
      
      console.log('✅ Insertion réussie! ID:', result.insertId);
      
      // Nettoyer le test
      await connection.execute(`DELETE FROM conversation WHERE id = ?`, [result.insertId]);
      console.log('✅ Nettoyage réussi');
      
    } catch (err) {
      console.error('❌ Erreur insertion:', err.message);
      console.error('Code erreur:', err.code);
      console.error('SQL:', err.sql);
      console.error('Paramètres:', err.parameters);
    }
    
    await connection.release();
    console.log('\n✅ Test terminé');
    
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
  }
}

testConversationInsert();
