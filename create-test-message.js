const mysql = require('mysql2/promise');

async function createTestMessage() {
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
    // Créer un message de test pour la conversation 3
    const [result] = await connection.execute(
      `
      INSERT INTO message (conversation_id, sender_type, sender_id, message, is_read, created_at) 
      VALUES (?, 'employer', ?, ?, 0, NOW())
      `,
      [3, 1, 'Bonjour! Nous avons bien reçu votre candidature. Seriez-vous disponible pour un entretien cette semaine?']
    );
    
    const messageId = result.insertId;
    console.log('Created test message with ID:', messageId);
    console.log('For conversation ID: 3');
    console.log('From employer ID: 1');
    
  } catch (error) {
    console.error('Error creating test message:', error);
  } finally {
    await connection.end();
  }
}

createTestMessage();
