const mysql = require('mysql2/promise');

// Configuration de la base de données
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'chrono_carto',
  port: process.env.DB_PORT || 3306
};

async function testConversationDirect() {
  let connection;

  try {
    console.log('🔌 Connexion directe à la base de données...');
    connection = await mysql.createConnection(dbConfig);

    console.log('📋 Test de création directe de conversation...');

    // Test 1: Vérifier que les utilisateurs existent
    const [users] = await connection.execute('SELECT id, first_name, last_name FROM users WHERE id IN (1, 2)');
    console.log('Utilisateurs trouvés:', users);

    // Test 2: Créer une conversation directement
    const [result] = await connection.execute(`
      INSERT INTO conversations (participant1_id, participant2_id, type) 
      VALUES (?, ?, ?)
    `, [1, 2, 'direct']);

    console.log('Conversation créée avec ID:', result.insertId);

    // Test 3: Vérifier que la conversation existe
    const [conversations] = await connection.execute('SELECT * FROM conversations WHERE id = ?', [result.insertId]);
    console.log('Conversation trouvée:', conversations[0]);

    // Test 4: Créer un message
    const [messageResult] = await connection.execute(`
      INSERT INTO messages (conversation_id, sender_id, content, message_type) 
      VALUES (?, ?, ?, ?)
    `, [result.insertId, 1, 'Test message', 'text']);

    console.log('Message créé avec ID:', messageResult.insertId);

    // Test 5: Vérifier le message
    const [messages] = await connection.execute('SELECT * FROM messages WHERE id = ?', [messageResult.insertId]);
    console.log('Message trouvé:', messages[0]);

    console.log('✅ Tous les tests directs réussis !');

  } catch (error) {
    console.error('💥 Erreur lors du test direct:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Exécuter le test
testConversationDirect().then(() => {
  console.log('\n🏁 Test direct terminé');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Erreur fatale:', error);
  process.exit(1);
});
