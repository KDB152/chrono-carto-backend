const API_BASE = 'http://localhost:3001';

async function testAllDashboardsMessaging() {
  console.log('🧪 Test de l\'API Messaging pour tous les dashboards...\n');

  try {
    // Test 1: Récupérer les destinataires disponibles pour différents utilisateurs
    console.log('1️⃣ Test de récupération des destinataires pour différents rôles...');
    
    const testUsers = [
      { id: 28, name: 'Mehdi (Admin)', role: 'admin' },
      { id: 36, name: 'Mayssa (Student)', role: 'student' }
    ];

    for (const user of testUsers) {
      console.log(`\n   Test pour ${user.name} (ID: ${user.id})...`);
      
      const recipientsResponse = await fetch(`${API_BASE}/messaging/users/${user.id}/available-recipients`);
      console.log(`   Status: ${recipientsResponse.status}`);

      if (recipientsResponse.ok) {
        const recipients = await recipientsResponse.json();
        console.log(`   ✅ Succès: ${recipients.length} destinataire(s) trouvé(s)`);
        console.log('   Destinataires:', recipients.map(r => `${r.first_name} ${r.last_name} (${r.role})`));
      } else {
        console.log('   ❌ Erreur lors de la récupération des destinataires');
        const errorText = await recipientsResponse.text();
        console.log('   Erreur:', errorText);
      }
    }

    // Test 2: Créer des conversations entre différents utilisateurs
    console.log('\n2️⃣ Test de création de conversations entre différents rôles...');
    
    const conversationTests = [
      { participant1: 28, participant2: 36, description: 'Admin vers Student' },
      { participant1: 36, participant2: 28, description: 'Student vers Admin' }
    ];

    for (const test of conversationTests) {
      console.log(`\n   Test: ${test.description}...`);
      
      const conversationResponse = await fetch(`${API_BASE}/messaging/conversations/create-or-get`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participant1Id: test.participant1,
          participant2Id: test.participant2
        })
      });

      console.log(`   Status: ${conversationResponse.status}`);

      if (conversationResponse.ok) {
        const conversation = await conversationResponse.json();
        console.log(`   ✅ Conversation créée/récupérée: ID ${conversation.id}`);
        
        // Test 3: Envoyer un message dans cette conversation
        console.log(`   Envoi de message dans la conversation ${conversation.id}...`);
        
        const messageResponse = await fetch(`${API_BASE}/messaging/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationId: conversation.id,
            senderId: test.participant1,
            content: `Test message - ${test.description}`,
            messageType: 'text'
          })
        });

        console.log(`   Message Status: ${messageResponse.status}`);

        if (messageResponse.ok) {
          const message = await messageResponse.json();
          console.log(`   ✅ Message envoyé: ID ${message.id}`);
          
          // Test 4: Récupérer les messages de la conversation
          const messagesResponse = await fetch(`${API_BASE}/messaging/conversations/${conversation.id}/messages`);
          console.log(`   Messages Status: ${messagesResponse.status}`);

          if (messagesResponse.ok) {
            const messages = await messagesResponse.json();
            console.log(`   ✅ ${messages.length} message(s) récupéré(s) de la conversation`);
          } else {
            console.log('   ❌ Erreur lors de la récupération des messages');
          }
        } else {
          console.log('   ❌ Erreur lors de l\'envoi du message');
        }
      } else {
        console.log('   ❌ Erreur lors de la création de la conversation');
        const errorText = await conversationResponse.text();
        console.log('   Erreur:', errorText);
      }
    }

    // Test 5: Récupérer les conversations pour chaque utilisateur
    console.log('\n3️⃣ Test de récupération des conversations pour chaque utilisateur...');
    
    for (const user of testUsers) {
      console.log(`\n   Récupération des conversations pour ${user.name}...`);
      
      const conversationsResponse = await fetch(`${API_BASE}/messaging/conversations?userId=${user.id}`);
      console.log(`   Status: ${conversationsResponse.status}`);

      if (conversationsResponse.ok) {
        const conversations = await conversationsResponse.json();
        console.log(`   ✅ ${conversations.length} conversation(s) trouvée(s)`);
        console.log('   Conversations:', conversations.map(c => `ID ${c.id}: ${c.participant1_id} ↔ ${c.participant2_id}`));
      } else {
        console.log('   ❌ Erreur lors de la récupération des conversations');
        const errorText = await conversationsResponse.text();
        console.log('   Erreur:', errorText);
      }
    }

  } catch (error) {
    console.error('💥 Une erreur inattendue est survenue:', error.message);
  }
  
  console.log('\n🏁 Tests de l\'API Messaging pour tous les dashboards terminés.');
}

testAllDashboardsMessaging();
