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

const debugMessagesAPI = async () => {
  console.log('Debugging GET /api/student/conversations/3/messages...');
  
  try {
    const token = createStudentToken();
    
    const response = await fetch('http://localhost:3001/api/student/conversations/3/messages', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    console.log('Response Status:', response.status);
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()));
    console.log('Response Body:', JSON.stringify(data, null, 2));
    
    if (!response.ok) {
      console.log('Error Details:', data.error);
      console.log('Stack Trace:', data.stack);
    }
    
  } catch (error) {
    console.error('Debug failed:', error);
  }
};

debugMessagesAPI();
