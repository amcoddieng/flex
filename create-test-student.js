const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function createTestStudent() {
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
    // Create user
    const hashedPassword = await bcrypt.hash('password123', 10);
    const [userResult] = await connection.execute(
      'INSERT INTO user (email, password, role) VALUES (?, ?, ?)',
      ['student@test.com', hashedPassword, 'STUDENT']
    );
    
    const userId = userResult.insertId;
    console.log('Created user with ID:', userId);

    // Create student profile
    const [profileResult] = await connection.execute(
      `INSERT INTO student_profile (user_id, first_name, last_name, email, phone, university, department, year_of_study) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, 'Test', 'Student', 'student@test.com', '771234567', 'Université de Dakar', 'Informatique', 3]
    );
    
    const profileId = profileResult.insertId;
    console.log('Created student profile with ID:', profileId);
    
    console.log('Test student created successfully!');
    console.log('Email: student@test.com');
    console.log('Password: password123');
    
  } catch (error) {
    console.error('Error creating test student:', error);
  } finally {
    await connection.end();
  }
}

createTestStudent();
