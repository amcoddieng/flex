const jwt = require('jsonwebtoken');

// Create a valid student token
const createStudentToken = () => {
  const payload = {
    userId: 4, // Our test student user ID
    email: 'student@test.com',
    role: 'STUDENT',
    firstName: 'Test',
    lastName: 'Student'
  };
  
  return jwt.sign(payload, 'cle_a_modifier', { expiresIn: '7d' });
};

const testStudentStatsAPI = async () => {
  console.log('=== Testing Student Stats API ===');
  
  try {
    const token = createStudentToken();
    console.log('Token created for user ID 4 (student)');
    
    // Test GET /api/student/stats
    console.log('\nTesting GET /api/student/stats...');
    const response = await fetch('http://localhost:3001/api/student/stats', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    console.log('API Response Status:', response.status);
    console.log('API Response Success:', data.success);
    
    if (response.ok && data.success) {
      console.log('\n=== Student Statistics ===');
      
      // Applications stats
      console.log('\n--- Applications ---');
      console.log(`Total: ${data.data.applications.total}`);
      console.log(`Pending: ${data.data.applications.pending}`);
      console.log(`Interview: ${data.data.applications.interview}`);
      console.log(`Accepted: ${data.data.applications.accepted}`);
      console.log(`Rejected: ${data.data.applications.rejected}`);
      console.log(`Last application: ${data.data.applications.last_application_date}`);
      
      // Conversations stats
      console.log('\n--- Conversations ---');
      console.log(`Total: ${data.data.conversations.total}`);
      console.log(`New (7 days): ${data.data.conversations.new}`);
      
      // Messages stats
      console.log('\n--- Messages ---');
      console.log(`Total: ${data.data.messages.total}`);
      console.log(`Unread: ${data.data.messages.unread}`);
      
      // Job offers stats
      console.log('\n--- Job Offers ---');
      console.log(`Available: ${data.data.job_offers.total}`);
      
      // Forum stats
      console.log('\n--- Forum ---');
      console.log(`Topics: ${data.data.forum.topics}`);
      console.log(`Recent topics (7 days): ${data.data.forum.recent_topics}`);
      
      // Notifications stats
      console.log('\n--- Notifications ---');
      console.log(`Total: ${data.data.notifications.total}`);
      console.log(`Unread: ${data.data.notifications.unread}`);
      
      // Recent applications
      console.log('\n--- Recent Applications ---');
      if (data.data.recent_applications && data.data.recent_applications.length > 0) {
        data.data.recent_applications.forEach((app, index) => {
          console.log(`${index + 1}. ${app.job_title} - ${app.company_name || 'N/A'} - Status: ${app.status}`);
        });
      } else {
        console.log('No recent applications');
      }
      
    } else {
      console.log('Error:', data.error);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
};

testStudentStatsAPI();
