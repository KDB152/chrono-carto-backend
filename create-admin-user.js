const axios = require('axios');

const API_BASE = 'http://localhost:3001';

async function createAdminUser() {
  console.log('🔍 Creating Admin User...\n');

  try {
    // Step 1: Register admin user
    console.log('1️⃣ Registering admin user...');
    const registerResponse = await axios.post(`${API_BASE}/auth/register`, {
      email: 'admin@test.com',
      password: 'adminpassword123',
      firstName: 'Admin',
      lastName: 'Test',
      userType: 'admin'
    });
    
    console.log('✅ Admin user registered:', registerResponse.data);

    // Step 2: Try to login (should work for admin)
    console.log('\n2️⃣ Trying to login with admin...');
    try {
      const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
        email: 'admin@test.com',
        password: 'adminpassword123'
      });
      
      console.log('✅ Admin login successful:', {
        id: loginResponse.data.user.id,
        name: loginResponse.data.user.firstName + ' ' + loginResponse.data.user.lastName,
        role: loginResponse.data.user.role
      });
      
      return {
        token: loginResponse.data.accessToken,
        user: loginResponse.data.user
      };
      
    } catch (error) {
      console.log('❌ Admin login failed:', error.response?.data);
      
      // If login fails, try to approve the user manually
      console.log('\n3️⃣ Trying to approve user manually...');
      try {
        // This would require an admin endpoint to approve users
        console.log('⚠️  Need to implement user approval endpoint');
      } catch (approveError) {
        console.log('❌ User approval failed:', approveError.response?.data);
      }
    }

  } catch (error) {
    if (error.response?.status === 409) {
      console.log('⚠️  Admin user already exists');
      
      // Try to login with existing user
      console.log('\n2️⃣ Trying to login with existing admin...');
      try {
        const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
          email: 'admin@test.com',
          password: 'adminpassword123'
        });
        
        console.log('✅ Admin login successful:', {
          id: loginResponse.data.user.id,
          name: loginResponse.data.user.firstName + ' ' + loginResponse.data.user.lastName,
          role: loginResponse.data.user.role
        });
        
        return {
          token: loginResponse.data.accessToken,
          user: loginResponse.data.user
        };
        
      } catch (loginError) {
        console.log('❌ Admin login failed:', loginError.response?.data);
      }
    } else {
      console.log('❌ Registration failed:', error.response?.data);
    }
  }
  
  return null;
}

// Run the function
createAdminUser().then(result => {
  if (result) {
    console.log('\n🎉 Admin user ready for testing!');
    console.log('Token:', result.token.substring(0, 20) + '...');
    console.log('User ID:', result.user.id);
  } else {
    console.log('\n❌ Failed to create/login admin user');
  }
});
