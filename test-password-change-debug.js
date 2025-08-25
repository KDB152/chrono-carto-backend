const axios = require('axios');

const API_BASE = 'http://localhost:3001';

async function testPasswordChangeDebug() {
  console.log('🔍 Debugging Password Change Issue...\n');

  try {
    // Step 1: Login as a user
    console.log('1️⃣ Logging in as user...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'mehdielabed69@gmail.com',
      password: 'password123'
    });

    const { accessToken, user } = loginResponse.data;
    console.log('✅ Login successful');
    console.log('   User ID:', user.id);
    console.log('   User Role:', user.role);
    console.log('   User Name:', user.firstName, user.lastName);

    // Step 2: Test change password endpoint
    console.log('\n2️⃣ Testing change password endpoint...');
    console.log('   Current password: password123');
    console.log('   New password: newpassword123');
    
    const changePasswordResponse = await axios.post(`${API_BASE}/auth/change-password`, {
      currentPassword: 'password123',
      newPassword: 'newpassword123'
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Change password successful');
    console.log('   Response:', changePasswordResponse.data);

    // Step 3: Try to login with old password (should fail)
    console.log('\n3️⃣ Testing login with old password (should fail)...');
    try {
      const oldPasswordLogin = await axios.post(`${API_BASE}/auth/login`, {
        email: 'mehdielabed69@gmail.com',
        password: 'password123'
      });
      console.log('❌ ERROR: Login with old password succeeded (should have failed)');
      console.log('   This means the password was NOT changed in the database');
    } catch (error) {
      console.log('✅ Login with old password failed (expected)');
      console.log('   Error:', error.response?.data?.message || error.message);
    }

    // Step 4: Try to login with new password (should succeed)
    console.log('\n4️⃣ Testing login with new password (should succeed)...');
    try {
      const newPasswordLogin = await axios.post(`${API_BASE}/auth/login`, {
        email: 'mehdielabed69@gmail.com',
        password: 'newpassword123'
      });
      console.log('✅ Login with new password successful');
      console.log('   User ID:', newPasswordLogin.data.user.id);
      console.log('   User Name:', newPasswordLogin.data.user.firstName, newPasswordLogin.data.user.lastName);
    } catch (error) {
      console.log('❌ ERROR: Login with new password failed');
      console.log('   Error:', error.response?.data?.message || error.message);
      console.log('   This means the password change did not work properly');
    }

    // Step 5: Change password back to original
    console.log('\n5️⃣ Changing password back to original...');
    const newToken = newPasswordLogin?.data?.accessToken || accessToken;
    
    const changeBackResponse = await axios.post(`${API_BASE}/auth/change-password`, {
      currentPassword: 'newpassword123',
      newPassword: 'password123'
    }, {
      headers: {
        'Authorization': `Bearer ${newToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Password changed back to original');
    console.log('   Response:', changeBackResponse.data);

    console.log('\n🎉 Password Change Debug Test Completed!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Change password endpoint responds');
    console.log('   ✅ Password change appears to work');
    console.log('   ✅ Database update verification needed');

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
testPasswordChangeDebug();
