const jwt = require('jsonwebtoken');

// Create a valid admin token
const createAdminToken = () => {
  const payload = {
    userId: 1, // Our test admin user ID
    email: 'admin@test.com',
    role: 'ADMIN',
    firstName: 'Admin',
    lastName: 'Test'
  };
  
  return jwt.sign(payload, 'cle_a_modifier', { expiresIn: '7d' });
};

const testAdminStatsAPI = async () => {
  console.log('=== Testing Admin Stats API ===');
  
  try {
    const token = createAdminToken();
    console.log('Token created for user ID 1 (admin)');
    
    // Test GET /api/admin/stats
    console.log('\nTesting GET /api/admin/stats...');
    const response = await fetch('http://localhost:3001/api/admin/stats', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    console.log('API Response Status:', response.status);
    console.log('API Response Success:', data.success);
    
    if (response.ok && data.success) {
      console.log('\n=== Admin Statistics ===');
      
      // User statistics
      console.log('\n--- User Statistics ---');
      console.log(`Total Users: ${data.data.total_users}`);
      console.log(`Total Students: ${data.data.total_students}`);
      console.log(`Total Employers: ${data.data.total_employers}`);
      console.log(`Blocked Users: ${data.data.blocked_users}`);
      console.log(`New Users (7 days): ${data.data.new_users_last_7_days}`);
      console.log(`This Month Registrations: ${data.data.this_month_registrations}`);
      
      // Job statistics
      console.log('\n--- Job Statistics ---');
      console.log(`Total Jobs: ${data.data.total_jobs}`);
      console.log(`Active Jobs: ${data.data.active_jobs}`);
      
      // Validation statistics
      console.log('\n--- Validation Statistics ---');
      console.log(`Pending Students: ${data.data.pending_students}`);
      console.log(`Pending Employers: ${data.data.pending_employers}`);
      
      // Application statistics
      console.log('\n--- Application Statistics ---');
      console.log(`Total Applications: ${data.data.total_applications}`);
      console.log(`Pending Applications: ${data.data.pending_applications}`);
      console.log(`Interview Applications: ${data.data.interview_applications}`);
      console.log(`Accepted Applications: ${data.data.accepted_applications}`);
      console.log(`Rejected Applications: ${data.data.rejected_applications}`);
      
      // Forum statistics
      console.log('\n--- Forum Statistics ---');
      console.log(`Total Topics: ${data.data.total_topics}`);
      console.log(`Total Replies: ${data.data.total_replies}`);
      console.log(`Total Topic Likes: ${data.data.total_topic_likes}`);
      console.log(`Total Reply Likes: ${data.data.total_reply_likes}`);
      
      // Conversation statistics
      console.log('\n--- Conversation Statistics ---');
      console.log(`Total Conversations: ${data.data.total_conversations}`);
      console.log(`Students with Conversations: ${data.data.students_with_conversations}`);
      console.log(`Employers with Conversations: ${data.data.employers_with_conversations}`);
      
      // Message statistics
      console.log('\n--- Message Statistics ---');
      console.log(`Total Messages: ${data.data.total_messages}`);
      console.log(`Unread Messages: ${data.data.unread_messages}`);
      
      console.log('\n=== Dashboard Ready ===');
      console.log('Admin dashboard should now display real data from the database!');
      console.log('Access it at: http://localhost:3001/admin');
      
    } else {
      console.log('Error:', data.error);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
};

testAdminStatsAPI();
