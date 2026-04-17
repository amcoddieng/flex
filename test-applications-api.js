// Test de l'API GET /api/student/applications
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

const testApplicationsAPI = async () => {
  console.log('Testing GET /api/student/applications...');
  
  try {
    const token = createStudentToken();
    console.log('Token created for user ID 4 (student)');
    
    const response = await fetch('http://localhost:3001/api/student/applications', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    console.log('API Response:');
    console.log('Status:', response.status);
    console.log('Success:', data.success);
    console.log('Data length:', data.data?.length || 0);
    console.log('Pagination:', data.pagination);
    
    if (response.ok && data.success) {
      console.log('Applications found:');
      data.data.forEach((app, index) => {
        console.log(`${index + 1}. Job: ${app.job?.title} - Status: ${app.status}`);
      });
    } else {
      console.log('Error:', data.error);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
};

testApplicationsAPI();
