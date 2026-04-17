const mysql = require('mysql2/promise');

async function checkExistingConversations() {
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
    console.log('Checking existing conversations...');
    
    // Vérifier toutes les conversations
    const [allConversations] = await connection.execute(`
      SELECT c.*, sp.user_id as student_user_id, ep.company_name
      FROM conversation c
      LEFT JOIN student_profile sp ON c.student_id = sp.id
      LEFT JOIN employer_profile ep ON c.employer_id = ep.id
      ORDER BY c.created_at DESC
    `);
    
    console.log(`Total conversations: ${allConversations.length}`);
    allConversations.forEach((conv, index) => {
      console.log(`\n${index + 1}. Conversation ID: ${conv.id}`);
      console.log(`   Student User ID: ${conv.student_user_id}`);
      console.log(`   Student Profile ID: ${conv.student_id}`);
      console.log(`   Employer Profile ID: ${conv.employer_id}`);
      console.log(`   Company: ${conv.company_name}`);
      console.log(`   Offer ID: ${conv.offer_id}`);
      console.log(`   Created At: ${conv.created_at}`);
    });
    
    // Vérifier spécifiquement pour l'utilisateur 4
    console.log('\n=== Conversations for User 4 ===');
    const [user4Conversations] = await connection.execute(`
      SELECT c.*, sp.user_id as student_user_id, ep.company_name
      FROM conversation c
      LEFT JOIN student_profile sp ON c.student_id = sp.id
      LEFT JOIN employer_profile ep ON c.employer_id = ep.id
      WHERE sp.user_id = 4
      ORDER BY c.created_at DESC
    `);
    
    console.log(`Conversations for user 4: ${user4Conversations.length}`);
    
  } catch (error) {
    console.error('Error checking conversations:', error);
  } finally {
    await connection.end();
  }
}

checkExistingConversations();
