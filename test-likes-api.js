// SCRIPT DE TEST POUR L'API LIKES
// Exécutez ce script pour tester si l'API fonctionne

const baseURL = 'http://localhost:3000';

async function testLikesAPI() {
  console.log('🧪 Test de l\'API Likes...\n');

  // 1. Test de connexion
  console.log('1. Test de connexion...');
  try {
    const loginResponse = await fetch(`${baseURL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com', // Remplacez par un email réel
        password: 'password123'    // Remplacez par un mot de passe réel
      })
    });

    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Connexion réussie');
      console.log('Token:', loginData.token ? 'OK' : 'MANQUANT');
      
      // 2. Test GET likes
      console.log('\n2. Test GET /api/forum/likes...');
      const getResponse = await fetch(`${baseURL}/api/forum/likes?target=topic_1`, {
        headers: { 'Authorization': `Bearer ${loginData.token}` }
      });

      if (getResponse.ok) {
        const getData = await getResponse.json();
        console.log('✅ GET likes fonctionne:', getData);
      } else {
        console.log('❌ GET likes échoué:', getResponse.status, await getResponse.text());
      }

      // 3. Test POST like
      console.log('\n3. Test POST /api/forum/likes...');
      const postResponse = await fetch(`${baseURL}/api/forum/likes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${loginData.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ target: 'topic_1' })
      });

      if (postResponse.ok) {
        const postData = await postResponse.json();
        console.log('✅ POST like fonctionne:', postData);
      } else {
        console.log('❌ POST like échoué:', postResponse.status, await postResponse.text());
      }

      // 4. Test du unlike (deuxième POST)
      console.log('\n4. Test unlike...');
      const unlikeResponse = await fetch(`${baseURL}/api/forum/likes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${loginData.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ target: 'topic_1' })
      });

      if (unlikeResponse.ok) {
        const unlikeData = await unlikeResponse.json();
        console.log('✅ Unlike fonctionne:', unlikeData);
      } else {
        console.log('❌ Unlike échoué:', unlikeResponse.status, await unlikeResponse.text());
      }

    } else {
      console.log('❌ Connexion échouée:', loginResponse.status, await loginResponse.text());
      console.log('⚠️  Utilisation d\'un token fictif pour les tests...');
      
      // Test avec token fictif
      await testWithFakeToken();
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

async function testWithFakeToken() {
  const fakeToken = 'fake_token_for_testing';
  
  console.log('\n🔄 Test avec token fictif...');
  
  try {
    const getResponse = await fetch(`${baseURL}/api/forum/likes?target=topic_1`, {
      headers: { 'Authorization': `Bearer ${fakeToken}` }
    });
    
    console.log('GET avec token fictif:', getResponse.status, await getResponse.text());
    
    const postResponse = await fetch(`${baseURL}/api/forum/likes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${fakeToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ target: 'topic_1' })
    });
    
    console.log('POST avec token fictif:', postResponse.status, await postResponse.text());
    
  } catch (error) {
    console.error('❌ Erreur avec token fictif:', error.message);
  }
}

// Test des routes de base du forum
async function testForumRoutes() {
  console.log('\n🌐 Test des routes du forum...');
  
  try {
    // Test GET topics
    const topicsResponse = await fetch(`${baseURL}/api/forum/topics`);
    console.log('GET /api/forum/topics:', topicsResponse.status);
    
    if (topicsResponse.ok) {
      const topicsData = await topicsResponse.json();
      console.log('✅ Topics récupérés:', topicsData.data?.length || 0);
    }
    
    // Test GET replies
    const repliesResponse = await fetch(`${baseURL}/api/forum/topics/1/replies`);
    console.log('GET /api/forum/topics/1/replies:', repliesResponse.status);
    
    if (repliesResponse.ok) {
      const repliesData = await repliesResponse.json();
      console.log('✅ Replies récupérées:', repliesData.data?.length || 0);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test des routes forum:', error.message);
  }
}

// Fonction principale
async function runAllTests() {
  console.log('🚀 Démarrage des tests complets...\n');
  
  await testForumRoutes();
  await testLikesAPI();
  
  console.log('\n🏁 Tests terminés !');
  console.log('\n📋 Si les tests échouent, vérifiez:');
  console.log('1. Que le serveur Next.js est démarré (npm run dev)');
  console.log('2. Que la base de données est accessible');
  console.log('3. Que les tables forum_topic et forum_reply existent');
  console.log('4. Que vous avez des données de test dans les tables');
  console.log('5. Que les variables d\'environnement DB_* sont correctes');
}

// Exécuter les tests
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { testLikesAPI, testForumRoutes };
