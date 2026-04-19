const mysql = require('mysql2/promise');

async function checkAdminDashboardData() {
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
    console.log('=== Checking Admin Dashboard Data ===');
    
    // Check total users by role
    const [usersByRole] = await connection.execute(`
      SELECT 
        u.role,
        COUNT(*) as count
      FROM user u
      GROUP BY u.role
    `);
    
    console.log('\n--- Users by Role ---');
    usersByRole.forEach((role) => {
      console.log(`${role.role}: ${role.count} users`);
    });
    
    // Check student profiles
    const [studentProfiles] = await connection.execute(`
      SELECT COUNT(*) as total_students
      FROM student_profile
    `);
    
    console.log('\n--- Student Profiles ---');
    console.log(`Total students: ${studentProfiles[0].total_students}`);
    
    // Check employer profiles
    const [employerProfiles] = await connection.execute(`
      SELECT COUNT(*) as total_employers,
             SUM(CASE WHEN validation_status = 'PENDING' THEN 1 ELSE 0 END) as pending_validations,
             SUM(CASE WHEN validation_status = 'APPROVED' THEN 1 ELSE 0 END) as approved_validations
      FROM employer_profile
    `);
    
    console.log('\n--- Employer Profiles ---');
    console.log(`Total employers: ${employerProfiles[0].total_employers}`);
    console.log(`Pending validations: ${employerProfiles[0].pending_validations}`);
    console.log(`Approved validations: ${employerProfiles[0].approved_validations}`);
    
    // Check job offers
    const [jobOffers] = await connection.execute(`
      SELECT COUNT(*) as total_jobs,
             COUNT(*) as active_jobs
      FROM job_offer
    `);
    
    console.log('\n--- Job Offers ---');
    console.log(`Total jobs: ${jobOffers[0].total_jobs}`);
    console.log(`Active jobs: ${jobOffers[0].active_jobs}`);
    
    // Check job applications
    const [jobApplications] = await connection.execute(`
      SELECT COUNT(*) as total_applications,
             SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending_applications,
             SUM(CASE WHEN status = 'INTERVIEW' THEN 1 ELSE 0 END) as interview_applications,
             SUM(CASE WHEN status = 'ACCEPTED' THEN 1 ELSE 0 END) as accepted_applications,
             SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END) as rejected_applications
      FROM job_application
    `);
    
    console.log('\n--- Job Applications ---');
    console.log(`Total applications: ${jobApplications[0].total_applications}`);
    console.log(`Pending: ${jobApplications[0].pending_applications}`);
    console.log(`Interview: ${jobApplications[0].interview_applications}`);
    console.log(`Accepted: ${jobApplications[0].accepted_applications}`);
    console.log(`Rejected: ${jobApplications[0].rejected_applications}`);
    
    // Check forum activity
    const [forumActivity] = await connection.execute(`
      SELECT 
        COUNT(DISTINCT ft.id) as total_topics,
        COUNT(DISTINCT fr.id) as total_replies,
        SUM(ft.likes) as total_topic_likes,
        SUM(fr.likes) as total_reply_likes
      FROM forum_topic ft
      LEFT JOIN forum_reply fr ON ft.id = fr.topic_id
    `);
    
    console.log('\n--- Forum Activity ---');
    console.log(`Total topics: ${forumActivity[0].total_topics}`);
    console.log(`Total replies: ${forumActivity[0].total_replies}`);
    console.log(`Total topic likes: ${forumActivity[0].total_topic_likes}`);
    console.log(`Total reply likes: ${forumActivity[0].total_reply_likes}`);
    
    // Check conversations
    const [conversations] = await connection.execute(`
      SELECT COUNT(*) as total_conversations,
             COUNT(DISTINCT student_id) as students_with_conversations,
             COUNT(DISTINCT employer_id) as employers_with_conversations
      FROM conversation
    `);
    
    console.log('\n--- Conversations ---');
    console.log(`Total conversations: ${conversations[0].total_conversations}`);
    console.log(`Students with conversations: ${conversations[0].students_with_conversations}`);
    console.log(`Employers with conversations: ${conversations[0].employers_with_conversations}`);
    
    // Check messages
    const [messages] = await connection.execute(`
      SELECT COUNT(*) as total_messages,
             SUM(CASE WHEN is_read = 0 THEN 1 ELSE 0 END) as unread_messages
      FROM message
    `);
    
    console.log('\n--- Messages ---');
    console.log(`Total messages: ${messages[0].total_messages}`);
    console.log(`Unread messages: ${messages[0].unread_messages}`);
    
    // Check monthly registrations
    const [monthlyRegistrations] = await connection.execute(`
      SELECT 
        COUNT(*) as this_month_registrations,
        DATE_FORMAT(created_at, '%Y-%m') as month
      FROM user
      WHERE created_at >= DATE_FORMAT(NOW(), '%Y-%m-01')
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
    `);
    
    console.log('\n--- Monthly Registrations ---');
    monthlyRegistrations.forEach((reg) => {
      console.log(`${reg.month}: ${reg.this_month_registrations} registrations`);
    });
    
  } catch (error) {
    console.error('Error checking admin data:', error);
  } finally {
    await connection.end();
  }
}

checkAdminDashboardData();
