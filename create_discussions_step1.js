const mysql = require('mysql2/promise');

async function createFirstTable() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: 'job_platform'
    });

    console.log('🔗 Connexion à la base de données établie');

    // Création de la première table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS project_discussions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          project_id INT NOT NULL,
          author_id INT NOT NULL,
          title VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          type ENUM('general', 'decision', 'milestone', 'issue') DEFAULT 'general',
          priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
          status ENUM('open', 'closed', 'archived') DEFAULT 'open',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (project_id) REFERENCES collaborative_projects(id) ON DELETE CASCADE,
          FOREIGN KEY (author_id) REFERENCES student_profile(id) ON DELETE CASCADE,
          INDEX idx_project_discussions_project (project_id),
          INDEX idx_project_discussions_author (author_id),
          INDEX idx_project_discussions_status (status),
          INDEX idx_project_discussions_created (created_at)
      )
    `;

    await connection.query(createTableSQL);
    console.log('✅ Table project_discussions créée avec succès');

    await connection.end();
    console.log('🎉 Étape 1 terminée !');

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

createFirstTable();
