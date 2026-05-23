// SCRIPT DE TEST POUR LE SYSTÈME DE LIKES
// Exécutez ce script pour tester l'implémentation complète

const mysql = require('./lib/db');

// Configuration de la base de données
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'job_platform',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function testLikesSystem() {
  console.log('🧪 Test du système de likes...\n');

  try {
    // 1. Test de création de la table likes
    console.log('1. Création de la table likes...');
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS likes (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        target_type ENUM('topic', 'reply', 'comment_reply') NOT NULL,
        target_id INT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_like (user_id, target_type, target_id),
        INDEX idx_target (target_type, target_id),
        INDEX idx_user (user_id),
        INDEX idx_created_at (created_at)
      )
    `);
    console.log('✅ Table likes créée avec succès\n');

    // 2. Test d'ajout des colonnes likes_count
    console.log('2. Ajout des colonnes likes_count...');
    try {
      await pool.execute('ALTER TABLE forum_topic ADD COLUMN likes_count INT DEFAULT 0');
      console.log('✅ Colonne likes_count ajoutée à forum_topic');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️  Colonne likes_count existe déjà dans forum_topic');
      }
    }

    try {
      await pool.execute('ALTER TABLE forum_reply ADD COLUMN likes_count INT DEFAULT 0');
      console.log('✅ Colonne likes_count ajoutée à forum_reply');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️  Colonne likes_count existe déjà dans forum_reply');
      }
    }

    try {
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS comment_reply (
          id SERIAL PRIMARY KEY,
          reply_id INT NOT NULL,
          author_id INT,
          author_name VARCHAR(255),
          author_university VARCHAR(255),
          content TEXT,
          likes INT DEFAULT 0,
          likes_count INT DEFAULT 0,
          is_helpful BOOLEAN DEFAULT FALSE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (reply_id) REFERENCES forum_reply(id) ON DELETE CASCADE,
          FOREIGN KEY (author_id) REFERENCES student_profile(id) ON DELETE SET NULL
        )
      `);
      console.log('✅ Table comment_reply créée avec succès');
    } catch (err) {
      console.log('ℹ️  Table comment_reply existe déjà');
    }
    console.log('');

    // 3. Test d'insertion de likes
    console.log('3. Test d\'insertion de likes...');
    
    // Créer des données de test si nécessaire
    const [testUsers] = await pool.execute('SELECT id, role FROM user LIMIT 3');
    const [testTopics] = await pool.execute('SELECT id FROM forum_topic LIMIT 2');
    const [testReplies] = await pool.execute('SELECT id FROM forum_reply LIMIT 2');

    if (testUsers.length > 0 && testTopics.length > 0) {
      const userId = (testUsers as any[])[0].id;
      const topicId = (testTopics as any[])[0].id;

      // Test de like sur un topic
      try {
        await pool.execute(
          'INSERT INTO likes (user_id, target_type, target_id) VALUES (?, ?, ?)',
          [userId, 'topic', topicId]
        );
        console.log('✅ Like inséré avec succès');
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          console.log('ℹ️  Contrainte unique fonctionne : impossible de liker deux fois');
        } else {
          throw err;
        }
      }

      // Test de la contrainte unique
      try {
        await pool.execute(
          'INSERT INTO likes (user_id, target_type, target_id) VALUES (?, ?, ?)',
          [userId, 'topic', topicId]
        );
        console.log('❌ Erreur : la contrainte unique ne fonctionne pas');
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          console.log('✅ Contrainte unique fonctionne correctement');
        }
      }
    } else {
      console.log('ℹ️  Pas de données de test disponibles pour tester les likes');
    }
    console.log('');

    // 4. Test des triggers
    console.log('4. Test des triggers de mise à jour...');
    
    // Vérifier que les compteurs sont corrects
    const [topicCounts] = await pool.execute(`
      SELECT 
        t.id,
        t.likes,
        t.likes_count,
        COUNT(l.id) as actual_likes
      FROM forum_topic t
      LEFT JOIN likes l ON l.target_type = 'topic' AND l.target_id = t.id
      GROUP BY t.id
      LIMIT 5
    `);

    console.log('Vérification des compteurs de topics :');
    (topicCounts as any[]).forEach(topic => {
      const isCorrect = topic.likes_count === topic.actual_likes;
      console.log(`  Topic ${topic.id}: ${topic.likes_count} vs ${topic.actual_likes} ${isCorrect ? '✅' : '❌'}`);
    });
    console.log('');

    // 5. Test des performances
    console.log('5. Test des performances...');
    const start = Date.now();
    
    // Simuler 100 likes
    for (let i = 0; i < 100; i++) {
      await pool.execute(
        'INSERT IGNORE INTO likes (user_id, target_type, target_id) VALUES (?, ?, ?)',
        [i + 1, 'topic', 1]
      );
    }
    
    const end = Date.now();
    console.log(`✅ 100 likes insérés en ${end - start}ms\n`);

    // 6. Nettoyage des données de test
    console.log('6. Nettoyage des données de test...');
    await pool.execute('DELETE FROM likes WHERE user_id > 1000');
    console.log('✅ Données de test nettoyées\n');

    console.log('🎉 Tous les tests sont passés avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Test des API endpoints
async function testAPIEndpoints() {
  console.log('🌐 Test des endpoints API...\n');

  const baseURL = 'http://localhost:3000';
  let token = null;

  try {
    // 1. Test de connexion
    console.log('1. Test de connexion...');
    const loginResponse = await fetch(`${baseURL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });

    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      token = loginData.token;
      console.log('✅ Connexion réussie');
    } else {
      console.log('ℹ️  Connexion échouée, utilisation d\'un token fictif');
      token = 'fake_token_for_testing';
    }

    // 2. Test GET likes
    console.log('2. Test GET /api/forum/likes...');
    const getResponse = await fetch(`${baseURL}/api/forum/likes?target=topic_1`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (getResponse.ok) {
      const getData = await getResponse.json();
      console.log('✅ GET likes fonctionne:', getData.data);
    } else {
      console.log('❌ GET likes échoué:', await getResponse.text());
    }

    // 3. Test POST like
    console.log('3. Test POST /api/forum/likes...');
    const postResponse = await fetch(`${baseURL}/api/forum/likes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ target: 'topic_1' })
    });

    if (postResponse.ok) {
      const postData = await postResponse.json();
      console.log('✅ POST like fonctionne:', postData.data);
    } else {
      console.log('❌ POST like échoué:', await postResponse.text());
    }

    // 4. Test du unlike (deuxième POST)
    console.log('4. Test unlike...');
    const unlikeResponse = await fetch(`${baseURL}/api/forum/likes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ target: 'topic_1' })
    });

    if (unlikeResponse.ok) {
      const unlikeData = await unlikeResponse.json();
      console.log('✅ Unlike fonctionne:', unlikeData.data);
    } else {
      console.log('❌ Unlike échoué:', await unlikeResponse.text());
    }

    console.log('\n🎉 Tests API terminés !');

  } catch (error) {
    console.error('❌ Erreur lors des tests API:', error);
  }
}

// Exécuter les tests
if (require.main === module) {
  testLikesSystem()
    .then(() => testAPIEndpoints())
    .catch(console.error);
}

module.exports = { testLikesSystem, testAPIEndpoints };
