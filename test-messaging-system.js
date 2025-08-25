// test-messaging-system.js
// Script pour tester et diagnostiquer le système de messagerie

const axios = require('axios');

const API_BASE = 'http://localhost:3001';

async function testMessagingSystem() {
  console.log('🔍 Testing Messaging System...\n');

  try {
    // Step 1: Login as first user (admin)
    console.log('1️⃣ Logging in as admin...');
    const adminLoginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'mehdielabed69@gmail.com',
      password: 'anotherpassword123'
    });

    const adminToken = adminLoginResponse.data.accessToken;
    const adminUser = adminLoginResponse.data.user;
    console.log('✅ Admin login successful');
    console.log('   Admin ID:', adminUser.id);
    console.log('   Admin Name:', adminUser.firstName, adminUser.lastName);
    console.log('   Admin Role:', adminUser.role);

    // Step 2: Get available recipients for admin
    console.log('\n2️⃣ Getting available recipients for admin...');
    const recipientsResponse = await axios.get(`${API_BASE}/messaging/users/${adminUser.id}/available-recipients`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Available recipients loaded');
    console.log('   Recipients count:', recipientsResponse.data.length);
    recipientsResponse.data.forEach((recipient, index) => {
      console.log(`   ${index + 1}. ${recipient.first_name} ${recipient.last_name} (${recipient.role})`);
    });

    if (recipientsResponse.data.length === 0) {
      console.log('❌ No recipients available. Creating a test user...');
      
      // Create a test user if none exists
      const testUserResponse = await axios.post(`${API_BASE}/auth/register`, {
        firstName: 'Test',
        lastName: 'User',
        email: 'testuser@example.com',
        password: 'testpassword123',
        role: 'student'
      });
      
      console.log('✅ Test user created');
      console.log('   Test User ID:', testUserResponse.data.user.id);
    }

    // Step 3: Get conversations for admin
    console.log('\n3️⃣ Getting conversations for admin...');
    const conversationsResponse = await axios.get(`${API_BASE}/messaging/conversations?userId=${adminUser.id}`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Conversations loaded');
    console.log('   Conversations count:', conversationsResponse.data.length);

    // Step 4: Create a new conversation
    console.log('\n4️⃣ Creating a new conversation...');
    const testRecipient = recipientsResponse.data[0] || { id: 2 }; // Use first recipient or default to user ID 2
    
    const conversationResponse = await axios.post(`${API_BASE}/messaging/conversations/create-or-get`, {
      participant1Id: adminUser.id,
      participant2Id: testRecipient.id
    }, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Conversation created/retrieved');
    console.log('   Conversation ID:', conversationResponse.data.id);
    console.log('   Participant 1:', conversationResponse.data.participant1_id);
    console.log('   Participant 2:', conversationResponse.data.participant2_id);

    // Step 5: Send a message
    console.log('\n5️⃣ Sending a message...');
    const messageResponse = await axios.post(`${API_BASE}/messaging/messages`, {
      conversationId: conversationResponse.data.id,
      senderId: adminUser.id,
      content: 'Bonjour ! Ceci est un test du système de messagerie.',
      messageType: 'text'
    }, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Message sent successfully');
    console.log('   Message ID:', messageResponse.data.id);
    console.log('   Content:', messageResponse.data.content);
    console.log('   Sender ID:', messageResponse.data.sender_id);

    // Step 6: Get messages for the conversation
    console.log('\n6️⃣ Getting messages for the conversation...');
    const messagesResponse = await axios.get(`${API_BASE}/messaging/conversations/${conversationResponse.data.id}/messages`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Messages loaded');
    console.log('   Messages count:', messagesResponse.data.length);
    messagesResponse.data.forEach((message, index) => {
      console.log(`   ${index + 1}. [${message.sender_id}] ${message.content} (${message.created_at})`);
    });

    // Step 7: Test search functionality
    console.log('\n7️⃣ Testing search functionality...');
    const searchResponse = await axios.get(`${API_BASE}/messaging/search?conversationId=${conversationResponse.data.id}&query=test`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Search completed');
    console.log('   Search results count:', searchResponse.data.length);

    // Step 8: Mark message as read
    console.log('\n8️⃣ Marking message as read...');
    const markReadResponse = await axios.patch(`${API_BASE}/messaging/messages/${messageResponse.data.id}/read`, {}, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Message marked as read');

    // Step 9: Get contacts
    console.log('\n9️⃣ Getting contacts...');
    const contactsResponse = await axios.get(`${API_BASE}/messaging/users/${adminUser.id}/contacts`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Contacts loaded');
    console.log('   Contacts count:', contactsResponse.data.length);

    console.log('\n🎉 Messaging System Test Completed Successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ User authentication works');
    console.log('   ✅ Available recipients can be loaded');
    console.log('   ✅ Conversations can be created/retrieved');
    console.log('   ✅ Messages can be sent');
    console.log('   ✅ Messages can be retrieved');
    console.log('   ✅ Search functionality works');
    console.log('   ✅ Message read status can be updated');
    console.log('   ✅ Contacts can be loaded');
    console.log('\n🚀 The messaging system is ready for use in all dashboards!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Tip: Authentication issue - check JWT token');
    }
    
    if (error.response?.status === 400) {
      console.log('\n💡 Tip: Bad request - check request format');
    }
    
    if (error.response?.status === 404) {
      console.log('\n💡 Tip: Endpoint not found - check backend is running');
    }
    
    if (error.response?.status === 500) {
      console.log('\n💡 Tip: Server error - check backend logs');
    }
  }
}

// Run the test
testMessagingSystem();
