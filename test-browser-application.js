// Test browser-based application
const jwt = require('jsonwebtoken');

// Create a proper student token
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

// Simulate browser localStorage and application
const testBrowserApplication = async () => {
  console.log('Testing browser-based application...');
  
  // First, get job details to make sure it exists
  try {
    const jobResponse = await fetch('http://localhost:3000/api/jobs/2');
    const jobData = await jobResponse.json();
    
    if (!jobData.success) {
      console.error('Job not found:', jobData.error);
      return;
    }
    
    console.log('Job found:', jobData.data.title);
    
    // Now test application
    const token = createStudentToken();
    console.log('Token created for user ID 4 (student)');
    
    const appResponse = await fetch('http://localhost:3000/api/student/applications', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        job_id: 2
      })
    });
    
    const appData = await appResponse.json();
    
    console.log('Application response:');
    console.log('Status:', appResponse.status);
    console.log('Data:', JSON.stringify(appData, null, 2));
    
    if (appResponse.status === 400 && appData.error === 'Vous avez déjà postulé à cette offre') {
      console.log('✅ Duplicate protection working correctly');
    } else if (appResponse.status === 201 && appData.success) {
      console.log('✅ Application successful');
    } else {
      console.log('❌ Application failed');
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
};

testBrowserApplication();
