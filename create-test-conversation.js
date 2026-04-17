const mysql = require('mysql2/promise');

async function createTestConversation() {
  const connection = await mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'job_platform',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  try {
    // D'abord, obtenir le student_id pour l'utilisateur 4
    const [studentResult] = await connection.execute(
      'SELECT id FROM student_profile WHERE user_id = ?',
      [4]
    );
    
    if (!Array.isArray(studentResult) || studentResult.length === 0) {
      console.error('Student profile not found for user ID 4');
      return;
    }
    
    const studentId = studentResult[0].id;
    console.log('Found student ID:', studentId);
    
    // Créer une conversation pour l'étudiant 4 avec l'employeur 1 (diengService)
    const [result] = await connection.execute(
      `INSERT INTO conversation (student_id, employer_id, offer_id, created_at) VALUES (?, ?, ?, NOW())`,
      [studentId, 1, 3] // Offer ID 3 = Data Analyst Senior
    );
    
    const conversationId = result.insertId;
    console.log('Created test conversation with ID:', conversationId);
    console.log('For student ID:', studentId);
    console.log('With employer ID: 1 (diengService)');
    console.log('For offer ID: 3 (Data Analyst Senior)');
    
  } catch (error) {
    console.error('Error creating test conversation:', error);
  } finally {
    await connection.end();
  }
}

createTestConversation();
