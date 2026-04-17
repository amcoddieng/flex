const mysql = require('mysql2/promise');

async function createInterviewApplication() {
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
    // Créer une candidature avec statut INTERVIEW
    const [result] = await connection.execute(
      `INSERT INTO job_application (
        job_id, 
        student_id, 
        status, 
        message, 
        availability, 
        experience, 
        start_date, 
        interview_date, 
        interview_time, 
        interview_location, 
        applied_at
      ) VALUES (?, ?, 'INTERVIEW', ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        3, // Job ID 3 (Data Analyst Senior)
        2, // Student ID 2
        "Je suis très intéressé par ce poste de Data Analyst. Mon expérience en analyse de données et mes compétences en SQL et Python correspondent parfaitement aux exigences.",
        "Disponible immédiatement",
        "3 ans d'expérience en data analysis avec Python, SQL et Power BI",
        "2026-05-01",
        "2026-04-25",
        "14:30",
        "Bureau principal, Dakar"
      ]
    );
    
    const applicationId = result.insertId;
    console.log('Created interview application with ID:', applicationId);
    console.log('Status: INTERVIEW');
    console.log('Interview Date: 2026-04-25');
    console.log('Interview Time: 14:30');
    console.log('Interview Location: Bureau principal, Dakar');
    
  } catch (error) {
    console.error('Error creating interview application:', error);
  } finally {
    await connection.end();
  }
}

createInterviewApplication();
