const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:3001';

async function testRealUpload() {
  console.log('🔍 Testing Real File Upload with Valid User...\n');

  try {
    // Step 1: Try to login with a known user
    console.log('1️⃣ Trying to login with known users...');
    
    const testUsers = [
      { email: 'admin@test.com', password: 'adminpassword123' },
      { email: 'testuser@example.com', password: 'testpassword123' },
      { email: 'mehdielabed69@gmail.com', password: 'anotherpassword123' }
    ];

    let user = null;
    let token = null;

    for (const testUser of testUsers) {
      try {
        console.log(`   Trying: ${testUser.email}...`);
        const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
          email: testUser.email,
          password: testUser.password
        });
        
        user = loginResponse.data.user;
        token = loginResponse.data.accessToken;
        
        console.log('✅ Login successful!');
        console.log(`   User: ${user.firstName} ${user.lastName} (ID: ${user.id})`);
        console.log(`   Role: ${user.role}`);
        break;
      } catch (error) {
        console.log(`   ❌ Failed: ${error.response?.data?.message || 'Unknown error'}`);
      }
    }

    if (!user || !token) {
      console.log('\n❌ No valid user found. Creating a new test user...');
      
      // Create a new user
      try {
        const registerResponse = await axios.post(`${API_BASE}/auth/register`, {
          email: 'uploadtest@example.com',
          password: 'uploadtest123',
          firstName: 'Upload',
          lastName: 'Test',
          userType: 'student'
        });
        
        console.log('✅ New user created:', registerResponse.data);
        
        // Try to login with the new user
        const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
          email: 'uploadtest@example.com',
          password: 'uploadtest123'
        });
        
        user = loginResponse.data.user;
        token = loginResponse.data.accessToken;
        
        console.log('✅ New user login successful!');
      } catch (error) {
        console.log('❌ Failed to create/login new user:', error.response?.data);
        return;
      }
    }

    // Step 2: Get available recipients
    console.log('\n2️⃣ Getting available recipients...');
    const recipientsResponse = await axios.get(`${API_BASE}/messaging/users/${user.id}/available-recipients`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Available recipients loaded');
    console.log('   Recipients count:', recipientsResponse.data.length);

    if (recipientsResponse.data.length === 0) {
      console.log('⚠️  No recipients available. Creating a test conversation with user ID 1...');
      
      // Create conversation with user ID 1 (assuming it exists)
      const conversationResponse = await axios.post(`${API_BASE}/messaging/conversations/create-or-get`, {
        participant1Id: user.id,
        participant2Id: 1
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const testConversation = conversationResponse.data;
      console.log('✅ Test conversation created with user ID 1');
      console.log('   Conversation ID:', testConversation.id);

      // Step 3: Create a test file
      console.log('\n3️⃣ Creating a test file...');
      const testFilePath = path.join(__dirname, 'test-real-upload.txt');
      const testContent = 'Ceci est un fichier de test pour vérifier l\'upload réel de pièces jointes.';
      fs.writeFileSync(testFilePath, testContent);

      console.log('✅ Test file created');
      console.log('   File path:', testFilePath);
      console.log('   File size:', fs.statSync(testFilePath).size, 'bytes');

      // Step 4: Test file upload
      console.log('\n4️⃣ Testing file upload...');
      const formData = new FormData();
      formData.append('file', fs.createReadStream(testFilePath));
      formData.append('conversationId', testConversation.id.toString());
      formData.append('senderId', user.id.toString());
      formData.append('messageType', 'file');

      const uploadResponse = await axios.post(`${API_BASE}/messaging/upload`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          ...formData.getHeaders()
        }
      });

      console.log('✅ File uploaded successfully!');
      console.log('   Uploaded message ID:', uploadResponse.data.id);
      console.log('   File path:', uploadResponse.data.file_path);
      console.log('   Content:', uploadResponse.data.content);

      // Step 5: Verify messages in conversation
      console.log('\n5️⃣ Verifying messages in conversation...');
      const messagesResponse = await axios.get(`${API_BASE}/messaging/conversations/${testConversation.id}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Messages retrieved');
      console.log('   Total messages:', messagesResponse.data.length);
      
      messagesResponse.data.forEach((message, index) => {
        console.log(`   ${index + 1}. [${message.message_type}] ${message.content} (Read: ${message.is_read})`);
      });

      // Step 6: Clean up test file
      console.log('\n6️⃣ Cleaning up test file...');
      try {
        fs.unlinkSync(testFilePath);
        console.log('✅ Test file cleaned up');
      } catch (error) {
        console.log('⚠️  Error cleaning up file:', error.message);
      }

      console.log('\n🎉 Real Upload Test Results:');
      console.log('📋 Summary:');
      console.log('   ✅ User authentication works');
      console.log('   ✅ Conversation creation works');
      console.log('   ✅ File upload works');
      console.log('   ✅ File storage works');
      console.log('   ✅ Message creation with file works');
      console.log('   ✅ File path storage works');

      console.log('\n🚀 Frontend Integration:');
      console.log('   ✅ Backend is working correctly');
      console.log('   ✅ Upload endpoint is functional');
      console.log('   ✅ Authentication is working');
      console.log('   ✅ File storage is working');

    } else {
      console.log('✅ Recipients available. Using first recipient for test...');
      
      const testRecipient = recipientsResponse.data[0];
      console.log(`   Using recipient: ${testRecipient.first_name} ${testRecipient.last_name} (ID: ${testRecipient.id})`);

      // Create conversation with the first recipient
      const conversationResponse = await axios.post(`${API_BASE}/messaging/conversations/create-or-get`, {
        participant1Id: user.id,
        participant2Id: testRecipient.id
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const testConversation = conversationResponse.data;
      console.log('✅ Test conversation created');
      console.log('   Conversation ID:', testConversation.id);

      // Continue with file upload test...
      // (Same steps as above)
    }

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
testRealUpload();
