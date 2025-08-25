const API_BASE = 'http://localhost:3001';

async function testSimpleMessaging() {
  console.log('🧪 Test simple de l\'API Messaging...\n');

  try {
    // Test 1: Vérifier que le backend répond
    console.log('1️⃣ Test de connexion au backend...');
    const healthResponse = await fetch(`${API_BASE}/`);
    console.log(`Status: ${healthResponse.status}`);
    
    if (healthResponse.ok) {
      console.log('✅ Backend accessible');
    } else {
      console.log('❌ Backend non accessible');
      return;
    }

    // Test 2: Test simple de création de conversation
    console.log('\n2️⃣ Test simple de création de conversation...');
    const conversationResponse = await fetch(`${API_BASE}/messaging/conversations/create-or-get`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        participant1Id: 1,
        participant2Id: 2
      })
    });
    
    console.log(`Status: ${conversationResponse.status}`);
    console.log(`Headers:`, Object.fromEntries(conversationResponse.headers.entries()));
    
    if (conversationResponse.ok) {
      const conversation = await conversationResponse.json();
      console.log('✅ Conversation créée avec succès');
      console.log('Conversation:', JSON.stringify(conversation, null, 2));
    } else {
      const errorText = await conversationResponse.text();
      console.log('❌ Erreur lors de la création de la conversation');
      console.log('Erreur complète:', errorText);
      
      // Essayer de parser l'erreur JSON
      try {
        const errorJson = JSON.parse(errorText);
        console.log('Erreur JSON:', JSON.stringify(errorJson, null, 2));
      } catch (e) {
        console.log('Erreur non-JSON:', errorText);
      }
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Exécuter le test
testSimpleMessaging().then(() => {
  console.log('\n🏁 Test simple terminé');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Erreur fatale:', error);
  process.exit(1);
});
