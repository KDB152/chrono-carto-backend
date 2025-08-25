const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'chrono_carto',
  port: process.env.DB_PORT || 3306
};

async function resetUserPasswords() {
  let connection;

  try {
    console.log('🔧 Réinitialisation des mots de passe utilisateur...\n');
    connection = await mysql.createConnection(dbConfig);

    // Nouveau mot de passe pour tous les utilisateurs
    const newPassword = 'password123';
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    console.log(`Nouveau mot de passe: "${newPassword}"`);
    console.log(`Mot de passe hashé: ${hashedPassword.substring(0, 20)}...\n`);

    // Mettre à jour tous les utilisateurs approuvés
    const [result] = await connection.execute(`
      UPDATE users 
      SET password_hash = ? 
      WHERE is_approved = 1 AND email_verified = 1
    `, [hashedPassword]);

    console.log(`✅ ${result.affectedRows} utilisateur(s) mis à jour`);

    // Vérifier les utilisateurs mis à jour
    const [users] = await connection.execute(`
      SELECT id, email, first_name, last_name, role, is_approved, email_verified
      FROM users 
      WHERE is_approved = 1 AND email_verified = 1
      ORDER BY id
    `);

    console.log('\n👥 Utilisateurs mis à jour:');
    users.forEach(user => {
      console.log(`   ID ${user.id}: ${user.first_name} ${user.last_name} (${user.email}) - ${user.role}`);
    });

    console.log(`\n🔐 Nouveau mot de passe pour tous les utilisateurs: "${newPassword}"`);

  } catch (error) {
    console.error('💥 Erreur lors de la réinitialisation:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

resetUserPasswords().then(() => {
  console.log('\n🏁 Réinitialisation terminée');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Erreur fatale:', error);
  process.exit(1);
});
