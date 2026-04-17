// Script pour tester l'API profil étudiant
// Exécuter avec: node test-student-profile-api.js

const fetch = require('node-fetch');

async function testStudentProfileAPI() {
  console.log('🔍 Test API Profil Étudiant...\n');

  // Test 1: Tenter d'accéder sans token
  try {
    console.log('📊 Test 1: Accès sans token');
    const noTokenResponse = await fetch('http://localhost:3000/api/student/profile', {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const noTokenData = await noTokenResponse.json();
    console.log('Status:', noTokenResponse.status);
    console.log('Response:', JSON.stringify(noTokenData, null, 2));
    console.log('✅ Test 1 terminé\n');
  } catch (error) {
    console.error('❌ Erreur Test 1:', error.message);
  }

  // Test 2: Tenter d'accéder avec token invalide
  try {
    console.log('📊 Test 2: Accès avec token invalide');
    const invalidTokenResponse = await fetch('http://localhost:3000/api/student/profile', {
      headers: {
        'Authorization': 'Bearer invalid-token-12345',
        'Content-Type': 'application/json'
      }
    });
    
    const invalidTokenData = await invalidTokenResponse.json();
    console.log('Status:', invalidTokenResponse.status);
    console.log('Response:', JSON.stringify(invalidTokenData, null, 2));
    console.log('✅ Test 2 terminé\n');
  } catch (error) {
    console.error('❌ Erreur Test 2:', error.message);
  }

  // Test 3: Tenter d'accéder avec un token étudiant valide (simulé)
  try {
    console.log('📊 Test 3: Accès avec token étudiant simulé');
    
    // Simuler un token JWT valide pour un étudiant
    const mockStudentToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU2LCJyb2xlIjoiU1RVREVOVCIsIm5hbWUiOiJBbWFkb3UgRGllbmciLCJlbWFpbCI6ImFtYWRvdS5kaWVuZ0BnbWFpbC5jb20iLCJpYXQiOjE3MTU5NjgwMCwiaWF0YSI6bnVsbCwiaXNzdWUiOm51bGwsInZhbGlkYXRpb25TdGF0dXMiOiJWQUxJREFFRCJ9.NQ';
    
    const validTokenResponse = await fetch('http://localhost:3000/api/student/profile', {
      headers: {
        'Authorization': `Bearer ${mockStudentToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const validTokenData = await validTokenResponse.json();
    console.log('Status:', validTokenResponse.status);
    console.log('Response:', JSON.stringify(validTokenData, null, 2));
    console.log('✅ Test 3 terminé\n');
  } catch (error) {
    console.error('❌ Erreur Test 3:', error.message);
  }

  // Test 4: Tenter de mettre à jour le profil
  try {
    console.log('📊 Test 4: Mise à jour profil');
    
    const mockStudentToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU2LCJyb2xlIjoiU1RVREVOVCIsIm5hbWUiOiJBbWFkb3UgRGllbmciLCJlbWFpbCI6ImFtYWRvdS5kaWVuZ0BnbWFpbC5jb20iLCJpYXQiOjE3MTU5NjgwMCwiaWF0YSI6bnVsbCwiaXNzdWUiOm51bGwsInZhbGlkYXRpb25TdGF0dXMiOiJWQUxJREFFRCJ9.NQ';
    
    const updateData = {
      firstName: 'Amadou',
      lastName: 'Dieng',
      phone: '+221 77 123 45 67',
      university: 'Université Cheikh Anta Diop',
      department: 'Informatique',
      yearOfStudy: 3,
      bio: 'Étudiant passionné par le développement web.',
      skills: ['JavaScript', 'React', 'Node.js', 'MySQL'],
      availability: {
        weekdays: ['morning', 'afternoon'],
        weekends: ['full-day']
      },
      services: ['Développement web', 'Tutorat informatique'],
      hourlyRate: 15
    };
    
    const updateResponse = await fetch('http://localhost:3000/api/student/profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${mockStudentToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });
    
    const updateDataResponse = await updateResponse.json();
    console.log('Status:', updateResponse.status);
    console.log('Response:', JSON.stringify(updateDataResponse, null, 2));
    console.log('✅ Test 4 terminé\n');
  } catch (error) {
    console.error('❌ Erreur Test 4:', error.message);
  }

  console.log('🎯 Tous les tests terminés !');
}

testStudentProfileAPI();
