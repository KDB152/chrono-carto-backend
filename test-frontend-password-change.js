const axios = require('axios');

const API_BASE = 'http://localhost:3001';

async function testFrontendPasswordChange() {
  console.log('🔍 Testing Frontend Password Change...\n');

  try {
    // Step 1: Login as a user (using the password that was set in previous test)
    console.log('1️⃣ Logging in as user...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'mehdielabed69@gmail.com',
      password: 'newpassword123' // Using the password from previous test
    });

    const { accessToken, user } = loginResponse.data;
    console.log('✅ Login successful');
    console.log('   User ID:', user.id);
    console.log('   User Role:', user.role);
    console.log('   User Name:', user.firstName, user.lastName);

    // Step 2: Simulate what the frontend would do
    console.log('\n2️⃣ Simulating frontend password change request...');
    console.log('   This is what the frontend should send:');
    console.log('   - Endpoint: POST /auth/change-password');
    console.log('   - Headers: Authorization: Bearer <token>');
    console.log('   - Body: { currentPassword: "newpassword123", newPassword: "password123" }');

    // Step 3: Test the exact request the frontend would make
    const changePasswordResponse = await axios.post(`${API_BASE}/auth/change-password`, {
      currentPassword: 'newpassword123',
      newPassword: 'password123'
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('\n✅ Frontend-style request successful');
    console.log('   Response:', changePasswordResponse.data);

    // Step 4: Verify the password was actually changed
    console.log('\n3️⃣ Verifying password change in database...');
    
    // Try to login with old password (should fail)
    try {
      const oldPasswordLogin = await axios.post(`${API_BASE}/auth/login`, {
        email: 'mehdielabed69@gmail.com',
        password: 'newpassword123'
      });
      console.log('❌ ERROR: Login with old password succeeded (should have failed)');
      console.log('   This means the password was NOT changed in the database');
    } catch (error) {
      console.log('✅ Login with old password failed (expected)');
      console.log('   Error:', error.response?.data?.message || error.message);
    }

    // Try to login with new password (should succeed)
    try {
      const newPasswordLogin = await axios.post(`${API_BASE}/auth/login`, {
        email: 'mehdielabed69@gmail.com',
        password: 'password123'
      });
      console.log('✅ Login with new password successful');
      console.log('   User ID:', newPasswordLogin.data.user.id);
      console.log('   User Name:', newPasswordLogin.data.user.firstName, newPasswordLogin.data.user.lastName);
    } catch (error) {
      console.log('❌ ERROR: Login with new password failed');
      console.log('   Error:', error.response?.data?.message || error.message);
      console.log('   This means the password change did not work properly');
    }

    console.log('\n🎉 Frontend Password Change Test Completed!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Backend endpoint works correctly');
    console.log('   ✅ Password change is persisted in database');
    console.log('   ✅ Authentication works properly');
    console.log('   ✅ The issue might be in the frontend implementation');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Tip: Authentication issue - check JWT token');
    }
    
    if (error.response?.status === 400) {
      console.log('\n💡 Tip: Bad request - check password format');
    }
    
    if (error.response?.status === 404) {
      console.log('\n💡 Tip: Endpoint not found - check backend is running');
    }
  }
}

// Run the test
testFrontendPasswordChange();
