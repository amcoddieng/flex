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

const testStudentDashboard = async () => {
  console.log('=== Testing Student Dashboard ===');
  
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
      console.log('\n=== Dashboard Data Ready ===');
      console.log('The dashboard should now display:');
      console.log(`- Total Applications: ${data.data.applications.total}`);
      console.log(`- Pending Applications: ${data.data.applications.pending}`);
      console.log(`- Interview Applications: ${data.data.applications.interview}`);
      console.log(`- Unread Messages: ${data.data.messages.unread}`);
      console.log(`- Total Conversations: ${data.data.conversations.total}`);
      console.log(`- Available Job Offers: ${data.data.job_offers.total}`);
      console.log(`- Forum Topics: ${data.data.forum.topics}`);
      
      console.log('\n=== Recent Applications for Dashboard ===');
      if (data.data.recent_applications && data.data.recent_applications.length > 0) {
        console.log('Recent applications to display:');
        data.data.recent_applications.forEach((app, index) => {
          console.log(`${index + 1}. ${app.job_title} - ${app.company_name || 'N/A'} - Status: ${app.status} - Applied: ${app.applied_at}`);
        });
      }
      
      console.log('\n=== Dashboard Status ===');
      console.log('Dashboard is now ready with real data from the database!');
      console.log('Access it at: http://localhost:3001/student');
      
    } else {
      console.log('Error:', data.error);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
};

testStudentDashboard();
