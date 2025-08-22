const mysql = require('mysql2/promise');

// Configuration de la base de données - ajustez selon votre configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'chrono_carto',
  port: process.env.DB_PORT || 3306
};

const testEmails = [
  'lucas.dubois@student.fr',
  'emma.martin@student.fr', 
  'thomas.bernard@student.fr',
  'sophie.leroy@student.fr',
  'marie.dubois@parent.fr',
  'jean.martin@parent.fr',
  'pierre.bernard@parent.fr'
];

async function cleanTestUsers() {
  let connection;
  
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('Cleaning test users from database...');
    let deletedCount = 0;
    
    for (const email of testEmails) {
      try {
        // Vérifier si l'utilisateur existe
        const [users] = await connection.execute(
          'SELECT id, role FROM users WHERE email = ?',
          [email]
        );
        
        if (users.length > 0) {
          const user = users[0];
          console.log(`Deleting test user: ${email} (ID: ${user.id}, Role: ${user.role})`);
          
          // Supprimer d'abord les profils associés
          if (user.role === 'student') {
            await connection.execute(
              'DELETE FROM students WHERE user_id = ?',
              [user.id]
            );
          } else if (user.role === 'parent') {
            await connection.execute(
              'DELETE FROM parents WHERE user_id = ?',
              [user.id]
            );
          }
          
          // Supprimer l'utilisateur
          await connection.execute(
            'DELETE FROM users WHERE id = ?',
            [user.id]
          );
          
          deletedCount++;
        }
      } catch (error) {
        console.log(`Error deleting test user ${email}:`, error.message);
      }
    }
    
    console.log(`Successfully cleaned ${deletedCount} test users from database.`);
    
  } catch (error) {
    console.error('Database connection error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Exécuter le script
cleanTestUsers().then(() => {
  console.log('Cleanup completed.');
  process.exit(0);
}).catch((error) => {
  console.error('Cleanup failed:', error);
  process.exit(1);
});
