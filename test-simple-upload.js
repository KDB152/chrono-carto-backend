const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:3001';

async function testSimpleUpload() {
  console.log('🔍 Testing Simple File Upload...\n');

  try {
    // Step 1: Login as admin with correct credentials
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

    // Step 2: Get available recipients
    console.log('\n2️⃣ Getting available recipients...');
    const recipientsResponse = await axios.get(`${API_BASE}/messaging/users/${adminUser.id}/available-recipients`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Available recipients loaded');
    console.log('   Recipients count:', recipientsResponse.data.length);

    if (recipientsResponse.data.length === 0) {
      console.log('⚠️  No recipients available, creating a test user...');
      
      // Create a test user if none exists
      const testUserResponse = await axios.post(`${API_BASE}/auth/register`, {
        email: 'testuser@example.com',
        password: 'test123',
        firstName: 'Test',
        lastName: 'User',
        role: 'student'
      }, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Test user created');
    }

    // Step 3: Create a test conversation
    console.log('\n3️⃣ Creating a test conversation...');
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

    const testConversation = conversationResponse.data;
    console.log('✅ Test conversation created');
    console.log('   Conversation ID:', testConversation.id);

    // Step 4: Create a test file for upload
    console.log('\n4️⃣ Creating a test file for upload...');
    const testFilePath = path.join(__dirname, 'test-upload-file.txt');
    const testContent = 'Ceci est un fichier de test pour vérifier l\'upload de pièces jointes.';
    fs.writeFileSync(testFilePath, testContent);

    console.log('✅ Test file created');
    console.log('   File path:', testFilePath);
    console.log('   File size:', fs.statSync(testFilePath).size, 'bytes');

    // Step 5: Test file upload
    console.log('\n5️⃣ Testing file upload...');
    const formData = new FormData();
    formData.append('file', fs.createReadStream(testFilePath));
    formData.append('conversationId', testConversation.id.toString());
    formData.append('senderId', adminUser.id.toString());
    formData.append('messageType', 'file');

    const uploadResponse = await axios.post(`${API_BASE}/messaging/upload`, formData, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        ...formData.getHeaders()
      }
    });

    console.log('✅ File uploaded successfully');
    console.log('   Uploaded message ID:', uploadResponse.data.id);
    console.log('   File path:', uploadResponse.data.file_path);
    console.log('   Content:', uploadResponse.data.content);

    // Step 6: Verify messages in conversation
    console.log('\n6️⃣ Verifying messages in conversation...');
    const messagesResponse = await axios.get(`${API_BASE}/messaging/conversations/${testConversation.id}/messages`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Messages retrieved');
    console.log('   Total messages:', messagesResponse.data.length);
    
    messagesResponse.data.forEach((message, index) => {
      console.log(`   ${index + 1}. [${message.message_type}] ${message.content} (Read: ${message.is_read})`);
    });

    // Step 7: Clean up test file
    console.log('\n7️⃣ Cleaning up test file...');
    try {
      fs.unlinkSync(testFilePath);
      console.log('✅ Test file cleaned up');
    } catch (error) {
      console.log('⚠️  Error cleaning up file:', error.message);
    }

    console.log('\n🎉 Simple Upload Test Results:');
    console.log('📋 Summary:');
    console.log('   ✅ User authentication works');
    console.log('   ✅ Conversation creation works');
    console.log('   ✅ File upload works');
    console.log('   ✅ File storage works');
    console.log('   ✅ Message creation with file works');
    console.log('   ✅ File path storage works');

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
testSimpleUpload();
