// fix-parent-student-table.js
// Script pour vérifier et corriger la structure de la table parent_student

const mysql = require('mysql2/promise');

const fixParentStudentTable = async () => {
  // Configuration de la base de données
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'chrono_carto',
  });

  try {
    console.log('🔍 Vérification de la structure de la table parent_student\n');

    // 1. Vérifier si la table existe
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'chrono_carto' AND TABLE_NAME = 'parent_student'
    `);

    if (tables.length === 0) {
      console.log('❌ La table parent_student n\'existe pas');
      return;
    }

    console.log('✅ La table parent_student existe');

    // 2. Vérifier la structure actuelle
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY, EXTRA
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'chrono_carto' AND TABLE_NAME = 'parent_student'
      ORDER BY ORDINAL_POSITION
    `);

    console.log('\n📋 Structure actuelle de la table:');
    columns.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE} ${col.IS_NULLABLE === 'NO' ? 'NOT NULL' : 'NULL'} ${col.COLUMN_KEY ? `(${col.COLUMN_KEY})` : ''} ${col.EXTRA || ''}`);
    });

    // 3. Vérifier s'il y a déjà une colonne id
    const hasIdColumn = columns.some(col => col.COLUMN_NAME === 'id');
    const hasAutoIncrement = columns.some(col => col.EXTRA && col.EXTRA.includes('auto_increment'));

    console.log(`\n🔍 Analyse:`);
    console.log(`  - Colonne 'id' présente: ${hasIdColumn ? 'Oui' : 'Non'}`);
    console.log(`  - Auto-increment présent: ${hasAutoIncrement ? 'Oui' : 'Non'}`);

    if (hasIdColumn && hasAutoIncrement) {
      console.log('\n✅ La table a déjà la bonne structure');
      return;
    }

    // 4. Corriger la structure si nécessaire
    if (!hasIdColumn) {
      console.log('\n🔧 Suppression de la clé primaire existante...');
      await connection.execute(`
        ALTER TABLE parent_student 
        DROP PRIMARY KEY
      `);
      console.log('✅ Clé primaire supprimée');

      console.log('\n🔧 Ajout de la colonne id...');
      await connection.execute(`
        ALTER TABLE parent_student 
        ADD COLUMN id INT NOT NULL AUTO_INCREMENT PRIMARY KEY FIRST
      `);
      console.log('✅ Colonne id ajoutée');

      console.log('\n🔧 Ajout des clés étrangères...');
      await connection.execute(`
        ALTER TABLE parent_student 
        ADD CONSTRAINT fk_parent_student_parent 
        FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE
      `);
      await connection.execute(`
        ALTER TABLE parent_student 
        ADD CONSTRAINT fk_parent_student_student 
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
      `);
      console.log('✅ Clés étrangères ajoutées');
    } else if (!hasAutoIncrement) {
      console.log('\n🔧 Modification de la colonne id pour ajouter auto-increment...');
      await connection.execute(`
        ALTER TABLE parent_student 
        MODIFY COLUMN id INT NOT NULL AUTO_INCREMENT PRIMARY KEY
      `);
      console.log('✅ Auto-increment ajouté à la colonne id');
    }

    // 5. Vérifier la structure finale
    const [finalColumns] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY, EXTRA
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'chrono_carto' AND TABLE_NAME = 'parent_student'
      ORDER BY ORDINAL_POSITION
    `);

    console.log('\n📋 Structure finale de la table:');
    finalColumns.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE} ${col.IS_NULLABLE === 'NO' ? 'NOT NULL' : 'NULL'} ${col.COLUMN_KEY ? `(${col.COLUMN_KEY})` : ''} ${col.EXTRA || ''}`);
    });

    console.log('\n✅ Structure de la table parent_student corrigée avec succès!');

  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
  } finally {
    await connection.end();
  }
};

// Exécuter la correction
if (require.main === module) {
  fixParentStudentTable().catch(console.error);
}

module.exports = { fixParentStudentTable };
