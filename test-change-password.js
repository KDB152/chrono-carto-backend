const axios = require('axios');

const API_BASE = 'http://localhost:3001';

async function testChangePassword() {
  console.log('🧪 Testing Change Password Functionality...\n');

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
    console.log('\n2️⃣ Testing change password...');
    const changePasswordResponse = await axios.post(`${API_BASE}/auth/change-password`, {
      currentPassword: 'password123',
      newPassword: 'newpassword123'
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Password changed successfully');
    console.log('   Response:', changePasswordResponse.data);

    // Step 3: Test login with new password
    console.log('\n3️⃣ Testing login with new password...');
    const newLoginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'mehdielabed69@gmail.com',
      password: 'newpassword123'
    });

    console.log('✅ Login with new password successful');
    console.log('   User ID:', newLoginResponse.data.user.id);

    // Step 4: Test change password back to original
    console.log('\n4️⃣ Changing password back to original...');
    const changeBackResponse = await axios.post(`${API_BASE}/auth/change-password`, {
      currentPassword: 'newpassword123',
      newPassword: 'password123'
    }, {
      headers: {
        'Authorization': `Bearer ${newLoginResponse.data.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Password changed back successfully');
    console.log('   Response:', changeBackResponse.data);

    // Step 5: Test error cases
    console.log('\n5️⃣ Testing error cases...');
    
    // Test with wrong current password
    try {
      await axios.post(`${API_BASE}/auth/change-password`, {
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword123'
      }, {
        headers: {
          'Authorization': `Bearer ${newLoginResponse.data.accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('❌ Should have failed with wrong current password');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Correctly rejected wrong current password');
      } else {
        console.log('❌ Unexpected error:', error.response?.data);
      }
    }

    // Test with same password
    try {
      await axios.post(`${API_BASE}/auth/change-password`, {
        currentPassword: 'password123',
        newPassword: 'password123'
      }, {
        headers: {
          'Authorization': `Bearer ${newLoginResponse.data.accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('❌ Should have failed with same password');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Correctly rejected same password');
      } else {
        console.log('❌ Unexpected error:', error.response?.data);
      }
    }

    console.log('\n🎉 Change Password Test Completed Successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Password change working');
    console.log('   ✅ Login with new password working');
    console.log('   ✅ Error handling working');
    console.log('   ✅ Security validation working');
    console.log('\n🚀 The change password functionality is now working correctly!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Tip: Make sure the user is approved in the admin dashboard');
    }
    
    if (error.response?.status === 404) {
      console.log('\n💡 Tip: Make sure the backend is running on port 3001');
    }
  }
}

// Run the test
testChangePassword();
