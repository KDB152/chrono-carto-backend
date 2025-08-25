// fix-messaging-system.js
// Script pour diagnostiquer et corriger le système de messagerie

const mysql = require('mysql2/promise');

const fixMessagingSystem = async () => {
  // Configuration de la base de données
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'chrono_carto',
  });

  try {
    console.log('🔧 Diagnostic du système de messagerie\n');

    // 1. Vérifier les utilisateurs spécifiés
    console.log('1️⃣ Vérification des utilisateurs 40 et 39...');
    
    const [user40] = await connection.execute(`
      SELECT id, email, first_name, last_name, role, is_approved, is_active, email_verified
      FROM users WHERE id = 40
    `);
    
    const [user39] = await connection.execute(`
      SELECT id, email, first_name, last_name, role, is_approved, is_active, email_verified
      FROM users WHERE id = 39
    `);

    if (user40.length === 0) {
      console.log('❌ Utilisateur 40 (mehdielabed86@gmail.com) non trouvé');
    } else {
      const user = user40[0];
      console.log('✅ Utilisateur 40 trouvé:', {
        id: user.id,
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
        role: user.role,
        is_approved: user.is_approved,
        is_active: user.is_active,
        email_verified: user.email_verified
      });
    }

    if (user39.length === 0) {
      console.log('❌ Utilisateur 39 (mehdielabed69@gmail.com) non trouvé');
    } else {
      const user = user39[0];
      console.log('✅ Utilisateur 39 trouvé:', {
        id: user.id,
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
        role: user.role,
        is_approved: user.is_approved,
        is_active: user.is_active,
        email_verified: user.email_verified
      });
    }

    // 2. Vérifier tous les utilisateurs approuvés et actifs
    console.log('\n2️⃣ Vérification de tous les utilisateurs approuvés et actifs...');
    
    const [approvedUsers] = await connection.execute(`
      SELECT id, email, first_name, last_name, role, is_approved, is_active, email_verified
      FROM users 
      WHERE is_approved = 1 AND is_active = 1
      ORDER BY id
    `);

    console.log(`✅ ${approvedUsers.length} utilisateurs approuvés et actifs trouvés:`);
    approvedUsers.forEach(user => {
      console.log(`  - ID: ${user.id}, Email: ${user.email}, Nom: ${user.first_name} ${user.last_name}, Rôle: ${user.role}`);
    });

    // 3. Vérifier les tables de messagerie
    console.log('\n3️⃣ Vérification des tables de messagerie...');
    
    // Vérifier la table conversations
    const [conversations] = await connection.execute(`
      SELECT id, participant1_id, participant2_id, type, created_at, updated_at
      FROM conversations
      ORDER BY created_at DESC
      LIMIT 10
    `);

    console.log(`✅ ${conversations.length} conversations trouvées:`);
    conversations.forEach(conv => {
      console.log(`  - ID: ${conv.id}, Participant1: ${conv.participant1_id}, Participant2: ${conv.participant2_id}, Type: ${conv.type}, Créé: ${conv.created_at}`);
    });

    // Vérifier la table messages
    const [messages] = await connection.execute(`
      SELECT id, conversation_id, sender_id, content, message_type, created_at, is_read
      FROM messages
      ORDER BY created_at DESC
      LIMIT 10
    `);

    console.log(`✅ ${messages.length} messages trouvés:`);
    messages.forEach(msg => {
      console.log(`  - ID: ${msg.id}, Conversation: ${msg.conversation_id}, Expéditeur: ${msg.sender_id}, Type: ${msg.message_type}, Lu: ${msg.is_read}, Créé: ${msg.created_at}`);
    });

    // 4. Vérifier les conversations entre utilisateur 40 et 39
    console.log('\n4️⃣ Vérification des conversations entre utilisateur 40 et 39...');
    
    const [existingConversations] = await connection.execute(`
      SELECT id, participant1_id, participant2_id, type, created_at, updated_at
      FROM conversations
      WHERE (participant1_id = 40 AND participant2_id = 39) 
         OR (participant1_id = 39 AND participant2_id = 40)
    `);

    if (existingConversations.length === 0) {
      console.log('ℹ️ Aucune conversation existante entre utilisateur 40 et 39');
    } else {
      console.log(`✅ ${existingConversations.length} conversation(s) existante(s) entre utilisateur 40 et 39:`);
      existingConversations.forEach(conv => {
        console.log(`  - ID: ${conv.id}, Participant1: ${conv.participant1_id}, Participant2: ${conv.participant2_id}, Type: ${conv.type}, Créé: ${conv.created_at}`);
      });
    }

    // 5. Diagnostic du problème
    console.log('\n5️⃣ Diagnostic du problème...');
    
    if (user40.length === 0 || user39.length === 0) {
      console.log('❌ Problème: Un ou les deux utilisateurs n\'existent pas');
      return;
    }

    const user40Data = user40[0];
    const user39Data = user39[0];

    if (!user40Data.is_approved || !user40Data.is_active) {
      console.log('❌ Problème: L\'utilisateur 40 n\'est pas approuvé ou actif');
    }

    if (!user39Data.is_approved || !user39Data.is_active) {
      console.log('❌ Problème: L\'utilisateur 39 n\'est pas approuvé ou actif');
    }

    // 6. Créer une conversation de test si elle n'existe pas
    if (existingConversations.length === 0) {
      console.log('\n6️⃣ Création d\'une conversation de test...');
      
      const [newConversation] = await connection.execute(`
        INSERT INTO conversations (participant1_id, participant2_id, type, created_at, updated_at)
        VALUES (40, 39, 'direct', NOW(), NOW())
      `);
      
      console.log('✅ Conversation de test créée');
    }

    // 7. Recommandations
    console.log('\n7️⃣ Recommandations pour corriger le problème:');
    console.log('   - Vérifier que les utilisateurs sont approuvés et actifs');
    console.log('   - Vérifier que l\'API getAvailableRecipients fonctionne correctement');
    console.log('   - Vérifier que le frontend envoie les bonnes données');
    console.log('   - Vérifier les logs du serveur pour plus de détails');

  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error);
  } finally {
    await connection.end();
  }
};

// Exécuter le diagnostic
if (require.main === module) {
  fixMessagingSystem().catch(console.error);
}

module.exports = { fixMessagingSystem };
