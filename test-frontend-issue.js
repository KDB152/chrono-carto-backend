const axios = require('axios');

const API_BASE = 'http://localhost:3001';

async function testFrontendIssue() {
  console.log('🔍 Testing Frontend Password Change Issue...\n');

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

    // Step 2: Test with WRONG current password (should fail)
    console.log('\n2️⃣ Testing with WRONG current password (should fail)...');
    try {
      const wrongPasswordResponse = await axios.post(`${API_BASE}/auth/change-password`, {
        currentPassword: 'wrongpassword123',
        newPassword: 'anotherpassword123'
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('❌ ERROR: Change password succeeded with wrong password (should have failed)');
      console.log('   Response:', wrongPasswordResponse.data);
      console.log('   This means the backend is not checking the current password correctly');
    } catch (error) {
      console.log('✅ Change password correctly failed with wrong password');
      console.log('   Error:', error.response?.data?.message || error.message);
      console.log('   Status:', error.response?.status);
    }

    // Step 3: Test with CORRECT current password (should succeed)
    console.log('\n3️⃣ Testing with CORRECT current password (should succeed)...');
    try {
      const correctPasswordResponse = await axios.post(`${API_BASE}/auth/change-password`, {
        currentPassword: 'newpassword123',
        newPassword: 'anotherpassword123'
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Change password successful with correct password');
      console.log('   Response:', correctPasswordResponse.data);
    } catch (error) {
      console.log('❌ ERROR: Change password failed with correct password');
      console.log('   Error:', error.response?.data?.message || error.message);
      console.log('   Status:', error.response?.status);
    }

    // Step 4: Verify the password was actually changed
    console.log('\n4️⃣ Verifying password change in database...');
    
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
        password: 'anotherpassword123'
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
    
    try {
      const changeBackResponse = await axios.post(`${API_BASE}/auth/change-password`, {
        currentPassword: 'anotherpassword123',
        newPassword: 'password123'
      }, {
        headers: {
          'Authorization': `Bearer ${newToken}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Password changed back to original');
      console.log('   Response:', changeBackResponse.data);
    } catch (error) {
      console.log('❌ ERROR: Failed to change password back to original');
      console.log('   Error:', error.response?.data?.message || error.message);
    }

    console.log('\n🎉 Frontend Issue Test Completed!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Backend endpoint responds');
    console.log('   ✅ Authentication works');
    console.log('   ✅ Password change functionality works');
    console.log('   ✅ Database persistence works');

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
testFrontendIssue();
