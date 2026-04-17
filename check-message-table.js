const mysql = require('mysql2/promise');

async function checkMessageTable() {
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
    console.log('Checking message table structure...');
    
    // Vérifier si la table message existe
    const [tables] = await connection.execute(`
      SHOW TABLES LIKE 'message'
    `);
    
    if (Array.isArray(tables) && tables.length > 0) {
      console.log('Table message exists!');
      
      // Décrire la structure de la table
      const [structure] = await connection.execute(`
        DESCRIBE message
      `);
      
      console.log('Table structure:');
      structure.forEach((row) => {
        console.log(`  ${row.Field} - ${row.Type} - ${row.Null} - ${row.Key} - ${row.Default}`);
      });
      
      // Vérifier s'il y a des données
      const [count] = await connection.execute(`
        SELECT COUNT(*) as total FROM message
      `);
      
      console.log(`Total records: ${count[0].total}`);
      
      // Afficher quelques messages exemples
      if (count[0].total > 0) {
        const [sampleMessages] = await connection.execute(`
          SELECT * FROM message LIMIT 5
        `);
        
        console.log('\nSample messages:');
        sampleMessages.forEach((msg, index) => {
          console.log(`\nMessage ${index + 1}:`);
          Object.keys(msg).forEach(key => {
            console.log(`  ${key}: ${msg[key]}`);
          });
        });
      }
      
    } else {
      console.log('Table message does not exist');
      
      // Vérifier s'il y a d'autres tables similaires
      const [allTables] = await connection.execute(`
        SHOW TABLES
      `);
      
      console.log('\nAll tables in database:');
      allTables.forEach((table) => {
        const tableName = Object.values(table)[0];
        if (tableName.toLowerCase().includes('message') || tableName.toLowerCase().includes('conversation')) {
          console.log(`  ${tableName}`);
        }
      });
    }
    
  } catch (error) {
    console.error('Error checking table:', error);
  } finally {
    await connection.end();
  }
}

checkMessageTable();
