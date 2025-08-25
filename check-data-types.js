// check-data-types.js
// Script pour vérifier les types de données et identifier le problème avec les clés étrangères

const mysql = require('mysql2/promise');

const checkDataTypes = async () => {
  // Configuration de la base de données
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'chrono_carto',
  });

  try {
    console.log('🔍 Vérification des types de données\n');

    // 1. Vérifier le type de la colonne id dans parents
    console.log('📋 Table parents - colonne id:');
    const [parentId] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY, EXTRA
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'chrono_carto' AND TABLE_NAME = 'parents' AND COLUMN_NAME = 'id'
    `);
    
    if (parentId.length > 0) {
      const col = parentId[0];
      console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE} ${col.IS_NULLABLE === 'NO' ? 'NOT NULL' : 'NULL'} ${col.COLUMN_KEY ? `(${col.COLUMN_KEY})` : ''} ${col.EXTRA || ''}`);
    }

    // 2. Vérifier le type de la colonne id dans students
    console.log('\n📋 Table students - colonne id:');
    const [studentId] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY, EXTRA
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'chrono_carto' AND TABLE_NAME = 'students' AND COLUMN_NAME = 'id'
    `);
    
    if (studentId.length > 0) {
      const col = studentId[0];
      console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE} ${col.IS_NULLABLE === 'NO' ? 'NOT NULL' : 'NULL'} ${col.COLUMN_KEY ? `(${col.COLUMN_KEY})` : ''} ${col.EXTRA || ''}`);
    }

    // 3. Vérifier les types dans parent_student
    console.log('\n📋 Table parent_student - colonnes parent_id et student_id:');
    const [psColumns] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY, EXTRA
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'chrono_carto' AND TABLE_NAME = 'parent_student' AND COLUMN_NAME IN ('parent_id', 'student_id')
      ORDER BY COLUMN_NAME
    `);
    
    psColumns.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE} ${col.IS_NULLABLE === 'NO' ? 'NOT NULL' : 'NULL'} ${col.COLUMN_KEY ? `(${col.COLUMN_KEY})` : ''} ${col.EXTRA || ''}`);
    });

    // 4. Vérifier s'il y a des données dans les tables
    console.log('\n📊 Données dans les tables:');
    
    const [parentCount] = await connection.execute(`SELECT COUNT(*) as count FROM parents`);
    console.log(`  - parents: ${parentCount[0].count} enregistrements`);
    
    const [studentCount] = await connection.execute(`SELECT COUNT(*) as count FROM students`);
    console.log(`  - students: ${studentCount[0].count} enregistrements`);
    
    const [psCount] = await connection.execute(`SELECT COUNT(*) as count FROM parent_student`);
    console.log(`  - parent_student: ${psCount[0].count} enregistrements`);

    // 5. Vérifier s'il y a des valeurs NULL ou invalides
    if (psCount[0].count > 0) {
      console.log('\n🔍 Vérification des valeurs dans parent_student:');
      
      const [nullParentIds] = await connection.execute(`SELECT COUNT(*) as count FROM parent_student WHERE parent_id IS NULL`);
      console.log(`  - parent_id NULL: ${nullParentIds[0].count}`);
      
      const [nullStudentIds] = await connection.execute(`SELECT COUNT(*) as count FROM parent_student WHERE student_id IS NULL`);
      console.log(`  - student_id NULL: ${nullStudentIds[0].count}`);
      
      // Vérifier les références orphelines
      const [orphanParentIds] = await connection.execute(`
        SELECT COUNT(*) as count 
        FROM parent_student ps 
        LEFT JOIN parents p ON ps.parent_id = p.id 
        WHERE p.id IS NULL
      `);
      console.log(`  - Références parent_id orphelines: ${orphanParentIds[0].count}`);
      
      const [orphanStudentIds] = await connection.execute(`
        SELECT COUNT(*) as count 
        FROM parent_student ps 
        LEFT JOIN students s ON ps.student_id = s.id 
        WHERE s.id IS NULL
      `);
      console.log(`  - Références student_id orphelines: ${orphanStudentIds[0].count}`);
    }

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  } finally {
    await connection.end();
  }
};

// Exécuter la vérification
if (require.main === module) {
  checkDataTypes().catch(console.error);
}

module.exports = { checkDataTypes };
