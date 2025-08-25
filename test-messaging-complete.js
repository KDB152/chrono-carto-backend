// test-messaging-complete.js
// Script de test complet pour le système de messagerie

const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3001';

const testMessagingComplete = async () => {
  console.log('🧪 Test complet du système de messagerie\n');

  try {
    // 1. Test de l'API de base
    console.log('1️⃣ Test de l\'API de base...');
    const testResponse = await fetch(`${API_BASE}/messaging/test`);
    if (testResponse.ok) {
      const testResult = await testResponse.json();
      console.log('✅ API de base fonctionnelle:', testResult);
    } else {
      console.log('❌ API de base non accessible');
      return;
    }

    // 2. Test des destinataires disponibles pour l'utilisateur 40
    console.log('\n2️⃣ Test des destinataires disponibles pour l\'utilisateur 40...');
    const recipientsResponse = await fetch(`${API_BASE}/messaging/users/40/available-recipients`);
    if (!recipientsResponse.ok) {
      console.log('❌ Impossible de récupérer les destinataires disponibles');
      const errorText = await recipientsResponse.text();
      console.log('Erreur:', errorText);
      return;
    }
    
    const recipients = await recipientsResponse.json();
    console.log(`✅ ${recipients.length} destinataires disponibles pour l'utilisateur 40`);
    recipients.forEach(recipient => {
      console.log(`  - ID: ${recipient.id}, Nom: ${recipient.first_name} ${recipient.last_name}, Email: ${recipient.email}, Rôle: ${recipient.role}`);
    });

    // Vérifier si l'utilisateur 39 est dans la liste
    const user39 = recipients.find(r => r.id === 39);
    if (!user39) {
      console.log('⚠️ L\'utilisateur 39 n\'est pas dans la liste des destinataires disponibles');
      console.log('Cela peut expliquer l\'erreur "ID du destinataire invalide"');
      console.log('Vérifions l\'utilisateur 39 directement...');
      
      const user39Response = await fetch(`${API_BASE}/users/39`);
      if (user39Response.ok) {
        const user39Data = await user39Response.json();
        console.log('Utilisateur 39 trouvé:', {
          id: user39Data.id,
          email: user39Data.email,
          first_name: user39Data.first_name,
          last_name: user39Data.last_name,
          role: user39Data.role,
          is_approved: user39Data.is_approved,
          is_active: user39Data.is_active
        });
        
        if (!user39Data.is_approved || !user39Data.is_active) {
          console.log('❌ Problème identifié: L\'utilisateur 39 n\'est pas approuvé ou actif');
          console.log('   - is_approved:', user39Data.is_approved);
          console.log('   - is_active:', user39Data.is_active);
        }
      } else {
        console.log('❌ Utilisateur 39 non trouvé');
      }
      return;
    }

    console.log('✅ L\'utilisateur 39 est dans la liste des destinataires disponibles');

    // 3. Test de création de conversation
    console.log('\n3️⃣ Test de création de conversation entre utilisateur 40 et 39...');
    const conversationData = {
      participant1Id: 40,
      participant2Id: 39
    };
    
    console.log('Données de conversation:', conversationData);
    
    const conversationResponse = await fetch(`${API_BASE}/messaging/conversations/create-or-get`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(conversationData)
    });

    if (!conversationResponse.ok) {
      console.log('❌ Erreur lors de la création de la conversation');
      const errorText = await conversationResponse.text();
      console.log('Erreur:', errorText);
      return;
    }

    const conversation = await conversationResponse.json();
    console.log('✅ Conversation créée/récupérée:', conversation);

    // 4. Test d'envoi de message
    console.log('\n4️⃣ Test d\'envoi de message...');
    const messageData = {
      conversationId: conversation.id,
      senderId: 40,
      content: 'Test de message depuis le script de diagnostic - ' + new Date().toISOString(),
      messageType: 'text'
    };
    
    console.log('Données du message:', messageData);
    
    const messageResponse = await fetch(`${API_BASE}/messaging/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(messageData)
    });

    if (!messageResponse.ok) {
      console.log('❌ Erreur lors de l\'envoi du message');
      const errorText = await messageResponse.text();
      console.log('Erreur:', errorText);
      return;
    }

    const sentMessage = await messageResponse.json();
    console.log('✅ Message envoyé avec succès:', sentMessage);

    // 5. Test de récupération des messages
    console.log('\n5️⃣ Test de récupération des messages de la conversation...');
    const messagesResponse = await fetch(`${API_BASE}/messaging/conversations/${conversation.id}/messages`);
    if (!messagesResponse.ok) {
      console.log('❌ Erreur lors de la récupération des messages');
      const errorText = await messagesResponse.text();
      console.log('Erreur:', errorText);
      return;
    }

    const messages = await messagesResponse.json();
    console.log(`✅ ${messages.length} messages trouvés dans la conversation`);
    messages.forEach(message => {
      console.log(`  - ID: ${message.id}, Expéditeur: ${message.sender_id}, Contenu: ${message.content.substring(0, 50)}..., Date: ${message.created_at}`);
    });

    // 6. Test de récupération des conversations
    console.log('\n6️⃣ Test de récupération des conversations de l\'utilisateur 40...');
    const conversationsResponse = await fetch(`${API_BASE}/messaging/conversations?userId=40`);
    if (!conversationsResponse.ok) {
      console.log('❌ Erreur lors de la récupération des conversations');
      const errorText = await conversationsResponse.text();
      console.log('Erreur:', errorText);
      return;
    }

    const conversations = await conversationsResponse.json();
    console.log(`✅ ${conversations.length} conversations trouvées pour l'utilisateur 40`);
    conversations.forEach(conv => {
      console.log(`  - ID: ${conv.id}, Participant1: ${conv.participant1_id}, Participant2: ${conv.participant2_id}, Type: ${conv.type}, Créé: ${conv.created_at}`);
    });

    // 7. Test de récupération des conversations de l'utilisateur 39
    console.log('\n7️⃣ Test de récupération des conversations de l\'utilisateur 39...');
    const conversations39Response = await fetch(`${API_BASE}/messaging/conversations?userId=39`);
    if (!conversations39Response.ok) {
      console.log('❌ Erreur lors de la récupération des conversations de l\'utilisateur 39');
      const errorText = await conversations39Response.text();
      console.log('Erreur:', errorText);
      return;
    }

    const conversations39 = await conversations39Response.json();
    console.log(`✅ ${conversations39.length} conversations trouvées pour l'utilisateur 39`);
    conversations39.forEach(conv => {
      console.log(`  - ID: ${conv.id}, Participant1: ${conv.participant1_id}, Participant2: ${conv.participant2_id}, Type: ${conv.type}, Créé: ${conv.created_at}`);
    });

    console.log('\n🎉 Tous les tests du système de messagerie sont passés avec succès !');
    console.log('\n📋 Résumé:');
    console.log('   ✅ API de base fonctionnelle');
    console.log('   ✅ Destinataires disponibles récupérés');
    console.log('   ✅ Conversation créée/récupérée');
    console.log('   ✅ Message envoyé avec succès');
    console.log('   ✅ Messages récupérés');
    console.log('   ✅ Conversations récupérées pour les deux utilisateurs');
    console.log('\n💡 Le système de messagerie fonctionne correctement !');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
};

// Exécuter le test
if (require.main === module) {
  testMessagingComplete().catch(console.error);
}

module.exports = { testMessagingComplete };
