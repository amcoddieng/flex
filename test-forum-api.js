const jwt = require('jsonwebtoken');

// Create a valid student token
const createStudentToken = () => {
  const payload = {
    userId: 4, // Our test student user ID
    email: 'student@test.com',
    role: 'STUDENT',
    firstName: 'Test',
    lastName: 'Student'
  };
  
  return jwt.sign(payload, 'cle_a_modifier', { expiresIn: '7d' });
};

const testForumAPIs = async () => {
  console.log('=== Testing Forum APIs ===');
  
  try {
    const token = createStudentToken();
    console.log('Token created for user ID 4 (student)');
    
    // Test 1: Get all topics
    console.log('\n1. Testing GET /api/student/forum/topics...');
    const topicsResponse = await fetch('http://localhost:3001/api/student/forum/topics', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const topicsData = await topicsResponse.json();
    console.log('Topics API Status:', topicsResponse.status);
    console.log('Topics Success:', topicsData.success);
    console.log('Topics Count:', topicsData.data?.length || 0);
    
    // Test 2: Create a new topic
    console.log('\n2. Testing POST /api/student/forum/topics...');
    const newTopicData = {
      title: 'Test Topic - Comment trouver un stage ?',
      content: 'Bonjour à tous ! Je suis en recherche de stage en développement web. Avez-vous des conseils pour bien préparer son CV et réussir les entretiens ?',
      category: 'Carrière',
      tags: 'stage, cv, entretien, conseil'
    };
    
    const createTopicResponse = await fetch('http://localhost:3001/api/student/forum/topics', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newTopicData)
    });
    
    const createTopicData = await createTopicResponse.json();
    console.log('Create Topic API Status:', createTopicResponse.status);
    console.log('Create Topic Success:', createTopicData.success);
    
    if (createTopicData.success) {
      const newTopicId = createTopicData.data.id;
      console.log('New Topic ID:', newTopicId);
      
      // Test 3: Like the new topic
      console.log('\n3. Testing POST /api/student/forum/topics/[id]/like...');
      const likeTopicResponse = await fetch(`http://localhost:3001/api/student/forum/topics/${newTopicId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const likeTopicData = await likeTopicResponse.json();
      console.log('Like Topic API Status:', likeTopicResponse.status);
      console.log('Like Topic Success:', likeTopicData.success);
      
      // Test 4: Get replies for the topic
      console.log('\n4. Testing GET /api/student/forum/topics/[id]/replies...');
      const repliesResponse = await fetch(`http://localhost:3001/api/student/forum/topics/${newTopicId}/replies`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const repliesData = await repliesResponse.json();
      console.log('Replies API Status:', repliesResponse.status);
      console.log('Replies Success:', repliesData.success);
      console.log('Replies Count:', repliesData.data?.length || 0);
      
      // Test 5: Add a reply to the topic
      console.log('\n5. Testing POST /api/student/forum/topics/[id]/replies...');
      const replyData = {
        content: 'Super question ! Pour ton CV, je te conseille de mettre en avant tes projets personnels et d\'utiliser des verbes d\'action. Pour les entretiens, prépare des exemples concrets de tes réalisations.'
      };
      
      const createReplyResponse = await fetch(`http://localhost:3001/api/student/forum/topics/${newTopicId}/replies`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(replyData)
      });
      
      const createReplyData = await createReplyResponse.json();
      console.log('Create Reply API Status:', createReplyResponse.status);
      console.log('Create Reply Success:', createReplyData.success);
      
      if (createReplyData.success) {
        const newReplyId = createReplyData.data.id;
        
        // Test 6: Like the reply
        console.log('\n6. Testing POST /api/student/forum/replies/[id]/like...');
        const likeReplyResponse = await fetch(`http://localhost:3001/api/student/forum/replies/${newReplyId}/like`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const likeReplyData = await likeReplyResponse.json();
        console.log('Like Reply API Status:', likeReplyResponse.status);
        console.log('Like Reply Success:', likeReplyData.success);
      }
    }
    
    // Test 7: Get topics again to see the new one
    console.log('\n7. Testing GET /api/student/forum/topics (after creation)...');
    const finalTopicsResponse = await fetch('http://localhost:3001/api/student/forum/topics', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const finalTopicsData = await finalTopicsResponse.json();
    console.log('Final Topics API Status:', finalTopicsResponse.status);
    console.log('Final Topics Success:', finalTopicsData.success);
    console.log('Final Topics Count:', finalTopicsData.data?.length || 0);
    
    if (finalTopicsData.success && finalTopicsData.data.length > 0) {
      console.log('\n=== Latest Topic ===');
      const latestTopic = finalTopicsData.data[0];
      console.log('Title:', latestTopic.title);
      console.log('Author:', latestTopic.author_name);
      console.log('Category:', latestTopic.category);
      console.log('Likes:', latestTopic.likes);
      console.log('Content:', latestTopic.content.substring(0, 100) + '...');
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
};

testForumAPIs();
