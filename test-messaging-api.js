const API_BASE = 'http://localhost:3001';

async function testMessagingAPI() {
  console.log('🧪 Test de l\'API Messaging...\n');

  try {
    // Test 1: Récupérer les destinataires disponibles
    console.log('1️⃣ Test de récupération des destinataires disponibles...');
    const recipientsResponse = await fetch(`${API_BASE}/messaging/users/1/available-recipients`);
    console.log(`Status: ${recipientsResponse.status}`);
    
    if (recipientsResponse.ok) {
      const recipients = await recipientsResponse.json();
      console.log(`✅ Succès: ${recipients.length} destinataires trouvé(s)`);
      console.log('Destinataires:', JSON.stringify(recipients, null, 2));
    } else {
      console.log('❌ Erreur lors de la récupération des destinataires');
      const errorText = await recipientsResponse.text();
      console.log('Erreur:', errorText);
    }

    // Test 2: Créer ou récupérer une conversation
    console.log('\n2️⃣ Test de création/récupération de conversation...');
    const conversationResponse = await fetch(`${API_BASE}/messaging/conversations/create-or-get`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        participant1Id: 28, // Mehdi
        participant2Id: 36  // Mayssa
      })
    });
    
    console.log(`Status: ${conversationResponse.status}`);
    
    if (conversationResponse.ok) {
      const conversation = await conversationResponse.json();
      console.log('✅ Conversation créée/récupérée avec succès');
      console.log('Conversation:', JSON.stringify(conversation, null, 2));
      
      const conversationId = conversation.id;
      
      // Test 3: Envoyer un message
      console.log('\n3️⃣ Test d\'envoi de message...');
      const messageResponse = await fetch(`${API_BASE}/messaging/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: conversationId,
          senderId: 28, // Mehdi
          content: 'Test de message via API',
          messageType: 'text'
        })
      });
      
      console.log(`Status: ${messageResponse.status}`);
      
      if (messageResponse.ok) {
        const message = await messageResponse.json();
        console.log('✅ Message envoyé avec succès');
        console.log('Message:', JSON.stringify(message, null, 2));
        
        // Test 4: Récupérer les messages de la conversation
        console.log('\n4️⃣ Test de récupération des messages...');
        const messagesResponse = await fetch(`${API_BASE}/messaging/conversations/${conversationId}/messages`);
        
        console.log(`Status: ${messagesResponse.status}`);
        
        if (messagesResponse.ok) {
          const messages = await messagesResponse.json();
          console.log(`✅ Succès: ${messages.length} message(s) trouvé(s)`);
          console.log('Messages:', JSON.stringify(messages, null, 2));
        } else {
          console.log('❌ Erreur lors de la récupération des messages');
          const errorText = await messagesResponse.text();
          console.log('Erreur:', errorText);
        }
        
      } else {
        console.log('❌ Erreur lors de l\'envoi du message');
        const errorText = await messageResponse.text();
        console.log('Erreur:', errorText);
      }
      
    } else {
      console.log('❌ Erreur lors de la création de la conversation');
      const errorText = await conversationResponse.text();
      console.log('Erreur:', errorText);
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

// Exécuter le test
testMessagingAPI().then(() => {
  console.log('\n🏁 Test terminé');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Erreur fatale:', error);
  process.exit(1);
});
