// Test script for POST /api/student/applications
const jwt = require('jsonwebtoken');

// Create a test JWT token for a student
const createTestToken = () => {
  const payload = {
    userId: 4, // New test student user ID
    email: 'student@test.com',
    role: 'STUDENT',
    firstName: 'Test',
    lastName: 'Student'
  };
  
  return jwt.sign(payload, 'cle_a_modifier', { expiresIn: '1h' });
};

const testApplication = async () => {
  const token = createTestToken();
  
  try {
    const response = await fetch('http://localhost:3000/api/student/applications', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        job_id: 1
      })
    });
    
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', data);
    
  } catch (error) {
    console.error('Error:', error);
  }
};

testApplication();
