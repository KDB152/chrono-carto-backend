const mysql = require('mysql2/promise');

async function testDatabaseConnection() {
  console.log('🔍 Testing Database Connection...\n');

  try {
    // Database configuration
    const dbConfig = {
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'chrono_carto'
    };

    console.log('Connecting to database with config:', {
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      database: dbConfig.database
    });

    // Create connection
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connection successful!');

    // Test if quiz table exists
    const [tables] = await connection.execute('SHOW TABLES LIKE "quizzes"');
    console.log('Quiz table exists:', tables.length > 0);

    if (tables.length > 0) {
      // Check table structure
      const [columns] = await connection.execute('DESCRIBE quizzes');
      console.log('Quiz table columns:', columns.map(col => col.Field));
    } else {
      console.log('❌ Quiz table does not exist');
    }

    // Check if question table exists
    const [questionTables] = await connection.execute('SHOW TABLES LIKE "quiz_questions"');
    console.log('Question table exists:', questionTables.length > 0);

    if (questionTables.length > 0) {
      const [questionColumns] = await connection.execute('DESCRIBE quiz_questions');
      console.log('Question table columns:', questionColumns.map(col => col.Field));
    }

    // Check if quiz_attempts table exists
    const [attemptTables] = await connection.execute('SHOW TABLES LIKE "quiz_attempts"');
    console.log('Quiz attempts table exists:', attemptTables.length > 0);

    await connection.end();
    console.log('✅ Database connection closed');

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Full error:', error);
  }
}

// Run the test
testDatabaseConnection();
