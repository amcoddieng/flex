const mysql = require('mysql2/promise');

async function checkForumTopicConstraints() {
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
    console.log('Checking forum_topic table constraints...');
    
    // Get detailed table structure
    const [structure] = await connection.execute(`
      DESCRIBE forum_topic
    `);
    
    console.log('Table structure:');
    structure.forEach((row) => {
      console.log(`  ${row.Field} - ${row.Type} - ${row.Null} - ${row.Key} - ${row.Default} - ${row.Extra}`);
    });
    
    // Check for constraints
    const [constraints] = await connection.execute(`
      SELECT 
        CONSTRAINT_NAME, 
        TABLE_NAME, 
        COLUMN_NAME, 
        REFERENCED_TABLE_NAME, 
        REFERENCED_COLUMN_NAME
      FROM information_schema.KEY_COLUMN_USAGE 
      WHERE TABLE_SCHEMA = 'job_platform' 
      AND TABLE_NAME = 'forum_topic'
      AND CONSTRAINT_NAME != 'PRIMARY'
    `);
    
    console.log('\nConstraints:');
    constraints.forEach((constraint) => {
      console.log(`  ${constraint.CONSTRAINT_NAME} - ${constraint.CONSTRAINT_TYPE} - ${constraint.COLUMN_NAME}`);
    });
    
    // Try to insert a simple test record
    console.log('\nTrying to insert a test record...');
    try {
      const [result] = await connection.execute(`
        INSERT INTO forum_topic (
          author_id, 
          author_name, 
          category, 
          title, 
          content, 
          tags, 
          likes, 
          is_pinned, 
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, 0, 0, NOW())
      `, [1, 'Test Author', 'Test Category', 'Test Title', 'Test Content', null]);
      
      console.log('Test insert successful, ID:', result.insertId);
      
      // Clean up test record
      await connection.execute('DELETE FROM forum_topic WHERE id = ?', [result.insertId]);
      console.log('Test record cleaned up');
      
    } catch (error) {
      console.error('Test insert failed:', error.message);
    }
    
  } catch (error) {
    console.error('Error checking constraints:', error);
  } finally {
    await connection.end();
  }
}

checkForumTopicConstraints();
