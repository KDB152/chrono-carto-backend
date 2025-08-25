const axios = require('axios');

const API_BASE = 'http://localhost:3001';

async function checkCurrentPassword() {
  console.log('🔍 Checking Current Password in Database...\n');

  // Test different possible passwords
  const possiblePasswords = [
    'password123',
    'newpassword123',
    'anotherpassword123',
    'testpassword123'
  ];

  for (const password of possiblePasswords) {
    try {
      console.log(`Testing password: ${password}`);
      const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
        email: 'mehdielabed69@gmail.com',
        password: password
      });

      console.log(`✅ SUCCESS! Current password is: ${password}`);
      console.log('   User ID:', loginResponse.data.user.id);
      console.log('   User Name:', loginResponse.data.user.firstName, loginResponse.data.user.lastName);
      console.log('   User Role:', loginResponse.data.user.role);
      
      return password; // Found the current password
    } catch (error) {
      console.log(`❌ Failed with password: ${password}`);
    }
  }

  console.log('❌ None of the tested passwords worked');
  return null;
}

// Run the check
checkCurrentPassword();
