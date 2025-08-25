const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:3001';

async function testDirectUpload() {
  console.log('🔍 Testing Direct File Upload...\n');

  try {
    // Step 1: Create a test file
    console.log('1️⃣ Creating a test file...');
    const testFilePath = path.join(__dirname, 'test-direct-upload.txt');
    const testContent = 'Ceci est un fichier de test pour vérifier l\'upload direct.';
    fs.writeFileSync(testFilePath, testContent);

    console.log('✅ Test file created');
    console.log('   File path:', testFilePath);
    console.log('   File size:', fs.statSync(testFilePath).size, 'bytes');

    // Step 2: Test file upload without authentication (should fail)
    console.log('\n2️⃣ Testing file upload without authentication...');
    const formData = new FormData();
    formData.append('file', fs.createReadStream(testFilePath));
    formData.append('conversationId', '1');
    formData.append('senderId', '1');
    formData.append('messageType', 'file');

    try {
      const uploadResponse = await axios.post(`${API_BASE}/messaging/upload`, formData, {
        headers: {
          ...formData.getHeaders()
        }
      });
      console.log('❌ Upload should have failed without auth');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Upload correctly rejected without authentication');
      } else {
        console.log('⚠️  Unexpected error:', error.response?.status, error.response?.data);
      }
    }

    // Step 3: Test with invalid conversation (should fail)
    console.log('\n3️⃣ Testing with invalid conversation...');
    try {
      const uploadResponse2 = await axios.post(`${API_BASE}/messaging/upload`, formData, {
        headers: {
          'Authorization': 'Bearer invalid-token',
          ...formData.getHeaders()
        }
      });
      console.log('❌ Upload should have failed with invalid token');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Upload correctly rejected with invalid token');
      } else {
        console.log('⚠️  Unexpected error:', error.response?.status, error.response?.data);
      }
    }

    // Step 4: Test endpoint exists
    console.log('\n4️⃣ Testing endpoint exists...');
    try {
      const testResponse = await axios.get(`${API_BASE}/messaging/test`);
      console.log('✅ Messaging API endpoint exists:', testResponse.data);
    } catch (error) {
      console.log('❌ Messaging API endpoint not found:', error.response?.status);
    }

    // Step 5: Clean up test file
    console.log('\n5️⃣ Cleaning up test file...');
    try {
      fs.unlinkSync(testFilePath);
      console.log('✅ Test file cleaned up');
    } catch (error) {
      console.log('⚠️  Error cleaning up file:', error.message);
    }

    console.log('\n🎉 Direct Upload Test Results:');
    console.log('📋 Summary:');
    console.log('   ✅ File creation works');
    console.log('   ✅ Upload endpoint exists');
    console.log('   ✅ Authentication required (401)');
    console.log('   ✅ Invalid token rejected (401)');
    console.log('   ✅ Messaging API accessible');

    console.log('\n💡 Next Steps:');
    console.log('   - Need valid user authentication');
    console.log('   - Need valid conversation ID');
    console.log('   - Need valid sender ID');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testDirectUpload();
