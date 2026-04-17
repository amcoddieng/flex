// Script pour vérifier les données de l'étudiant Amadou Dieng (ID: 15)
// Exécuter avec: node check-student-data.js

const mysql = require('mysql2/promise');

async function checkStudentData() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: 'job_platform',
  });

  try {
    console.log('🔍 Vérification des données de l\'étudiant Amadou Dieng (ID: 15)...\n');

    // 1. Vérifier l'étudiant dans student_profile
    const [studentRows] = await connection.execute(`
      SELECT 
        sp.id,
        sp.user_id,
        sp.first_name,
        sp.last_name,
        sp.phone,
        sp.email,
        sp.university,
        sp.department,
        sp.year_of_study,
        sp.bio,
        sp.skills,
        sp.availability,
        sp.services,
        sp.hourly_rate,
        sp.profile_photo,
        sp.student_card_pdf,
        sp.validation_status,
        sp.rejection_reason,
        sp.created_at,
        u.email as user_email,
        u.created_at as account_created_at
      FROM student_profile sp
      JOIN user u ON sp.user_id = u.id
      WHERE sp.id = 15
    `);

    console.log('📚 Données student_profile:');
    if (studentRows.length > 0) {
      const student = studentRows[0];
      console.log('  ID:', student.id);
      console.log('  User ID:', student.user_id);
      console.log('  Prénom:', student.first_name);
      console.log('  Nom:', student.last_name);
      console.log('  Email (student):', student.email);
      console.log('  Email (user):', student.user_email);
      console.log('  Université:', student.university);
      console.log('  Département:', student.department);
      console.log('  Année d\'étude:', student.year_of_study);
      console.log('  Bio:', student.bio);
      console.log('  Compétences:', student.skills);
      console.log('  Disponibilité:', student.availability);
      console.log('  Services:', student.services);
      console.log('  Taux horaire:', student.hourly_rate);
      console.log('  Photo profil:', student.profile_photo);
      console.log('  Carte étudiante PDF:', student.student_card_pdf);
      console.log('  Statut validation:', student.validation_status);
      console.log('  Raison rejet:', student.rejection_reason);
      console.log('  Créé le:', student.created_at);
      console.log('  Compte créé le:', student.account_created_at);
    } else {
      console.log('  ❌ Aucune donnée trouvée pour l\'étudiant ID 15');
    }

    // 2. Vérifier les candidatures
    const [applicationsRows] = await connection.execute(`
      SELECT 
        ja.id,
        ja.job_id,
        ja.student_id,
        ja.status,
        ja.applied_at,
        ja.message as cover_letter,
        jo.title,
        jo.description,
        jo.location,
        jo.availability as job_type,
        jo.salary,
        jo.posted_at as job_created_at,
        ep.company_name,
        ep.contact_person,
        ep.email as employer_email,
        ep.phone as employer_phone
      FROM job_application ja
      JOIN job_offer jo ON ja.job_id = jo.id
      JOIN employer_profile ep ON jo.employer_id = ep.id
      WHERE ja.student_id = 15
      ORDER BY ja.applied_at DESC
    `);

    console.log('\n📋 Candidatures de l\'étudiant:');
    console.log(`  Total: ${applicationsRows.length} candidature(s)`);
    applicationsRows.forEach((app, index) => {
      console.log(`  ${index + 1}. ${app.title} chez ${app.company_name} - ${app.status} (${app.applied_at})`);
    });

    // 3. Vérifier l'activité forum
    const [forumTopicsRows] = await connection.execute(`
      SELECT 
        ft.id,
        ft.author_id,
        ft.author_name,
        ft.author_university,
        ft.author_department,
        ft.category,
        ft.title,
        ft.content,
        ft.tags,
        ft.likes,
        ft.is_pinned,
        ft.created_at
      FROM forum_topic ft
      WHERE ft.author_id = 15
      ORDER BY ft.created_at DESC
    `);

    console.log('\n💬 Activité forum:');
    console.log(`  Total: ${forumTopicsRows.length} sujet(s) créé(s)`);
    forumTopicsRows.slice(0, 3).forEach((topic, index) => {
      console.log(`  ${index + 1}. ${topic.title} - ${topic.likes} likes (${topic.created_at})`);
    });

    // 4. Vérifier les réponses forum
    const [forumRepliesRows] = await connection.execute(`
      SELECT 
        fr.id,
        fr.topic_id,
        fr.author_id,
        fr.author_name,
        fr.author_university,
        fr.content,
        fr.likes,
        fr.is_helpful,
        fr.created_at
      FROM forum_reply fr
      WHERE fr.author_id = 15
      ORDER BY fr.created_at DESC
    `);

    console.log('\n💬 Réponses forum:');
    console.log(`  Total: ${forumRepliesRows.length} réponse(s) donnée(s)`);
    forumRepliesRows.slice(0, 3).forEach((reply, index) => {
      console.log(`  ${index + 1}. Réponse à sujet ${reply.topic_id} - ${reply.likes} likes (${reply.created_at})`);
    });

    // 5. Vérifier les notifications
    const [notificationsRows] = await connection.execute(`
      SELECT 
        n.id,
        n.user_id,
        n.type,
        n.title,
        n.message,
        n.is_read,
        n.created_at,
        n.metadata
      FROM notification n
      WHERE n.user_id = (SELECT user_id FROM student_profile WHERE id = 15)
      ORDER BY n.created_at DESC
      LIMIT 5
    `);

    console.log('\n🔔 Notifications:');
    console.log(`  Total: ${notificationsRows.length} notification(s)`);
    notificationsRows.forEach((notif, index) => {
      console.log(`  ${index + 1}. ${notif.type}: ${notif.title} - ${notif.is_read ? 'Lue' : 'Non lue'} (${notif.created_at})`);
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await connection.end();
  }
}

checkStudentData();
