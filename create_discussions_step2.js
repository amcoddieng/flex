const mysql = require('mysql2/promise');

async function createSecondTable() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: 'job_platform'
    });

    console.log('🔗 Connexion à la base de données établie');

    // Création de la deuxième table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS project_discussion_comments (
          id SERIAL PRIMARY KEY,
          discussion_id INT NOT NULL,
          author_id INT NOT NULL,
          content TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (discussion_id) REFERENCES project_discussions(id) ON DELETE CASCADE,
          FOREIGN KEY (author_id) REFERENCES student_profile(id) ON DELETE CASCADE,
          INDEX idx_discussion_comments_discussion (discussion_id),
          INDEX idx_discussion_comments_author (author_id),
          INDEX idx_discussion_comments_created (created_at)
      )
    `;

    await connection.query(createTableSQL);
    console.log('✅ Table project_discussion_comments créée avec succès');

    await connection.end();
    console.log('🎉 Étape 2 terminée !');

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

createSecondTable();
