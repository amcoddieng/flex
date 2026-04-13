// Script de test pour vérifier les APIs étudiantes
// Exécuter avec: node debug-student-api.js

const fetch = require('node-fetch');

async function testStudentAPIs() {
  console.log('🔍 Test des APIs étudiantes...\n');

  // Test 1: Applications API
  try {
    console.log('📊 Test /api/student/applications');
    const appsResponse = await fetch('http://localhost:3000/api/student/applications', {
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      }
    });
    
    const appsData = await appsResponse.json();
    console.log('Status:', appsResponse.status);
    console.log('Response:', JSON.stringify(appsData, null, 2));
    console.log('✅ Applications API testé\n');
  } catch (error) {
    console.error('❌ Erreur Applications API:', error.message);
  }

  // Test 2: Jobs API
  try {
    console.log('💼 Test /api/job');
    const jobsResponse = await fetch('http://localhost:3000/api/job?page=1&limit=5', {
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      }
    });
    
    const jobsData = await jobsResponse.json();
    console.log('Status:', jobsResponse.status);
    console.log('Response:', JSON.stringify(jobsData, null, 2));
    console.log('✅ Jobs API testé\n');
  } catch (error) {
    console.error('❌ Erreur Jobs API:', error.message);
  }

  // Test 3: Forum Topics API
  try {
    console.log('💬 Test /api/forum/topics');
    const forumResponse = await fetch('http://localhost:3000/api/forum/topics', {
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      }
    });
    
    const forumData = await forumResponse.json();
    console.log('Status:', forumResponse.status);
    console.log('Response:', JSON.stringify(forumData, null, 2));
    console.log('✅ Forum API testé\n');
  } catch (error) {
    console.error('❌ Erreur Forum API:', error.message);
  }
}

testStudentAPIs();
