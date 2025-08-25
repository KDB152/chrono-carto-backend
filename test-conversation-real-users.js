const mysql = require('mysql2/promise');

// Configuration de la base de données
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'chrono_carto',
  port: process.env.DB_PORT || 3306
};

async function testConversationWithRealUsers() {
  let connection;

  try {
    console.log('🔌 Connexion à la base de données...');
    connection = await mysql.createConnection(dbConfig);

    console.log('📋 Test avec de vrais utilisateurs...');

    // Test 1: Récupérer les vrais utilisateurs approuvés
    const [users] = await connection.execute(`
      SELECT id, first_name, last_name, email, role 
      FROM users 
      WHERE is_approved = 1 AND is_active = 1 
      ORDER BY id 
      LIMIT 5
    `);
    console.log('Utilisateurs approuvés trouvés:', users);

    if (users.length < 2) {
      console.log('❌ Pas assez d\'utilisateurs approuvés pour tester');
      return;
    }

    const user1 = users[0];
    const user2 = users[1];

    console.log(`\n🧪 Test avec utilisateurs: ${user1.first_name} (ID: ${user1.id}) et ${user2.first_name} (ID: ${user2.id})`);

    // Test 2: Créer une conversation avec de vrais utilisateurs
    const [result] = await connection.execute(`
      INSERT INTO conversations (participant1_id, participant2_id, type) 
      VALUES (?, ?, ?)
    `, [user1.id, user2.id, 'direct']);

    console.log('✅ Conversation créée avec ID:', result.insertId);

    // Test 3: Vérifier que la conversation existe
    const [conversations] = await connection.execute('SELECT * FROM conversations WHERE id = ?', [result.insertId]);
    console.log('Conversation trouvée:', conversations[0]);

    // Test 4: Créer un message
    const [messageResult] = await connection.execute(`
      INSERT INTO messages (conversation_id, sender_id, content, message_type) 
      VALUES (?, ?, ?, ?)
    `, [result.insertId, user1.id, 'Test message de ' + user1.first_name, 'text']);

    console.log('✅ Message créé avec ID:', messageResult.insertId);

    // Test 5: Vérifier le message
    const [messages] = await connection.execute('SELECT * FROM messages WHERE id = ?', [messageResult.insertId]);
    console.log('Message trouvé:', messages[0]);

    // Test 6: Créer un message de réponse
    const [replyResult] = await connection.execute(`
      INSERT INTO messages (conversation_id, sender_id, content, message_type) 
      VALUES (?, ?, ?, ?)
    `, [result.insertId, user2.id, 'Réponse de ' + user2.first_name, 'text']);

    console.log('✅ Message de réponse créé avec ID:', replyResult.insertId);

    // Test 7: Lister tous les messages de la conversation
    const [allMessages] = await connection.execute(`
      SELECT m.*, u.first_name, u.last_name 
      FROM messages m 
      JOIN users u ON m.sender_id = u.id 
      WHERE m.conversation_id = ? 
      ORDER BY m.created_at
    `, [result.insertId]);

    console.log('\n📨 Tous les messages de la conversation:');
    allMessages.forEach((msg, index) => {
      console.log(`${index + 1}. [${msg.created_at}] ${msg.first_name} ${msg.last_name}: ${msg.content}`);
    });

    console.log('\n✅ Tous les tests réussis !');

  } catch (error) {
    console.error('💥 Erreur lors du test:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Exécuter le test
testConversationWithRealUsers().then(() => {
  console.log('\n🏁 Test terminé');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Erreur fatale:', error);
  process.exit(1);
});
