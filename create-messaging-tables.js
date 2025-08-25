const mysql = require('mysql2/promise');

// Configuration de la base de données
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'chrono_carto',
  port: process.env.DB_PORT || 3306
};

async function createMessagingTables() {
  let connection;

  try {
    console.log('🔌 Connexion à la base de données...');
    connection = await mysql.createConnection(dbConfig);

    console.log('📋 Création des tables de messagerie...');

    // Table conversations
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS conversations (
        id INT PRIMARY KEY AUTO_INCREMENT,
        participant1_id INT NOT NULL,
        participant2_id INT NOT NULL,
        title VARCHAR(255),
        type VARCHAR(50) DEFAULT 'direct',
        last_message_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_participants (participant1_id, participant2_id),
        INDEX idx_participant1 (participant1_id),
        INDEX idx_participant2 (participant2_id)
      )
    `);
    console.log('✅ Table conversations créée/vérifiée');

    // Table messages
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS messages (
        id INT PRIMARY KEY AUTO_INCREMENT,
        conversation_id INT NOT NULL,
        sender_id INT NOT NULL,
        content TEXT NOT NULL,
        message_type VARCHAR(50) DEFAULT 'text',
        is_read BOOLEAN DEFAULT FALSE,
        file_path VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_conversation (conversation_id),
        INDEX idx_sender (sender_id),
        INDEX idx_created_at (created_at)
      )
    `);
    console.log('✅ Table messages créée/vérifiée');

    // Vérifier que les tables existent
    const [conversations] = await connection.execute('SHOW TABLES LIKE "conversations"');
    const [messages] = await connection.execute('SHOW TABLES LIKE "messages"');

    if (conversations.length > 0 && messages.length > 0) {
      console.log('✅ Toutes les tables de messagerie sont prêtes !');
      
      // Afficher la structure des tables
      console.log('\n📊 Structure de la table conversations:');
      const [conversationsStructure] = await connection.execute('DESCRIBE conversations');
      console.table(conversationsStructure);

      console.log('\n📊 Structure de la table messages:');
      const [messagesStructure] = await connection.execute('DESCRIBE messages');
      console.table(messagesStructure);
    } else {
      console.log('❌ Erreur lors de la création des tables');
    }

  } catch (error) {
    console.error('💥 Erreur lors de la création des tables:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Exécuter le script
createMessagingTables().then(() => {
  console.log('\n🏁 Script terminé');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Erreur fatale:', error);
  process.exit(1);
});
