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

const testDeleteApplication = async () => {
  console.log('=== Testing Delete Application ===');
  
  try {
    const token = createStudentToken();
    console.log('Token created for user ID 4 (student)');
    
    // First, get the list of applications to find one to delete
    console.log('\n1. Getting applications list...');
    const listResponse = await fetch('http://localhost:3001/api/student/applications', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const listData = await listResponse.json();
    console.log('Applications API Status:', listResponse.status);
    
    if (listResponse.ok && listData.success) {
      console.log(`Found ${listData.data.length} applications`);
      
      if (listData.data.length === 0) {
        console.log('No applications found to delete');
        return;
      }
      
      // Find a PENDING application to delete
      const pendingApp = listData.data.find(app => app.status === 'PENDING');
      if (!pendingApp) {
        console.log('No PENDING applications found to delete');
        console.log('Available applications:');
        listData.data.forEach(app => {
          console.log(`  - ID: ${app.id}, Status: ${app.status}, Job: ${app.job?.title}`);
        });
        return;
      }
      
      console.log(`Found PENDING application to delete: ID ${pendingApp.id} for job "${pendingApp.job?.title}"`);
      
      // Test deleting the application
      console.log(`\n2. Deleting application ID ${pendingApp.id}...`);
      const deleteResponse = await fetch(`http://localhost:3001/api/student/applications/${pendingApp.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const deleteData = await deleteResponse.json();
      console.log('Delete API Status:', deleteResponse.status);
      console.log('Delete API Success:', deleteData.success !== undefined ? deleteData.success : 'N/A');
      console.log('Delete API Message:', deleteData.message || deleteData.error);
      
      if (deleteResponse.ok) {
        console.log('Application deleted successfully!');
        
        // Verify it's gone
        console.log('\n3. Verifying deletion...');
        const verifyResponse = await fetch('http://localhost:3001/api/student/applications', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const verifyData = await verifyResponse.json();
        if (verifyResponse.ok && verifyData.success) {
          const stillExists = verifyData.data.find(app => app.id === pendingApp.id);
          if (stillExists) {
            console.log('ERROR: Application still exists after deletion!');
          } else {
            console.log('SUCCESS: Application no longer exists');
          }
        }
        
      } else {
        console.log('ERROR: Failed to delete application');
        console.log('Error details:', deleteData);
      }
      
    } else {
      console.log('ERROR: Failed to get applications list');
      console.log('Error details:', listData);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
};

testDeleteApplication();
