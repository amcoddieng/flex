const mysql = require('mysql2/promise');

async function createTestJob3() {
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
    // Create a third test job
    const [jobResult] = await connection.execute(
      `INSERT INTO job_offer (employer_id, title, location, description, company, service_type, salary, requirements, is_active, posted_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [1, 'Data Analyst Senior', 'Dakar', 'Nous recherchons un Data Analyst expérimenté pour analyser nos données business', 'DataCorp', 'Temps plein', '200000', '5+ ans expérience en data analysis, SQL, Python, Power BI', 1]
    );
    
    const jobId = jobResult.insertId;
    console.log('Created test job with ID:', jobId);
    console.log('Title: Data Analyst Senior');
    console.log('Company: DataCorp');
    
  } catch (error) {
    console.error('Error creating test job:', error);
  } finally {
    await connection.end();
  }
}

createTestJob3();
