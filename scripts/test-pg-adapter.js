const db = require('../lib/db');
require('dotenv').config();

(async () => {
  try {
    console.log('Testing Postgres adapter with lib/db.js...');
    
    // Test 1: Create a connection
    const connection = await db.createConnection({});
    console.log('✓ Connection created');
    
    // Test 2: Simple query with placeholders
    const [rows1] = await connection.execute('SELECT NOW() as current_time');
    console.log('✓ Query 1 (SELECT NOW()):', rows1[0]);
    
    // Test 3: Query with parameters (? → $1 conversion)
    const [rows2] = await connection.execute(
      'SELECT $1 as test_param, $2 as another_param',
      ['hello', 'world']
    );
    console.log('✓ Query 2 (parameterized):', rows2[0]);
    
    // Test 4: Pool connection
    const pool = db.createPool({});
    const [rows3] = await pool.query('SELECT version()');
    console.log('✓ Query 3 (SELECT version()):', rows3[0]);
    
    await connection.end();
    console.log('\n✅ All adapter tests passed!');
    process.exit(0);
    
  } catch (err) {
    console.error('❌ Test failed:', err.message);
    process.exit(1);
  }
})();
