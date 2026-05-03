const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log('Test de l\'API PUT...');
    
    const response = await fetch('http://localhost:3000/api/student/projects/2', {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Test Update',
        description: 'Test Description'
      })
    });

    console.log('Status:', response.status);
    console.log('Headers:', response.headers.raw());
    
    const text = await response.text();
    console.log('Response body:', text);
    
  } catch (error) {
    console.error('Erreur:', error);
  }
}

testAPI();
