const axios = require('axios');

const API_BASE = 'http://localhost:3001';

async function testSettingsFix() {
  console.log('🧪 Testing Settings Fixes...\n');

  try {
    // Step 1: Login as admin
    console.log('1️⃣ Logging in as admin...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@chronocarto.com',
      password: 'password123'
    });

    const { accessToken, user } = loginResponse.data;
    console.log('✅ Admin login successful');
    console.log('   User ID:', user.id);
    console.log('   User Role:', user.role);

    // Step 2: Test system settings
    console.log('\n2️⃣ Testing system settings...');
    const systemSettingsResponse = await axios.get(`${API_BASE}/settings/system/object`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ System settings loaded successfully');
    console.log('   Settings count:', Object.keys(systemSettingsResponse.data).length);

    // Step 3: Test user preferences
    console.log('\n3️⃣ Testing user preferences...');
    const userPrefsResponse = await axios.get(`${API_BASE}/settings/user/${user.id}/object`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ User preferences loaded successfully');
    console.log('   Preferences count:', Object.keys(userPrefsResponse.data).length);

    // Step 4: Test updating user preferences
    console.log('\n4️⃣ Testing user preferences update...');
    const updatePrefsResponse = await axios.post(`${API_BASE}/settings/user/${user.id}/bulk`, {
      preferences: [
        {
          key: 'preferences.theme',
          value: 'dark',
          category: 'preferences'
        },
        {
          key: 'preferences.language',
          value: 'fr',
          category: 'preferences'
        }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ User preferences updated successfully');
    console.log('   Response:', updatePrefsResponse.data);

    // Step 5: Test system settings update
    console.log('\n5️⃣ Testing system settings update...');
    const updateSystemResponse = await axios.post(`${API_BASE}/settings/system/bulk`, {
      settings: [
        {
          key: 'site.name',
          value: 'Chrono Carto Test',
          category: 'general'
        },
        {
          key: 'site.description',
          value: 'Test description',
          category: 'general'
        }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ System settings updated successfully');
    console.log('   Response:', updateSystemResponse.data);

    // Step 6: Test login as parent
    console.log('\n6️⃣ Testing parent login...');
    const parentLoginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'mehdielabed69@gmail.com',
      password: 'password123'
    });

    const { accessToken: parentToken, user: parentUser } = parentLoginResponse.data;
    console.log('✅ Parent login successful');
    console.log('   Parent ID:', parentUser.id);
    console.log('   Parent Role:', parentUser.role);

    // Step 7: Test parent preferences
    console.log('\n7️⃣ Testing parent preferences...');
    const parentPrefsResponse = await axios.get(`${API_BASE}/settings/user/${parentUser.id}/object`, {
      headers: {
        'Authorization': `Bearer ${parentToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Parent preferences loaded successfully');
    console.log('   Preferences count:', Object.keys(parentPrefsResponse.data).length);

    // Step 8: Test parent preferences update
    console.log('\n8️⃣ Testing parent preferences update...');
    const updateParentPrefsResponse = await axios.post(`${API_BASE}/settings/user/${parentUser.id}/bulk`, {
      preferences: [
        {
          key: 'preferences.theme',
          value: 'light',
          category: 'preferences'
        },
        {
          key: 'preferences.notifications.email',
          value: 'true',
          category: 'preferences'
        }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${parentToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Parent preferences updated successfully');
    console.log('   Response:', updateParentPrefsResponse.data);

    console.log('\n🎉 Settings Fix Test Completed Successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ System settings loading working');
    console.log('   ✅ System settings updating working');
    console.log('   ✅ User preferences loading working');
    console.log('   ✅ User preferences updating working');
    console.log('   ✅ Parent preferences working');
    console.log('   ✅ Admin and parent access working');
    console.log('\n🚀 All settings functionality is now working correctly!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Tip: Make sure the users are approved in the admin dashboard');
    }
    
    if (error.response?.status === 404) {
      console.log('\n💡 Tip: Make sure the backend is running on port 3001');
    }
  }
}

// Run the test
testSettingsFix();
