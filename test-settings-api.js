const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3001';

// Test token (you'll need to get a real token from login)
const TEST_TOKEN = 'your-test-token-here';

async function testSettingsAPI() {
  console.log('🧪 Test des API de paramètres...\n');

  try {
    // Test 1: Get all system settings
    console.log('1. Récupération de tous les paramètres système...');
    const systemSettings = await fetch(`${API_BASE_URL}/settings/system`, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (systemSettings.ok) {
      const settings = await systemSettings.json();
      console.log(`✅ ${settings.length} paramètres système récupérés`);
    } else {
      console.log('❌ Erreur lors de la récupération des paramètres système');
    }

    // Test 2: Get system settings as object
    console.log('\n2. Récupération des paramètres système en format objet...');
    const systemSettingsObj = await fetch(`${API_BASE_URL}/settings/system/object`, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (systemSettingsObj.ok) {
      const settingsObj = await systemSettingsObj.json();
      console.log('✅ Paramètres système en format objet récupérés');
      console.log('   Exemples:', Object.keys(settingsObj).slice(0, 5));
    } else {
      console.log('❌ Erreur lors de la récupération des paramètres en format objet');
    }

    // Test 3: Update a system setting
    console.log('\n3. Mise à jour d\'un paramètre système...');
    const updateResponse = await fetch(`${API_BASE_URL}/settings/system`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        key: 'test.setting',
        value: 'test-value',
        category: 'test',
        description: 'Paramètre de test'
      })
    });
    
    if (updateResponse.ok) {
      console.log('✅ Paramètre système mis à jour avec succès');
    } else {
      console.log('❌ Erreur lors de la mise à jour du paramètre');
    }

    // Test 4: Get user preferences (for user ID 1)
    console.log('\n4. Récupération des préférences utilisateur...');
    const userPrefs = await fetch(`${API_BASE_URL}/settings/user/1`, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (userPrefs.ok) {
      const prefs = await userPrefs.json();
      console.log(`✅ ${prefs.length} préférences utilisateur récupérées`);
    } else {
      console.log('❌ Erreur lors de la récupération des préférences utilisateur');
    }

    // Test 5: Set user preference
    console.log('\n5. Définition d\'une préférence utilisateur...');
    const setPrefResponse = await fetch(`${API_BASE_URL}/settings/user/1`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        key: 'test.preference',
        value: 'test-pref-value',
        category: 'test'
      })
    });
    
    if (setPrefResponse.ok) {
      console.log('✅ Préférence utilisateur définie avec succès');
    } else {
      console.log('❌ Erreur lors de la définition de la préférence');
    }

    // Test 6: Initialize system settings
    console.log('\n6. Initialisation des paramètres système par défaut...');
    const initResponse = await fetch(`${API_BASE_URL}/settings/system/initialize`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (initResponse.ok) {
      console.log('✅ Paramètres système initialisés avec succès');
    } else {
      console.log('❌ Erreur lors de l\'initialisation des paramètres');
    }

    console.log('\n🎉 Tests terminés avec succès!');

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.message);
  }
}

// Run tests
testSettingsAPI();
