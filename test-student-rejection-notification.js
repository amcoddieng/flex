const mysql = require('mysql2/promise');

// Configuration de la base de données
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'job_platform',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function testStudentRejectionNotification() {
  console.log('=== Test de notification de rejet d\'étudiant ===');
  
  try {
    const connection = await pool.getConnection();
    
    // 1. Vérifier la structure de la table notification
    console.log('\n1. Vérification de la table notification:');
    const [tableStructure] = await connection.execute('DESCRIBE notification');
    console.table(tableStructure);
    
    // 2. Vérifier les étudiants existants
    console.log('\n2. Étudiants existants:');
    const [students] = await connection.execute(`
      SELECT u.id, u.email, sp.first_name, sp.last_name, sp.validation_status 
      FROM user u 
      LEFT JOIN student_profile sp ON u.id = sp.user_id 
      WHERE u.role = 'STUDENT'
    `);
    console.table(students);
    
    // 3. Vérifier les notifications existantes
    console.log('\n3. Notifications existantes:');
    const [notifications] = await connection.execute(`
      SELECT n.*, u.email 
      FROM notification n 
      JOIN user u ON n.user_id = u.id 
      ORDER BY n.created_at DESC 
      LIMIT 10
    `);
    console.table(notifications);
    
    // 4. Test d'insertion de notification de rejet
    if (students.length > 0) {
      const testStudent = students[0];
      console.log(`\n4. Test d'insertion de notification pour l'étudiant: ${testStudent.email}`);
      
      const testNotification = {
        user_id: testStudent.id,
        type: 'REJECTED',
        title: 'Profil refusé',
        message: 'Votre profil a été refusé pour les raisons suivantes: Informations incomplètes.',
        metadata: JSON.stringify({ validation_status: 'REJECTED', reason: 'Informations incomplètes' })
      };
      
      const [insertResult] = await connection.execute(`
        INSERT INTO notification (user_id, type, title, message, metadata) 
        VALUES (?, ?, ?, ?, ?)
      `, [
        testNotification.user_id,
        testNotification.type,
        testNotification.title,
        testNotification.message,
        testNotification.metadata
      ]);
      
      console.log(`Notification insérée avec ID: ${insertResult.insertId}`);
      
      // 5. Vérifier la notification insérée
      console.log('\n5. Vérification de la notification insérée:');
      const [newNotification] = await connection.execute(`
        SELECT * FROM notification WHERE id = ?
      `, [insertResult.insertId]);
      console.table(newNotification);
    }
    
    connection.release();
    console.log('\n=== Test terminé avec succès ===');
    
  } catch (error) {
    console.error('Erreur lors du test:', error);
  } finally {
    await pool.end();
  }
}

// Exécuter le test
testStudentRejectionNotification();
