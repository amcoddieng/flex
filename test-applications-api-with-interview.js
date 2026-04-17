// Test de l'API GET /api/student/applications avec vérification des champs d'entretien
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
  console.log('Testing GET /api/student/applications with interview data...');
  
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
    
    if (response.ok && data.success && data.data.length > 0) {
      console.log('\n=== Applications Details ===');
      data.data.forEach((app, index) => {
        console.log(`\n${index + 1}. Application ID: ${app.id}`);
        console.log(`   Job: ${app.job?.title}`);
        console.log(`   Status: ${app.status}`);
        console.log(`   Applied At: ${app.applied_at}`);
        console.log(`   Interview Date: ${app.interview_date || 'Not set'}`);
        console.log(`   Interview Time: ${app.interview_time || 'Not set'}`);
        console.log(`   Interview Location: ${app.interview_location || 'Not set'}`);
        console.log(`   Cover Letter: ${app.cover_letter ? 'Yes' : 'No'}`);
        console.log(`   Job Type: ${app.job?.job_type}`);
        console.log(`   Company: ${app.job?.employer?.company_name}`);
      });
      
      // Vérifier spécifiquement les candidatures en entretien
      const interviewApplications = data.data.filter(app => app.status === 'INTERVIEW');
      console.log(`\n=== Interview Applications (${interviewApplications.length}) ===`);
      interviewApplications.forEach((app, index) => {
        console.log(`\nInterview ${index + 1}:`);
        console.log(`  Job: ${app.job?.title}`);
        console.log(`  Date: ${app.interview_date}`);
        console.log(`  Time: ${app.interview_time}`);
        console.log(`  Location: ${app.interview_location}`);
      });
      
    } else {
      console.log('Error:', data.error);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
};

testApplicationsAPI();
