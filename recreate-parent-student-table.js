// recreate-parent-student-table.js
// Script pour recréer la table parent_student avec la bonne structure

const mysql = require('mysql2/promise');

const recreateParentStudentTable = async () => {
  // Configuration de la base de données
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'chrono_carto',
  });

  try {
    console.log('🔧 Recréation de la table parent_student\n');

    // 1. Supprimer la table existante
    console.log('🗑️ Suppression de la table parent_student existante...');
    await connection.execute(`DROP TABLE IF EXISTS parent_student`);
    console.log('✅ Table supprimée');

    // 2. Créer la nouvelle table avec la bonne structure
    console.log('\n🔧 Création de la nouvelle table parent_student...');
    await connection.execute(`
      CREATE TABLE parent_student (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        parent_id INT NOT NULL,
        student_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Table parent_student créée avec succès');

    // 3. Vérifier la structure finale
    console.log('\n📋 Structure finale de la table:');
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY, EXTRA
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'chrono_carto' AND TABLE_NAME = 'parent_student'
      ORDER BY ORDINAL_POSITION
    `);
    
    columns.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE} ${col.IS_NULLABLE === 'NO' ? 'NOT NULL' : 'NULL'} ${col.COLUMN_KEY ? `(${col.COLUMN_KEY})` : ''} ${col.EXTRA || ''}`);
    });

    // 4. Vérifier les clés étrangères
    console.log('\n🔗 Clés étrangères créées:');
    const [foreignKeys] = await connection.execute(`
      SELECT CONSTRAINT_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
      WHERE TABLE_SCHEMA = 'chrono_carto' AND TABLE_NAME = 'parent_student' AND REFERENCED_TABLE_NAME IS NOT NULL
    `);
    
    foreignKeys.forEach(fk => {
      console.log(`  - ${fk.CONSTRAINT_NAME}: ${fk.COLUMN_NAME} -> ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`);
    });

    console.log('\n✅ Table parent_student recréée avec succès!');

  } catch (error) {
    console.error('❌ Erreur lors de la recréation:', error);
  } finally {
    await connection.end();
  }
};

// Exécuter la recréation
if (require.main === module) {
  recreateParentStudentTable().catch(console.error);
}

module.exports = { recreateParentStudentTable };
