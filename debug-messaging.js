const mysql = require('mysql2/promise');

async function debugMessaging() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'chrono_carto'
  });

  try {
    console.log('=== DEBUGGING MESSAGING SYSTEM ===\n');

    // 1. Check available users
    console.log('1. Available users:');
    const [users] = await connection.execute(`
      SELECT id, email, first_name, last_name, role, is_approved, is_active 
      FROM users 
      WHERE is_approved = 1 AND is_active = 1
      ORDER BY id
    `);
    console.log(users);
    console.log('');

    // 2. Check conversations table
    console.log('2. Existing conversations:');
    const [conversations] = await connection.execute(`
      SELECT * FROM conversations ORDER BY id
    `);
    console.log(conversations);
    console.log('');

    // 3. Check messages table
    console.log('3. Existing messages:');
    const [messages] = await connection.execute(`
      SELECT * FROM messages ORDER BY id
    `);
    console.log(messages);
    console.log('');

    // 4. Test the available recipients query for user ID 28
    console.log('4. Available recipients for user ID 28:');
    const [recipients] = await connection.execute(`
      SELECT id, email, first_name, last_name, role 
      FROM users 
      WHERE is_approved = 1 AND is_active = 1 AND id != 28
      ORDER BY first_name ASC, last_name ASC
    `);
    console.log(recipients);
    console.log('');

    // 5. Test conversation creation manually
    console.log('5. Testing conversation creation manually:');
    const participant1Id = 28;
    const participant2Id = 36;
    
    console.log(`Creating conversation between ${participant1Id} and ${participant2Id}`);
    
    // Check if conversation already exists
    const [existingConv] = await connection.execute(`
      SELECT * FROM conversations 
      WHERE (participant1_id = ? AND participant2_id = ?) 
         OR (participant1_id = ? AND participant2_id = ?)
      LIMIT 1
    `, [participant1Id, participant2Id, participant2Id, participant1Id]);
    
    if (existingConv.length > 0) {
      console.log('Conversation already exists:', existingConv[0]);
    } else {
      // Create new conversation
      const [result] = await connection.execute(`
        INSERT INTO conversations (participant1_id, participant2_id, type, created_at, updated_at)
        VALUES (?, ?, 'direct', NOW(), NOW())
      `, [participant1Id, participant2Id]);
      
      console.log('New conversation created with ID:', result.insertId);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

debugMessaging();
