const mysql = require('mysql2/promise');

async function checkStudentDashboardData() {
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
    console.log('=== Checking Student Dashboard Data ===');
    
    // Check student profiles
    const [students] = await connection.execute(`
      SELECT sp.id, sp.first_name, sp.last_name, sp.user_id, u.email, u.created_at
      FROM student_profile sp
      JOIN user u ON sp.user_id = u.id
      ORDER BY sp.created_at DESC
      LIMIT 5
    `);
    
    console.log('\n--- Student Profiles ---');
    console.log(`Total students: ${students.length}`);
    students.forEach((student, index) => {
      console.log(`${index + 1}. ${student.first_name} ${student.last_name} (${student.email}) - User ID: ${student.user_id}`);
    });
    
    // Check job applications for students
    const [applications] = await connection.execute(`
      SELECT ja.id, ja.student_id, ja.job_id, ja.status, ja.applied_at, jo.title as job_title
      FROM job_application ja
      JOIN job_offer jo ON ja.job_id = jo.id
      ORDER BY ja.applied_at DESC
      LIMIT 10
    `);
    
    console.log('\n--- Job Applications ---');
    console.log(`Total applications: ${applications.length}`);
    applications.forEach((app, index) => {
      console.log(`${index + 1}. Student ${app.student_id} - ${app.job_title} - Status: ${app.status}`);
    });
    
    // Check applications by status
    const [applicationsByStatus] = await connection.execute(`
      SELECT status, COUNT(*) as count
      FROM job_application
      GROUP BY status
    `);
    
    console.log('\n--- Applications by Status ---');
    applicationsByStatus.forEach((stat) => {
      console.log(`${stat.status}: ${stat.count}`);
    });
    
    // Check job offers available
    const [jobOffers] = await connection.execute(`
      SELECT COUNT(*) as total, 
             SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) as active
      FROM job_offer
    `);
    
    console.log('\n--- Job Offers ---');
    console.log(`Total offers: ${jobOffers[0].total}`);
    console.log(`Active offers: ${jobOffers[0].active}`);
    
    // Check conversations for students
    const [conversations] = await connection.execute(`
      SELECT c.id, c.student_id, c.employer_id, c.created_at, ep.company_name
      FROM conversation c
      LEFT JOIN employer_profile ep ON c.employer_id = ep.id
      ORDER BY c.created_at DESC
      LIMIT 5
    `);
    
    console.log('\n--- Conversations ---');
    console.log(`Total conversations: ${conversations.length}`);
    conversations.forEach((conv, index) => {
      console.log(`${index + 1}. Student ${conv.student_id} - ${conv.company_name || 'Company ' + conv.employer_id}`);
    });
    
    // Check forum topics
    const [forumTopics] = await connection.execute(`
      SELECT COUNT(*) as total, 
             SUM(CASE WHEN is_pinned = 1 THEN 1 ELSE 0 END) as pinned
      FROM forum_topic
    `);
    
    console.log('\n--- Forum Topics ---');
    console.log(`Total topics: ${forumTopics[0].total}`);
    console.log(`Pinned topics: ${forumTopics[0].pinned}`);
    
    // Check messages for students
    const [messages] = await connection.execute(`
      SELECT COUNT(*) as total,
             SUM(CASE WHEN is_read = 0 THEN 1 ELSE 0 END) as unread
      FROM message
    `);
    
    console.log('\n--- Messages ---');
    console.log(`Total messages: ${messages[0].total}`);
    console.log(`Unread messages: ${messages[0].unread}`);
    
    // Check notifications
    const [notifications] = await connection.execute(`
      SELECT COUNT(*) as total,
             SUM(CASE WHEN is_read = 0 THEN 1 ELSE 0 END) as unread
      FROM notification
    `);
    
    console.log('\n--- Notifications ---');
    console.log(`Total notifications: ${notifications[0].total}`);
    console.log(`Unread notifications: ${notifications[0].unread}`);
    
  } catch (error) {
    console.error('Error checking student data:', error);
  } finally {
    await connection.end();
  }
}

checkStudentDashboardData();
