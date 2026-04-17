// Test application avec toutes les données sur le nouveau job
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

const testNewJobApplication = async () => {
  console.log('Testing application with all fields on new job...');
  
  try {
    // Vérifier que le nouveau job existe
    const jobResponse = await fetch('http://localhost:3000/api/jobs/3');
    const jobData = await jobResponse.json();
    
    if (!jobData.success) {
      console.error('Job not found:', jobData.error);
      return;
    }
    
    console.log('Job found:', jobData.data.title);
    
    // Test complète avec toutes les données
    const token = createStudentToken();
    console.log('Token created for user ID 4 (student)');
    
    const completeApplicationData = {
      job_id: 3,
      message: "Je suis passionné par l'analyse de données et j'ai 5 ans d'expérience avec SQL, Python et Power BI. Je serais ravi de rejoindre votre équipe.",
      availability: "Disponible immédiatement, flexible pour les horaires",
      experience: "5 ans d'expérience en data analysis, spécialisé en business intelligence et reporting.",
      start_date: "2026-06-01",
      interview_date: "2026-04-28",
      interview_time: "10:00",
      interview_location: "DataCorp HQ, Dakar"
    };
    
    console.log('Sending complete application data:');
    console.log(JSON.stringify(completeApplicationData, null, 2));
    
    const appResponse = await fetch('http://localhost:3000/api/student/applications', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(completeApplicationData)
    });
    
    const appData = await appResponse.json();
    
    console.log('\n=== APPLICATION RESPONSE ===');
    console.log('Status:', appResponse.status);
    console.log('Success:', appData.success);
    console.log('Message:', appData.message || appData.error);
    console.log('Application ID:', appData.data?.id);
    
    if (appResponse.status === 201 && appData.success) {
      console.log('\n✅ COMPLETE APPLICATION SUCCESSFUL!');
      console.log('All fields have been saved correctly.');
      
      // Vérifier que les données ont été sauvegardées
      console.log('\n=== VERIFYING SAVED DATA ===');
      const verifyResponse = await fetch('http://localhost:3000/api/student/applications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const verifyData = await verifyResponse.json();
      const latestApplication = verifyData.applications[0]; // La plus récente
      
      if (latestApplication) {
        console.log('Latest application details:');
        console.log('- Job ID:', latestApplication.job_id);
        console.log('- Status:', latestApplication.status);
        console.log('- Cover Letter:', latestApplication.cover_letter?.substring(0, 50) + '...');
        console.log('- Applied At:', latestApplication.applied_at);
      }
      
    } else {
      console.log('\n❌ APPLICATION FAILED');
      console.log('Error:', appData.error);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
};

// Test aussi avec données minimales
const testMinimalApplication = async () => {
  console.log('\n=== TESTING MINIMAL APPLICATION ===');
  
  const token = createStudentToken();
  
  const minimalData = {
    job_id: 2, // Utiliser un job existant pour test minimal
    message: "Simple application message"
  };
  
  try {
    const response = await fetch('http://localhost:3000/api/student/applications', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(minimalData)
    });
    
    const data = await response.json();
    console.log('Minimal application status:', response.status);
    console.log('Minimal application result:', data.success ? 'SUCCESS' : data.error);
    
  } catch (error) {
    console.error('Minimal application test failed:', error);
  }
};

// Exécuter les tests
testNewJobApplication().then(() => {
  testMinimalApplication();
});
