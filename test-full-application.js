// Test complet de l'API POST avec toutes les données de job_application
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

// Test complete application with all fields
const testCompleteApplication = async () => {
  console.log('Testing complete application with all fields...');
  
  try {
    // First, get job details to make sure it exists
    const jobResponse = await fetch('http://localhost:3000/api/jobs/2');
    const jobData = await jobResponse.json();
    
    if (!jobData.success) {
      console.error('Job not found:', jobData.error);
      return;
    }
    
    console.log('Job found:', jobData.data.title);
    
    // Now test complete application
    const token = createStudentToken();
    console.log('Token created for user ID 4 (student)');
    
    const completeApplicationData = {
      job_id: 2,
      message: "Je suis très intéressé par cette opportunité. Mon expérience en développement web correspond parfaitement aux exigences du poste.",
      availability: "Disponible immédiatement, flexible pour les horaires",
      experience: "3 ans d'expérience en développement full-stack avec React et Node.js",
      start_date: "2026-05-01",
      interview_date: "2026-04-25",
      interview_time: "14:00",
      interview_location: "Bureau principal, Dakar"
    };
    
    console.log('Sending application data:', JSON.stringify(completeApplicationData, null, 2));
    
    const appResponse = await fetch('http://localhost:3000/api/student/applications', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(completeApplicationData)
    });
    
    const appData = await appResponse.json();
    
    console.log('Application response:');
    console.log('Status:', appResponse.status);
    console.log('Data:', JSON.stringify(appData, null, 2));
    
    if (appResponse.status === 400 && appData.error === 'Vous avez déjà postulé à cette offre') {
      console.log('Duplicate protection working - testing with new job...');
      
      // Test with minimal data
      const minimalData = {
        job_id: 1,
        message: "Candidature simple"
      };
      
      const minimalResponse = await fetch('http://localhost:3000/api/student/applications', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(minimalData)
      });
      
      const minimalResult = await minimalResponse.json();
      console.log('Minimal application test:');
      console.log('Status:', minimalResponse.status);
      console.log('Data:', JSON.stringify(minimalResult, null, 2));
      
    } else if (appResponse.status === 201 && appData.success) {
      console.log('Complete application successful!');
      console.log('Application ID:', appData.data.id);
    } else {
      console.log('Application failed');
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
};

// Test invalid dates
const testInvalidDates = async () => {
  console.log('\nTesting invalid dates...');
  
  const token = createStudentToken();
  
  const invalidData = {
    job_id: 1,
    start_date: "invalid-date",
    interview_date: "also-invalid"
  };
  
  try {
    const response = await fetch('http://localhost:3000/api/student/applications', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(invalidData)
    });
    
    const data = await response.json();
    console.log('Invalid dates test:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('Invalid dates test failed:', error);
  }
};

// Run all tests
testCompleteApplication().then(() => {
  testInvalidDates();
});
