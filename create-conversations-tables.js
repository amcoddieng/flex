const mysql = require('mysql2/promise');

async function createConversationTables() {
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
    console.log('Creating conversations table...');
    
    // Create conversations table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS conversations (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT NOT NULL,
        participant_id INT NOT NULL,
        participant_type ENUM('STUDENT', 'EMPLOYER') NOT NULL,
        last_message TEXT,
        last_message_at DATETIME,
        unread_count INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    console.log('Creating messages table...');
    
    // Create messages table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS messages (
        id INT PRIMARY KEY AUTO_INCREMENT,
        conversation_id INT NOT NULL,
        sender_id INT NOT NULL,
        receiver_id INT NOT NULL,
        content TEXT NOT NULL,
        sender_type ENUM('STUDENT', 'EMPLOYER') NOT NULL,
        receiver_type ENUM('STUDENT', 'EMPLOYER') NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Creating indexes...');
    
    // Create indexes
    await connection.execute('CREATE INDEX IF NOT EXISTS idx_conversations_student_id ON conversations(student_id)');
    await connection.execute('CREATE INDEX IF NOT EXISTS idx_conversations_participant ON conversations(participant_id, participant_type)');
    await connection.execute('CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC)');
    await connection.execute('CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id)');
    await connection.execute('CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at)');
    await connection.execute('CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id, sender_type)');

    console.log('Tables and indexes created successfully!');

  } catch (error) {
    console.error('Error creating tables:', error);
  } finally {
    await connection.end();
  }
}

createConversationTables();
