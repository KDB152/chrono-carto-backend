// Script pour vérifier TOUS les étudiants et leurs parents
const mysql = require('mysql2/promise');

// Configuration de la base de données
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'chrono_carto',
  port: parseInt(process.env.DB_PORT || '3306')
};

async function checkAllStudents() {
  let connection;
  
  try {
    console.log('🔍 Vérification de TOUS les étudiants...\n');
    
    connection = await mysql.createConnection(dbConfig);
    
    // 1. Compter tous les étudiants
    const [totalStudents] = await connection.execute('SELECT COUNT(*) as total FROM students');
    console.log('📊 Total étudiants dans la base:', totalStudents[0].total);
    
    // 2. Compter tous les paiements
    const [totalPayments] = await connection.execute('SELECT COUNT(*) as total FROM paiement');
    console.log('📊 Total paiements dans la base:', totalPayments[0].total);
    
    // 3. Vérifier les paiements sans parent_id
    const [paymentsWithoutParent] = await connection.execute('SELECT COUNT(*) as total FROM paiement WHERE parent_id IS NULL');
    console.log('❌ Paiements sans parent_id:', paymentsWithoutParent[0].total);
    
    // 4. Lister tous les étudiants avec leurs paiements
    const [allStudents] = await connection.execute(`
      SELECT 
        s.id as student_id,
        u.first_name as student_first_name,
        u.last_name as student_last_name,
        p.id as paiement_id,
        p.parent_id,
        parent_user.first_name as parent_first_name,
        parent_user.last_name as parent_last_name
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN paiement p ON s.id = p.student_id
      LEFT JOIN parents par ON p.parent_id = par.id
      LEFT JOIN users parent_user ON par.user_id = parent_user.id
      ORDER BY s.id
    `);
    
    console.log('\n📋 Liste de TOUS les étudiants:');
    allStudents.forEach((student, index) => {
      console.log(`${index + 1}. ${student.student_first_name} ${student.student_last_name} (ID: ${student.student_id})`);
      if (student.paiement_id) {
        if (student.parent_first_name && student.parent_last_name) {
          console.log(`   ✅ Paiement ID: ${student.paiement_id}, Parent: ${student.parent_first_name} ${student.parent_last_name}`);
        } else {
          console.log(`   ❌ Paiement ID: ${student.paiement_id}, Parent: NULL`);
        }
      } else {
        console.log(`   ⚠️  Pas de paiement enregistré`);
      }
      console.log('');
    });
    
    // 5. Vérifier les relations parent-student disponibles
    console.log('\n🔗 Relations parent-student disponibles:');
    const [parentStudentRelations] = await connection.execute(`
      SELECT 
        ps.student_id,
        ps.parent_id,
        s_user.first_name as student_first_name,
        s_user.last_name as student_last_name,
        p_user.first_name as parent_first_name,
        p_user.last_name as parent_last_name
      FROM parent_student ps
      JOIN students s ON ps.student_id = s.id
      JOIN users s_user ON s.user_id = s_user.id
      JOIN parents p ON ps.parent_id = p.id
      JOIN users p_user ON p.user_id = p_user.id
      ORDER BY ps.student_id
    `);
    
    console.log(`📊 Total relations parent-student: ${parentStudentRelations.length}`);
    parentStudentRelations.forEach((rel, index) => {
      console.log(`${index + 1}. Étudiant: ${rel.student_first_name} ${rel.student_last_name} (ID: ${rel.student_id})`);
      console.log(`   Parent: ${rel.parent_first_name} ${rel.parent_last_name} (ID: ${rel.parent_id})`);
      console.log('');
    });
    
    // 6. Identifier les étudiants qui ont des paiements mais pas de parent_id
    console.log('\n❌ Étudiants avec paiements mais sans parent_id:');
    const [studentsWithoutParentId] = await connection.execute(`
      SELECT 
        s.id as student_id,
        u.first_name as student_first_name,
        u.last_name as student_last_name,
        p.id as paiement_id,
        p.parent_id
      FROM students s
      JOIN users u ON s.user_id = u.id
      JOIN paiement p ON s.id = p.student_id
      WHERE p.parent_id IS NULL
      ORDER BY s.id
    `);
    
    if (studentsWithoutParentId.length === 0) {
      console.log('   ✅ Tous les étudiants avec paiements ont un parent_id !');
    } else {
      console.log(`   📊 ${studentsWithoutParentId.length} étudiants à corriger:`);
      studentsWithoutParentId.forEach((student, index) => {
        console.log(`   ${index + 1}. ${student.student_first_name} ${student.student_last_name} (Paiement ID: ${student.paiement_id})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Exécuter la vérification
checkAllStudents();
