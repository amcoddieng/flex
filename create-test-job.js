const mysql = require('mysql2/promise');

async function createTestJob() {
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
    // Create a new test job
    const [jobResult] = await connection.execute(
      `INSERT INTO job_offer (employer_id, title, location, description, company, service_type, salary, requirements, is_active, posted_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [1, 'Développeur React', 'Dakar', 'Nous recherchons un développeur React expérimenté', 'TechCompany', 'Temps plein', '150000', 'React 3+ ans, TypeScript, Node.js', 1]
    );
    
    const jobId = jobResult.insertId;
    console.log('Created test job with ID:', jobId);
    console.log('Title: Développeur React');
    console.log('Company: TechCompany');
    
  } catch (error) {
    console.error('Error creating test job:', error);
  } finally {
    await connection.end();
  }
}

createTestJob();
