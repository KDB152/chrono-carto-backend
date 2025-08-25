const API_BASE = 'http://localhost:3001';

async function testMessagingEndpoint() {
  console.log('🧪 Test de l\'endpoint Messaging...\n');

  try {
    // Test 1: Test de l'endpoint simple
    console.log('1️⃣ Test de l\'endpoint test...');
    const testResponse = await fetch(`${API_BASE}/messaging/test`);
    console.log(`Status: ${testResponse.status}`);
    
    if (testResponse.ok) {
      const testData = await testResponse.json();
      console.log('✅ Endpoint test fonctionne:', testData);
    } else {
      console.log('❌ Endpoint test ne fonctionne pas');
      const errorText = await testResponse.text();
      console.log('Erreur:', errorText);
    }

    // Test 2: Test de l'endpoint des destinataires
    console.log('\n2️⃣ Test de l\'endpoint des destinataires...');
    const recipientsResponse = await fetch(`${API_BASE}/messaging/users/1/available-recipients`);
    console.log(`Status: ${recipientsResponse.status}`);
    
    if (recipientsResponse.ok) {
      const recipients = await recipientsResponse.json();
      console.log('✅ Endpoint des destinataires fonctionne');
      console.log('Destinataires:', recipients);
    } else {
      console.log('❌ Endpoint des destinataires ne fonctionne pas');
      const errorText = await recipientsResponse.text();
      console.log('Erreur:', errorText);
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

// Exécuter le test
testMessagingEndpoint().then(() => {
  console.log('\n🏁 Test terminé');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Erreur fatale:', error);
  process.exit(1);
});
