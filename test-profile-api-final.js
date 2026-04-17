// Test final de l'API profil étudiant avec token JWT valide
// Exécuter avec: node test-profile-api-final.js

const fetch = require('node-fetch');

async function testProfileAPIFinal() {
  console.log('=== Test Final API Profil Étudiant ===\n');

  // Token JWT valide pour l'étudiant Amadou Dieng (user_id: 56)
  const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU2LCJyb2xlIjoiU1RVREVOVCIsIm5hbWUiOiJBbWFkb3UgRGllbmciLCJlbWFpbCI6ImV0dWRpYW50QGV0dWRpYW50LmNvbSIsImlhdCI6MTc3NjA4MjAwMSwiaWF0YSI6bnVsbCwiaXNzIjpudWxsLCJ2YWxpZGF0aW9uU3RhdHVzIjoiVkFMSURBVEVEIiwiZXhwIjoxNzc2MTY4NDAxfQ.nTX4W5XtVtWmdf5m0ZJyCtJf4xKdBxhDXSl828UzqFg';

  try {
    // Test 1: Récupérer le profil
    console.log('1. Récupération du profil étudiant...');
    const profileResponse = await fetch('http://localhost:3000/api/student/profile', {
      headers: {
        'Authorization': `Bearer ${validToken}`,
        'Content-Type': 'application/json'
      }
    });

    const profileData = await profileResponse.json();
    console.log('Status:', profileResponse.status);
    
    if (profileResponse.status === 200 && profileData.success) {
      console.log('=== SUCCÈS - Profil récupéré ===');
      
      const student = profileData.student;
      console.log('\n--- INFORMATIONS DE BASE ---');
      console.log('ID:', student.id);
      console.log('User ID:', student.userId);
      console.log('Nom complet:', student.fullName);
      console.log('Email:', student.email);
      console.log('Téléphone:', student.phone || 'Non renseigné');
      console.log('Université:', student.university || 'Non renseigné');
      console.log('Département:', student.department || 'Non renseigné');
      console.log('Année d\'étude:', student.yearOfStudy || 'Non renseigné');
      console.log('Bio:', student.bio || 'Non renseignée');
      
      console.log('\n--- COMPÉTENCES ET SERVICES ---');
      console.log('Compétences:', Array.isArray(student.skills) ? student.skills.join(', ') : 'Aucune');
      console.log('Services:', Array.isArray(student.services) ? student.services.join(', ') : 'Aucun');
      console.log('Taux horaire:', student.hourlyRate ? `${student.hourlyRate}$/heure` : 'Non renseigné');
      
      console.log('\n--- STATISTIQUES CANDIDATURES ---');
      const apps = student.statistics.applications;
      console.log('Total candidatures:', apps.total);
      console.log('Acceptées:', apps.accepted);
      console.log('En attente:', apps.pending);
      console.log('Entretiens:', apps.interview);
      console.log('Refusées:', apps.rejected);
      console.log('Taux de succès:', `${apps.successRate}%`);
      console.log('Taux de réponse:', `${apps.responseRate}%`);
      
      console.log('\n--- ACTIVITÉ FORUM ---');
      const forum = student.statistics.forum;
      console.log('Sujets créés:', forum.topicsCreated);
      console.log('Réponses données:', forum.repliesGiven);
      console.log('Total likes sujets:', forum.totalTopicLikes);
      console.log('Total likes réponses:', forum.totalReplyLikes);
      
      console.log('\n--- NOTIFICATIONS ---');
      console.log('Notifications non lues:', student.statistics.notifications.unreadCount);
      
      console.log('\n--- CANDIDATURES RÉCENTES ---');
      if (student.recentApplications && student.recentApplications.length > 0) {
        student.recentApplications.slice(0, 3).forEach((app, index) => {
          console.log(`${index + 1}. ${app.jobTitle} chez ${app.company} - ${app.status}`);
        });
      } else {
        console.log('Aucune candidature récente');
      }

      // Test 2: Mettre à jour le profil
      console.log('\n\n2. Mise à jour du profil...');
      const updateData = {
        firstName: 'Amadou',
        lastName: 'Dieng',
        phone: '+221 77 123 45 67',
        university: 'Université Cheikh Anta Diop',
        department: 'FACULTE DES SCIENCES',
        yearOfStudy: 2,
        bio: 'Étudiant passionné par le développement web et les nouvelles technologies. Je recherche des opportunités pour développer mes compétences.',
        skills: ['JavaScript', 'React', 'Node.js', 'MySQL', 'HTML/CSS', 'TypeScript'],
        availability: {
          weekdays: ['morning', 'afternoon'],
          weekends: ['full-day']
        },
        services: ['Développement web', 'Tutorat informatique', 'Support technique', 'Création de sites'],
        hourlyRate: 15
      };

      const updateResponse = await fetch('http://localhost:3000/api/student/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${validToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      const updateResult = await updateResponse.json();
      console.log('Status:', updateResponse.status);
      
      if (updateResponse.status === 200 && updateResult.success) {
        console.log('=== SUCCÈS - Profil mis à jour ===');
        console.log('Message:', updateResult.message);
        
        // Test 3: Vérifier la mise à jour
        console.log('\n3. Vérification après mise à jour...');
        const verifyResponse = await fetch('http://localhost:3000/api/student/profile', {
          headers: {
            'Authorization': `Bearer ${validToken}`,
            'Content-Type': 'application/json'
          }
        });

        const verifyData = await verifyResponse.json();
        if (verifyResponse.status === 200 && verifyData.success) {
          console.log('=== VÉRIFICATION RÉUSSIE ===');
          const updated = verifyData.student;
          console.log('Bio mise à jour:', updated.bio);
          console.log('Compétences:', Array.isArray(updated.skills) ? updated.skills.length : 0, 'compétences');
          console.log('Services:', Array.isArray(updated.services) ? updated.services.length : 0, 'services');
          console.log('Taux horaire:', updated.hourlyRate ? `${updated.hourlyRate}$/heure` : 'Non défini');
        }
      } else {
        console.log('=== ÉCHEC MISE À JOUR ===');
        console.log('Error:', updateResult.error);
      }

    } else {
      console.log('=== ÉCHEC RÉCUPÉRATION ===');
      console.log('Error:', profileData.error);
    }

  } catch (error) {
    console.error('Erreur:', error.message);
  }

  console.log('\n=== TESTS TERMINÉS ===');
}

testProfileAPIFinal();
