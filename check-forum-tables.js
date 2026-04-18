const mysql = require('mysql2/promise');

async function checkForumTables() {
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
    console.log('Checking forum tables...');
    
    // Vérifier les tables liées au forum
    const [allTables] = await connection.execute(`
      SHOW TABLES LIKE '%forum%'
    `);
    
    console.log('Forum tables found:', allTables.length);
    
    if (allTables.length > 0) {
      for (const table of allTables) {
        const tableName = Object.values(table)[0];
        console.log(`\n=== Table: ${tableName} ===`);
        
        // Décrire la structure
        const [structure] = await connection.execute(`
          DESCRIBE ${tableName}
        `);
        
        structure.forEach((row) => {
          console.log(`  ${row.Field} - ${row.Type} - ${row.Null} - ${row.Key} - ${row.Default}`);
        });
        
        // Vérifier s'il y a des données
        const [count] = await connection.execute(`
          SELECT COUNT(*) as total FROM ${tableName}
        `);
        
        console.log(`Total records: ${count[0].total}`);
        
        // Afficher quelques exemples s'il y a des données
        if (count[0].total > 0) {
          const [sample] = await connection.execute(`
            SELECT * FROM ${tableName} LIMIT 3
          `);
          
          console.log('Sample data:');
          sample.forEach((row, index) => {
            console.log(`  ${index + 1}:`, JSON.stringify(row, null, 2));
          });
        }
      }
    } else {
      console.log('No forum tables found. Checking for similar tables...');
      
      // Vérifier d'autres tables potentielles
      const [allTables] = await connection.execute(`
        SHOW TABLES
      `);
      
      console.log('\nAll tables in database:');
      allTables.forEach((table) => {
        const tableName = Object.values(table)[0];
        if (tableName.toLowerCase().includes('post') || 
            tableName.toLowerCase().includes('comment') || 
            tableName.toLowerCase().includes('like') ||
            tableName.toLowerCase().includes('forum')) {
          console.log(`  ${tableName}`);
        }
      });
    }
    
  } catch (error) {
    console.error('Error checking forum tables:', error);
  } finally {
    await connection.end();
  }
}

checkForumTables();
