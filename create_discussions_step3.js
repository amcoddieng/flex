const mysql = require('mysql2/promise');

async function createThirdTable() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: 'job_platform'
    });

    console.log('🔗 Connexion à la base de données établie');

    // Création de la troisième table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS project_discussion_reads (
          id INT AUTO_INCREMENT PRIMARY KEY,
          discussion_id INT NOT NULL,
          member_id INT NOT NULL,
          read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE KEY unique_discussion_member (discussion_id, member_id),
          FOREIGN KEY (discussion_id) REFERENCES project_discussions(id) ON DELETE CASCADE,
          FOREIGN KEY (member_id) REFERENCES student_profile(id) ON DELETE CASCADE,
          INDEX idx_discussion_reads_discussion (discussion_id),
          INDEX idx_discussion_reads_member (member_id)
      )
    `;

    await connection.query(createTableSQL);
    console.log('✅ Table project_discussion_reads créée avec succès');

    // Insertion de données de test
    const insertTestDataSQL = `
      INSERT INTO project_discussions (project_id, author_id, title, content, type, priority, status) VALUES
      (2, 11, 'Bienvenue dans l''équipe !', 'Félicitations pour avoir rejoint ce projet collaboratif. Présentons-nous et partageons nos objectifs.', 'general', 'medium', 'open'),
      (2, 11, 'Réunion de lancement', 'Proposition: Planifions une réunion de lancement la semaine prochaine pour définir les rôles et les prochaines étapes.', 'decision', 'high', 'open'),
      (2, 11, 'Objectif: Développement fonctionnel', 'Nous devons développer les fonctionnalités principales de l''application d''ici la fin du mois.', 'milestone', 'high', 'open')
      ON DUPLICATE KEY UPDATE title = VALUES(title)
    `;

    await connection.query(insertTestDataSQL);
    console.log('✅ Données de test insérées');

    // Insertion de commentaires de test
    const insertCommentsSQL = `
      INSERT INTO project_discussion_comments (discussion_id, author_id, content) VALUES
      (1, 11, 'Bienvenue ! Super motivé pour commencer ce projet.'),
      (2, 11, 'Excellente idée ! Je suis disponible pour la réunion.'),
      (3, 11, 'Ajoutons un délai pour la préparation.')
      ON DUPLICATE KEY UPDATE content = VALUES(content)
    `;

    await connection.query(insertCommentsSQL);
    console.log('✅ Commentaires de test insérés');

    // Vérification
    const [discussions] = await connection.query('SELECT COUNT(*) as count FROM project_discussions');
    const [comments] = await connection.query('SELECT COUNT(*) as count FROM project_discussion_comments');
    
    console.log(`📊 ${discussions[0].count} discussions trouvées`);
    console.log(`💬 ${comments[0].count} commentaires trouvés`);

    await connection.end();
    console.log('🎉 Étape 3 terminée ! Migration complète !');

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

createThirdTable();
