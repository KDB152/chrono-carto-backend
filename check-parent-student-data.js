// check-parent-student-data.js
// Script pour vérifier les données créées dans la base de données

const mysql = require('mysql2/promise');

const checkDatabaseData = async () => {
  // Configuration de la base de données
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'chrono_carto',
  });

  try {
    console.log('🔍 Vérification des données dans la base de données\n');

    // 1. Vérifier les utilisateurs créés
    console.log('👥 Utilisateurs créés:');
    const [users] = await connection.execute(`
      SELECT id, email, first_name, last_name, role, is_approved, is_active, email_verified, created_at 
      FROM users 
      ORDER BY created_at DESC 
      LIMIT 10
    `);
    
    users.forEach(user => {
      console.log(`  - ID: ${user.id} | Email: ${user.email} | Nom: ${user.first_name} ${user.last_name}`);
      console.log(`    Rôle: ${user.role} | Approuvé: ${user.is_approved} | Actif: ${user.is_active} | Email vérifié: ${user.email_verified}`);
      console.log(`    Créé le: ${user.created_at}\n`);
    });

    // 2. Vérifier les étudiants
    console.log('🎓 Étudiants créés:');
    const [students] = await connection.execute(`
      SELECT s.id, s.user_id, s.class_level, s.birth_date, s.phone_number, s.parent_id,
             u.email, u.first_name, u.last_name
      FROM students s
      JOIN users u ON s.user_id = u.id
      ORDER BY s.id DESC
    `);
    
    students.forEach(student => {
      console.log(`  - ID: ${student.id} | User ID: ${student.user_id} | Email: ${student.email}`);
      console.log(`    Nom: ${student.first_name} ${student.last_name} | Classe: ${student.class_level}`);
      console.log(`    Date de naissance: ${student.birth_date} | Téléphone: ${student.phone_number}`);
      console.log(`    Parent ID: ${student.parent_id || 'Aucun'}\n`);
    });

    // 3. Vérifier les parents
    console.log('👨‍👩‍👧‍👦 Parents créés:');
    const [parents] = await connection.execute(`
      SELECT p.id, p.user_id, p.phone_number, p.address, p.occupation,
             u.email, u.first_name, u.last_name, u.is_approved, u.is_active
      FROM parents p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.id DESC
    `);
    
    parents.forEach(parent => {
      console.log(`  - ID: ${parent.id} | User ID: ${parent.user_id} | Email: ${parent.email}`);
      console.log(`    Nom: ${parent.first_name} ${parent.last_name} | Téléphone: ${parent.phone_number}`);
      console.log(`    Adresse: ${parent.address || 'Non renseignée'} | Profession: ${parent.occupation || 'Non renseignée'}`);
      console.log(`    Approuvé: ${parent.is_approved} | Actif: ${parent.is_active}\n`);
    });

    // 4. Vérifier les relations parent-student
    console.log('🔗 Relations parent-student:');
    const [relations] = await connection.execute(`
      SELECT ps.id, ps.parent_id, ps.student_id, ps.created_at,
             pu.first_name as parent_first_name, pu.last_name as parent_last_name, pu.email as parent_email,
             su.first_name as student_first_name, su.last_name as student_last_name, su.email as student_email
      FROM parent_student ps
      JOIN parents p ON ps.parent_id = p.id
      JOIN users pu ON p.user_id = pu.id
      JOIN students s ON ps.student_id = s.id
      JOIN users su ON s.user_id = su.id
      ORDER BY ps.created_at DESC
    `);
    
    if (relations.length === 0) {
      console.log('  Aucune relation parent-student trouvée');
    } else {
      relations.forEach(relation => {
        console.log(`  - ID: ${relation.id} | Parent: ${relation.parent_first_name} ${relation.parent_last_name} (${relation.parent_email})`);
        console.log(`    Étudiant: ${relation.student_first_name} ${relation.student_last_name} (${relation.student_email})`);
        console.log(`    Créé le: ${relation.created_at}\n`);
      });
    }

    // 5. Résumé des comptes créés automatiquement
    console.log('📊 Résumé des comptes parents créés automatiquement:');
    const [autoParents] = await connection.execute(`
      SELECT COUNT(*) as count
      FROM users u
      JOIN parents p ON u.id = p.user_id
      WHERE u.role = 'parent' AND u.is_approved = 0 AND u.is_active = 0
    `);
    
    console.log(`  - Comptes parents non approuvés et non actifs: ${autoParents[0].count}`);

    const [approvedParents] = await connection.execute(`
      SELECT COUNT(*) as count
      FROM users u
      JOIN parents p ON u.id = p.user_id
      WHERE u.role = 'parent' AND u.is_approved = 1 AND u.is_active = 1
    `);
    
    console.log(`  - Comptes parents approuvés et actifs: ${approvedParents[0].count}`);

  } catch (error) {
    console.error('❌ Erreur lors de la vérification des données:', error);
  } finally {
    await connection.end();
  }
};

// Exécuter la vérification
if (require.main === module) {
  checkDatabaseData().catch(console.error);
}

module.exports = { checkDatabaseData };
