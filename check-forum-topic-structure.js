const mysql = require('mysql2/promise');

async function checkForumTopicStructure() {
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
    console.log('Checking forum_topic table structure...');
    
    // Get detailed table structure
    const [structure] = await connection.execute(`
      DESCRIBE forum_topic
    `);
    
    console.log('Table structure:');
    structure.forEach((row) => {
      console.log(`  ${row.Field} - ${row.Type} - ${row.Null} - ${row.Key} - ${row.Default} - ${row.Extra}`);
    });
    
    // Count columns
    console.log(`\nTotal columns: ${structure.length}`);
    
    // Try to create a working INSERT statement
    console.log('\nCreating working INSERT...');
    const columns = structure.map(row => row.Field).join(', ');
    console.log('Columns:', columns);
    
    // Create values placeholders
    const placeholders = structure.map((row, index) => {
      if (row.Field === 'id') return 'DEFAULT';
      if (row.Field === 'likes') return '0';
      if (row.Field === 'is_pinned') return '0';
      if (row.Field === 'created_at') return 'NOW()';
      return '?';
    }).join(', ');
    
    console.log('Placeholders:', placeholders);
    
    // Create a working INSERT
    const workingInsert = `
      INSERT INTO forum_topic (${columns}) VALUES (${placeholders})
    `;
    console.log('Working INSERT:', workingInsert);
    
  } catch (error) {
    console.error('Error checking structure:', error);
  } finally {
    await connection.end();
  }
}

checkForumTopicStructure();
