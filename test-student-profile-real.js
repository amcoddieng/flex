// Script pour tester l'API profil étudiant avec les vraies données
// Exécuter avec: node test-student-profile-real.js

const fetch = require('node-fetch');

async function testStudentProfileRealAPI() {
  console.log('=== Test API Profil Étudiant avec données réelles ===\n');

  // Token JWT pour l'étudiant Amadou Dieng (user_id: 56, student_id: 15)
  const realStudentToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU2LCJyb2xlIjoiU1RVREVOVCIsIm5hbWUiOiJBbWFkb3UgRGllbmciLCJlbWFpbCI6ImV0dWRpYW50QGV0dWRpYW50LmNvbSIsImlhdCI6MTcxNTk2ODAwLCJpYXRhIjpudWxsLCJpc3N1IjpudWxsLCJ2YWxpZGF0aW9uU3RhdHVzIjoiVkFMSURBVEVEIn0.NQ';

  try {
    console.log('1. Test récupération profil étudiant...');
    const profileResponse = await fetch('http://localhost:3000/api/student/profile', {
      headers: {
        'Authorization': `Bearer ${realStudentToken}`,
        'Content-Type': 'application/json'
      }
    });

    const profileData = await profileResponse.json();
    console.log('Status:', profileResponse.status);
    console.log('Response:', JSON.stringify(profileData, null, 2));

    if (profileResponse.status === 200 && profileData.success) {
      console.log('=== Succès ! Profil récupéré ===');
      console.log('Nom complet:', profileData.student.fullName);
      console.log('Email:', profileData.student.email);
      console.log('Université:', profileData.student.university);
      console.log('Département:', profileData.student.department);
      console.log('Année d\'étude:', profileData.student.yearOfStudy);
      console.log('Statistiques candidatures:', profileData.student.statistics.applications);
      console.log('Activité forum:', profileData.student.statistics.forum);
      console.log('Notifications non lues:', profileData.student.statistics.notifications.unreadCount);
    }

  } catch (error) {
    console.error('Erreur:', error.message);
  }

  console.log('\n2. Test mise à jour profil étudiant...');
  
  try {
    const updateData = {
      firstName: 'Amadou',
      lastName: 'Dieng',
      phone: '+221 77 123 45 67',
      university: 'Université Cheikh Anta Diop',
      department: 'FACULTE DES SCIENCES',
      yearOfStudy: 2,
      bio: 'Étudiant passionné par le développement web et les nouvelles technologies.',
      skills: ['JavaScript', 'React', 'Node.js', 'MySQL', 'HTML/CSS'],
      availability: {
        weekdays: ['morning', 'afternoon'],
        weekends: ['full-day']
      },
      services: ['Développement web', 'Tutorat informatique', 'Support technique'],
      hourlyRate: 15
    };

    const updateResponse = await fetch('http://localhost:3000/api/student/profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${realStudentToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });

    const updateDataResponse = await updateResponse.json();
    console.log('Status:', updateResponse.status);
    console.log('Response:', JSON.stringify(updateDataResponse, null, 2));

    if (updateResponse.status === 200 && updateDataResponse.success) {
      console.log('=== Succès ! Profil mis à jour ===');
      
      // Vérifier que les données ont bien été mises à jour
      console.log('\n3. Vérification après mise à jour...');
      const verifyResponse = await fetch('http://localhost:3000/api/student/profile', {
        headers: {
          'Authorization': `Bearer ${realStudentToken}`,
          'Content-Type': 'application/json'
        }
      });

      const verifyData = await verifyResponse.json();
      if (verifyResponse.status === 200 && verifyData.success) {
        console.log('Nouvelles données:');
        console.log('- Bio:', verifyData.student.bio);
        console.log('- Compétences:', verifyData.student.skills);
        console.log('- Services:', verifyData.student.services);
        console.log('- Taux horaire:', verifyData.student.hourlyRate);
      }
    }

  } catch (error) {
    console.error('Erreur mise à jour:', error.message);
  }

  console.log('\n=== Tests terminés ===');
}

testStudentProfileRealAPI();
