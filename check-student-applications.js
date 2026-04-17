const mysql = require('mysql2/promise');

async function checkStudentApplications() {
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
    // Vérifier toutes les candidatures
    console.log('=== Toutes les candidatures ===');
    const [allApplications] = await connection.execute(
      `SELECT ja.id, ja.job_id, ja.student_id, ja.status, ja.applied_at, ja.interview_date, ja.interview_time, ja.interview_location,
              jo.title, sp.user_id
       FROM job_application ja
       JOIN job_offer jo ON ja.job_id = jo.id
       JOIN student_profile sp ON ja.student_id = sp.id
       ORDER BY ja.applied_at DESC`
    );
    
    console.log(`Total applications: ${allApplications.length}`);
    allApplications.forEach((app, index) => {
      console.log(`\n${index + 1}. Application ID: ${app.id}`);
      console.log(`   User ID: ${app.user_id}`);
      console.log(`   Student ID: ${app.student_id}`);
      console.log(`   Job ID: ${app.job_id}`);
      console.log(`   Job: ${app.title}`);
      console.log(`   Status: ${app.status}`);
      console.log(`   Applied At: ${app.applied_at}`);
      console.log(`   Interview Date: ${app.interview_date}`);
      console.log(`   Interview Time: ${app.interview_time}`);
      console.log(`   Interview Location: ${app.interview_location}`);
    });
    
    // Vérifier spécifiquement pour l'utilisateur 4
    console.log('\n=== Candidatures pour l utilisateur 4 ===');
    const [user4Applications] = await connection.execute(
      `SELECT ja.id, ja.job_id, ja.student_id, ja.status, ja.applied_at, ja.interview_date, ja.interview_time, ja.interview_location,
              jo.title, sp.user_id
       FROM job_application ja
       JOIN job_offer jo ON ja.job_id = jo.id
       JOIN student_profile sp ON ja.student_id = sp.id
       WHERE sp.user_id = 4
       ORDER BY ja.applied_at DESC`
    );
    
    console.log(`Applications for user 4: ${user4Applications.length}`);
    user4Applications.forEach((app, index) => {
      console.log(`\n${index + 1}. Application ID: ${app.id}`);
      console.log(`   Job: ${app.title}`);
      console.log(`   Status: ${app.status}`);
      console.log(`   Interview Date: ${app.interview_date}`);
      console.log(`   Interview Time: ${app.interview_time}`);
      console.log(`   Interview Location: ${app.interview_location}`);
    });
    
  } catch (error) {
    console.error('Error checking applications:', error);
  } finally {
    await connection.end();
  }
}

checkStudentApplications();
