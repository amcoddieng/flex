const http = require('http');

// Test de l'API users
function testUsersAPI() {
  console.log('=== Test de l\'API PUT /api/admin/users/[id] ===');
  
  // Test 1: PUT sans paramètre (devrait retourner une erreur)
  const testData1 = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/users/1',
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBhZG1pbi5jb20iLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3MjQxNzE5ODksImV4cCI6MTcyNDI1ODM4OX0.W3sKdLzA8R9jzX3m2q7J8hF9kL7nX3m2q7J8hF9kL7n'
    }
  };

  const req1 = http.request(testData1, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log('\n1. Test PUT sans paramètre:');
      console.log('Status:', res.statusCode);
      console.log('Response:', data);
      
      // Test 2: PUT avec paramètre blocked=true
      testWithBlockedParam();
    });
  });

  req1.on('error', (err) => {
    console.error('Erreur test 1:', err.message);
    testWithBlockedParam();
  });

  req1.write('{}'); // Body vide
  req1.end();
}

function testWithBlockedParam() {
  const testData2 = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/users/1',
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBhZG1pbi5jb20iLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3MjQxNzE5ODksImV4cCI6MTcyNDI1ODM4OX0.W3sKdLzA8R9jzX3m2q7J8hF9kL7nX3m2q7J8hF9kL7n'
    }
  };

  const req2 = http.request(testData2, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log('\n2. Test PUT avec blocked=true:');
      console.log('Status:', res.statusCode);
      console.log('Response:', data);
      
      // Test 3: PUT avec paramètre blocked=false
      testWithBlockedFalse();
    });
  });

  req2.on('error', (err) => {
    console.error('Erreur test 2:', err.message);
    testWithBlockedFalse();
  });

  req2.write(JSON.stringify({ blocked: true }));
  req2.end();
}

function testWithBlockedFalse() {
  const testData3 = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/users/1',
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBhZG1pbi5jb20iLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3MjQxNzE5ODksImV4cCI6MTcyNDI1ODM4OX0.W3sKdLzA8R9jzX3m2q7J8hF9kL7nX3m2q7J8hF9kL7n'
    }
  };

  const req3 = http.request(testData3, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log('\n3. Test PUT avec blocked=false:');
      console.log('Status:', res.statusCode);
      console.log('Response:', data);
      
      console.log('\n=== Test terminé ===');
    });
  });

  req3.on('error', (err) => {
    console.error('Erreur test 3:', err.message);
    console.log('\n=== Test terminé avec erreurs ===');
  });

  req3.write(JSON.stringify({ blocked: false }));
  req3.end();
}

// Démarrer les tests
testUsersAPI();
