const axios = require('axios');

const API_BASE = 'http://localhost:3001';

async function checkUsers() {
  console.log('🔍 Checking users in database...\n');

  try {
    // Test the messaging API first
    console.log('1️⃣ Testing messaging API...');
    const testResponse = await axios.get(`${API_BASE}/messaging/test`);
    console.log('✅ Messaging API working:', testResponse.data);

    // Try to register a new user
    console.log('\n2️⃣ Trying to register a new test user...');
    try {
      const registerResponse = await axios.post(`${API_BASE}/auth/register`, {
        email: 'testuser@example.com',
        password: 'testpassword123',
        firstName: 'Test',
        lastName: 'User',
        userType: 'student'
      });
      console.log('✅ User registered successfully:', registerResponse.data);
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('⚠️  User already exists');
      } else {
        console.log('❌ Registration failed:', error.response?.data);
      }
    }

    // Try to login with the test user
    console.log('\n3️⃣ Trying to login with test user...');
    try {
      const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
        email: 'testuser@example.com',
        password: 'testpassword123'
      });
      console.log('✅ Login successful:', {
        id: loginResponse.data.user.id,
        name: loginResponse.data.user.firstName + ' ' + loginResponse.data.user.lastName,
        role: loginResponse.data.user.role
      });
      
      const token = loginResponse.data.accessToken;
      
      // Test getting available recipients
      console.log('\n4️⃣ Testing available recipients...');
      const recipientsResponse = await axios.get(`${API_BASE}/messaging/users/${loginResponse.data.user.id}/available-recipients`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Available recipients:', recipientsResponse.data.length);
      if (recipientsResponse.data.length > 0) {
        recipientsResponse.data.forEach((user, index) => {
          console.log(`   ${index + 1}. ${user.first_name} ${user.last_name} (${user.role}) - ${user.email}`);
        });
      }

    } catch (error) {
      console.log('❌ Login failed:', error.response?.data);
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Run the check
checkUsers();
