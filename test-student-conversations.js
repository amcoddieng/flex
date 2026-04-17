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

const testStudentConversations = async () => {
  console.log('Testing GET /api/student/conversations...');
  
  try {
    const token = createStudentToken();
    console.log('Token created for user ID 4 (student)');
    
    const response = await fetch('http://localhost:3001/api/student/conversations', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    console.log('API Response:');
    console.log('Status:', response.status);
    console.log('Success:', data.success);
    console.log('Data length:', data.data?.length || 0);
    
    if (response.ok && data.success && data.data.length > 0) {
      console.log('\n=== Conversations Details ===');
      data.data.forEach((conv, index) => {
        console.log(`\n${index + 1}. Conversation ID: ${conv.id}`);
        console.log(`   Participant: ${conv.participant_name}`);
        console.log(`   Company: ${conv.participant_company}`);
        console.log(`   Offer ID: ${conv.offer_id}`);
        console.log(`   Last Message: ${conv.last_message || 'No message'}`);
        console.log(`   Created At: ${conv.last_message_at}`);
        console.log(`   Unread Count: ${conv.unread_count}`);
      });
      
      // Test messages for first conversation
      if (data.data.length > 0) {
        const firstConv = data.data[0];
        console.log(`\n=== Testing Messages for Conversation ${firstConv.id} ===`);
        
        const messagesResponse = await fetch(`http://localhost:3001/api/student/conversations/${firstConv.id}/messages`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const messagesData = await messagesResponse.json();
        console.log('Messages API Status:', messagesResponse.status);
        console.log('Messages Success:', messagesData.success);
        console.log('Messages Count:', messagesData.data?.length || 0);
        
        if (messagesResponse.ok && messagesData.success) {
          messagesData.data.forEach((msg, index) => {
            console.log(`\nMessage ${index + 1}:`);
            console.log(`  From: ${msg.sender_name}`);
            console.log(`  Content: ${msg.content}`);
            console.log(`  Time: ${msg.created_at}`);
          });
        }
      }
      
    } else {
      console.log('Error:', data.error);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
};

testStudentConversations();
