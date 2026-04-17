// Script pour tester si un étudiant a des candidatures
// Exécuter avec: node test-student-applications.js

const mysql = require('mysql2/promise');

async function testStudentApplications() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'job_platform',
  });

  try {
    console.log('🔍 Vérification des candidatures étudiantes...\n');

    // 1. Vérifier les étudiants dans la base
    const [students] = await connection.execute('SELECT id, user_id, first_name, last_name FROM student_profile LIMIT 5');
    console.log('📚 Étudiants trouvés:');
    students.forEach(student => {
      console.log(`  ID: ${student.id}, User ID: ${student.user_id}, Nom: ${student.first_name} ${student.last_name}`);
    });

    // 2. Vérifier toutes les candidatures
    const [applications] = await connection.execute(`
      SELECT 
        ja.id,
        ja.student_id,
        ja.status,
        ja.applied_at,
        sp.first_name,
        sp.last_name,
        jo.title
      FROM job_application ja
      JOIN student_profile sp ON ja.student_id = sp.id
      JOIN job_offer jo ON ja.job_id = jo.id
      ORDER BY ja.applied_at DESC
      LIMIT 10
    `);
    
    console.log('\n📋 Candidatures trouvées:');
    if (applications.length === 0) {
      console.log('  ❌ Aucune candidature trouvée dans la base de données');
    } else {
      applications.forEach(app => {
        console.log(`  ID: ${app.id}, Étudiant: ${app.first_name} ${app.last_name}, Poste: ${app.title}, Status: ${app.status}`);
      });
    }

    // 3. Vérifier par user_id (si on a un user_id spécifique)
    if (students.length > 0) {
      const testStudent = students[0];
      const [studentApps] = await connection.execute(`
        SELECT 
          ja.id,
          ja.student_id,
          ja.status,
          ja.applied_at,
          jo.title,
          jo.company
        FROM job_application ja
        JOIN job_offer jo ON ja.job_id = jo.id
        WHERE ja.student_id = ?
        ORDER BY ja.applied_at DESC
      `, [testStudent.id]);
      
      console.log(`\n🎯 Candidatures pour l'étudiant ${testStudent.first_name} ${testStudent.last_name} (ID: ${testStudent.id}):`);
      if (studentApps.length === 0) {
        console.log('  ❌ Aucune candidature pour cet étudiant');
      } else {
        studentApps.forEach(app => {
          console.log(`  • ${app.title} chez ${app.company} - ${app.status} (${app.applied_at})`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await connection.end();
  }
}

testStudentApplications();
