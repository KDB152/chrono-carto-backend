const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'chrono_carto',
  port: process.env.DB_PORT || 3306
};

async function checkUserPasswords() {
  let connection;

  try {
    console.log('🔍 Vérification des mots de passe utilisateur...\n');
    connection = await mysql.createConnection(dbConfig);

    // Récupérer tous les utilisateurs approuvés
    const [users] = await connection.execute(`
      SELECT id, email, first_name, last_name, role, password_hash, is_approved, email_verified
      FROM users 
      WHERE is_approved = 1 AND email_verified = 1
      ORDER BY id
    `);

    console.log(`✅ ${users.length} utilisateur(s) approuvé(s) trouvé(s):\n`);

    users.forEach(user => {
      console.log(`👤 Utilisateur ID ${user.id}:`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Nom: ${user.first_name} ${user.last_name}`);
      console.log(`   Rôle: ${user.role}`);
      console.log(`   Mot de passe hashé: ${user.password_hash ? 'Présent' : 'Absent'}`);
      console.log(`   Approuvé: ${user.is_approved ? 'Oui' : 'Non'}`);
      console.log(`   Email vérifié: ${user.email_verified ? 'Oui' : 'Non'}`);
      console.log('');
    });

    // Test des mots de passe courants
    console.log('🔐 Test des mots de passe courants...\n');
    
    const commonPasswords = [
      'password123',
      'password',
      '123456',
      'admin',
      'user',
      'test',
      'chrono',
      'carto',
      'chronocarto'
    ];

    for (const user of users) {
      console.log(`Test pour ${user.email}:`);
      
      for (const password of commonPasswords) {
        const bcrypt = require('bcrypt');
        const isMatch = await bcrypt.compare(password, user.password_hash);
        
        if (isMatch) {
          console.log(`   ✅ Mot de passe trouvé: "${password}"`);
          break;
        }
      }
      console.log('');
    }

  } catch (error) {
    console.error('💥 Erreur lors de la vérification:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkUserPasswords().then(() => {
  console.log('🏁 Vérification terminée');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Erreur fatale:', error);
  process.exit(1);
});
