const mysql = require('mysql2/promise');

async function checkConversationTable() {
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
    console.log('Checking conversation table structure...');
    
    // Vérifier si la table conversation existe
    const [tables] = await connection.execute(`
      SHOW TABLES LIKE 'conversation'
    `);
    
    if (Array.isArray(tables) && tables.length > 0) {
      console.log('Table conversation exists!');
      
      // Décrire la structure de la table
      const [structure] = await connection.execute(`
        DESCRIBE conversation
      `);
      
      console.log('Table structure:');
      structure.forEach((row) => {
        console.log(`  ${row.Field} - ${row.Type} - ${row.Null} - ${row.Key} - ${row.Default}`);
      });
      
      // Vérifier s'il y a des données
      const [count] = await connection.execute(`
        SELECT COUNT(*) as total FROM conversation
      `);
      
      console.log(`Total records: ${count[0].total}`);
      
    } else {
      console.log('Table conversation does not exist');
    }
    
  } catch (error) {
    console.error('Error checking table:', error);
  } finally {
    await connection.end();
  }
}

checkConversationTable();
