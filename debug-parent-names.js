// Script de diagnostic pour comprendre pourquoi les noms des parents ne s'affichent pas
const mysql = require('mysql2/promise');

// Configuration de la base de données
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'chrono_carto',
  port: parseInt(process.env.DB_PORT || '3306')
};

async function debugParentNames() {
  let connection;
  
  try {
    console.log('🔍 Diagnostic des noms de parents...\n');
    
    connection = await mysql.createConnection(dbConfig);
    
    // 1. Vérifier la structure des tables
    console.log('1. Structure des tables:');
    
    const [paiementColumns] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'paiement'
      ORDER BY ORDINAL_POSITION
    `, [dbConfig.database]);
    
    console.log('   📋 Colonnes de la table paiement:');
    paiementColumns.forEach(col => {
      console.log(`      - ${col.COLUMN_NAME}: ${col.DATA_TYPE} (${col.IS_NULLABLE === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    const [parentsColumns] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'parents'
      ORDER BY ORDINAL_POSITION
    `, [dbConfig.database]);
    
    console.log('\n   📋 Colonnes de la table parents:');
    parentsColumns.forEach(col => {
      console.log(`      - ${col.COLUMN_NAME}: ${col.DATA_TYPE} (${col.IS_NULLABLE === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    // 2. Vérifier les données dans la table paiement
    console.log('\n2. Données dans la table paiement:');
    const [paiementData] = await connection.execute(`
      SELECT 
        id, 
        student_id, 
        parent_id,
        seances_total,
        statut
      FROM paiement 
      LIMIT 5
    `);
    
    console.log('   📊 Exemples de paiements:');
    paiementData.forEach(p => {
      console.log(`      ID: ${p.id}, Étudiant: ${p.student_id}, Parent: ${p.parent_id}, Statut: ${p.statut}`);
    });
    
    // 3. Vérifier les données dans la table parents
    console.log('\n3. Données dans la table parents:');
    const [parentsData] = await connection.execute(`
      SELECT 
        id, 
        user_id,
        phone_number
      FROM parents 
      LIMIT 5
    `);
    
    console.log('   👨‍👩‍👧‍👦 Exemples de parents:');
    parentsData.forEach(p => {
      console.log(`      ID: ${p.id}, User ID: ${p.user_id}, Téléphone: ${p.phone_number}`);
    });
    
    // 4. Vérifier les données dans la table users
    console.log('\n4. Données dans la table users (parents):');
    const [parentUsers] = await connection.execute(`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        p.id as parent_id
      FROM users u
      JOIN parents p ON u.id = p.user_id
      LIMIT 5
    `);
    
    console.log('   👤 Exemples d\'utilisateurs parents:');
    parentUsers.forEach(u => {
      console.log(`      User ID: ${u.id}, Nom: ${u.first_name} ${u.last_name}, Parent ID: ${u.parent_id}`);
    });
    
    // 5. Tester la requête complète
    console.log('\n5. Test de la requête complète:');
    const [fullQuery] = await connection.execute(`
      SELECT 
        p.id,
        p.student_id,
        p.parent_id,
        u.first_name as student_first_name,
        u.last_name as student_last_name,
        parent_user.first_name as parent_first_name,
        parent_user.last_name as parent_last_name,
        parent_user.id as parent_user_id,
        par.id as parent_table_id
      FROM paiement p
      JOIN students s ON p.student_id = s.id
      JOIN users u ON s.user_id = u.id
      LEFT JOIN parents par ON p.parent_id = par.id
      LEFT JOIN users parent_user ON par.user_id = parent_user.id
      LIMIT 3
    `);
    
    console.log('   🔍 Résultats de la requête complète:');
    fullQuery.forEach(row => {
      console.log(`      Paiement ID: ${row.id}`);
      console.log(`        Étudiant: ${row.student_first_name} ${row.student_last_name}`);
      console.log(`        Parent ID dans paiement: ${row.parent_id}`);
      console.log(`        Parent ID dans table parents: ${row.parent_table_id}`);
      console.log(`        Parent User ID: ${row.parent_user_id}`);
      console.log(`        Parent nom: ${row.parent_first_name || 'NULL'} ${row.parent_last_name || 'NULL'}`);
      console.log('');
    });
    
    // 6. Vérifier les relations parent-student
    console.log('6. Relations parent-student:');
    const [parentStudentRelations] = await connection.execute(`
      SELECT 
        ps.parent_id,
        ps.student_id,
        p_user.first_name as parent_first_name,
        p_user.last_name as parent_last_name,
        s_user.first_name as student_first_name,
        s_user.last_name as student_last_name
      FROM parent_student ps
      JOIN parents p ON ps.parent_id = p.id
      JOIN users p_user ON p.user_id = p_user.id
      JOIN students s ON ps.student_id = s.id
      JOIN users s_user ON s.user_id = s_user.id
      LIMIT 5
    `);
    
    console.log('   🔗 Relations parent-student:');
    parentStudentRelations.forEach(rel => {
      console.log(`      Parent: ${rel.parent_first_name} ${rel.parent_last_name} (ID: ${rel.parent_id})`);
      console.log(`      Étudiant: ${rel.student_first_name} ${rel.student_last_name} (ID: ${rel.student_id})`);
      console.log('');
    });
    
    // 7. Vérifier si les paiements ont des parent_id corrects
    console.log('7. Vérification des parent_id dans les paiements:');
    const [paiementParentCheck] = await connection.execute(`
      SELECT 
        p.id as paiement_id,
        p.student_id,
        p.parent_id,
        ps.parent_id as relation_parent_id,
        CASE 
          WHEN p.parent_id IS NULL THEN 'parent_id est NULL'
          WHEN p.parent_id = ps.parent_id THEN 'parent_id correspond à la relation'
          ELSE 'parent_id ne correspond pas à la relation'
        END as statut_parent_id
      FROM paiement p
      LEFT JOIN parent_student ps ON p.student_id = ps.student_id
      LIMIT 5
    `);
    
    console.log('   🔍 Vérification des parent_id:');
    paiementParentCheck.forEach(check => {
      console.log(`      Paiement ID: ${check.paiement_id}, Étudiant: ${check.student_id}`);
      console.log(`        parent_id dans paiement: ${check.parent_id}`);
      console.log(`        parent_id dans relation: ${check.relation_parent_id}`);
      console.log(`        Statut: ${check.statut_parent_id}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Exécuter le diagnostic
debugParentNames();
