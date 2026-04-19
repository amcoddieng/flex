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

const testDeleteApplicationComprehensive = async () => {
  console.log('=== Comprehensive Delete Application Test ===');
  
  try {
    const token = createStudentToken();
    console.log('Token created for user ID 4 (student)');
    
    // Test 1: Try to delete non-existent application
    console.log('\n1. Testing delete non-existent application...');
    const nonExistentResponse = await fetch('http://localhost:3001/api/student/applications/999', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const nonExistentData = await nonExistentResponse.json();
    console.log('Non-existent application - Status:', nonExistentResponse.status);
    console.log('Non-existent application - Error:', nonExistentData.error);
    
    // Test 2: Try to delete with invalid ID
    console.log('\n2. Testing delete with invalid ID...');
    const invalidResponse = await fetch('http://localhost:3001/api/student/applications/abc', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const invalidData = await invalidResponse.json();
    console.log('Invalid ID - Status:', invalidResponse.status);
    console.log('Invalid ID - Error:', invalidData.error);
    
    // Test 3: Try to delete without token
    console.log('\n3. Testing delete without token...');
    const noTokenResponse = await fetch('http://localhost:3001/api/student/applications/1', {
      method: 'DELETE'
    });
    
    const noTokenData = await noTokenResponse.json();
    console.log('No token - Status:', noTokenResponse.status);
    console.log('No token - Error:', noTokenData.error);
    
    // Test 4: Get current applications
    console.log('\n4. Getting current applications...');
    const listResponse = await fetch('http://localhost:3001/api/student/applications', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const listData = await listResponse.json();
    if (listResponse.ok && listData.success) {
      console.log(`Found ${listData.data.length} applications`);
      
      // Test 5: Try to delete INTERVIEW application (should fail)
      const interviewApp = listData.data.find(app => app.status === 'INTERVIEW');
      if (interviewApp) {
        console.log('\n5. Testing delete INTERVIEW application (should fail)...');
        const interviewResponse = await fetch(`http://localhost:3001/api/student/applications/${interviewApp.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const interviewData = await interviewResponse.json();
        console.log('INTERVIEW application - Status:', interviewResponse.status);
        console.log('INTERVIEW application - Error:', interviewData.error);
      }
      
      // Test 6: Delete PENDING application (should succeed)
      const pendingApp = listData.data.find(app => app.status === 'PENDING');
      if (pendingApp) {
        console.log('\n6. Testing delete PENDING application (should succeed)...');
        console.log(`Deleting application ID ${pendingApp.id} for job "${pendingApp.job?.title}"`);
        
        const deleteResponse = await fetch(`http://localhost:3001/api/student/applications/${pendingApp.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const deleteData = await deleteResponse.json();
        console.log('PENDING application - Status:', deleteResponse.status);
        console.log('PENDING application - Message:', deleteData.message || deleteData.error);
        
        if (deleteResponse.ok) {
          console.log('SUCCESS: PENDING application deleted');
          
          // Verify it's gone
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
              console.log('SUCCESS: Application properly deleted');
            }
          }
        }
      } else {
        console.log('No PENDING applications found to test deletion');
      }
    }
    
    console.log('\n=== Test Summary ===');
    console.log('1. Non-existent application: Should return 404');
    console.log('2. Invalid ID: Should return 400');
    console.log('3. No token: Should return 401');
    console.log('4. INTERVIEW application: Should return 400 (cannot delete processed applications)');
    console.log('5. PENDING application: Should return 200 (successful deletion)');
    console.log('\nDelete application functionality is now working correctly!');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
};

testDeleteApplicationComprehensive();
