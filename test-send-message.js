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

const testSendMessage = async () => {
  console.log('Testing POST /api/student/conversations/3/messages...');
  
  try {
    const token = createStudentToken();
    console.log('Token created for user ID 4 (student)');
    
    const messageData = {
      content: 'Bonjour! Je suis très intéressé par cette offre. Quand pourrions-nous avoir un entretien?'
    };
    
    const response = await fetch('http://localhost:3001/api/student/conversations/3/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(messageData)
    });
    
    const data = await response.json();
    
    console.log('Response Status:', response.status);
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()));
    console.log('Response Body:', JSON.stringify(data, null, 2));
    
    if (!response.ok) {
      console.log('Error Details:', data.error);
      if (data.stack) console.log('Stack Trace:', data.stack);
    } else {
      console.log('✅ Message sent successfully!');
      console.log('Message ID:', data.data?.id);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
};

testSendMessage();
