// cleanup-duplicate-tables.js
// Script pour nettoyer les tables en double et s'assurer que la structure est correcte

const mysql = require('mysql2/promise');

const cleanupDuplicateTables = async () => {
  // Configuration de la base de données
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'chrono_carto',
  });

  try {
    console.log('🧹 Nettoyage des tables en double\n');

    // 1. Vérifier les tables parent_student*
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'chrono_carto' AND TABLE_NAME LIKE 'parent_student%'
      ORDER BY TABLE_NAME
    `);

    console.log('📋 Tables parent_student trouvées:');
    tables.forEach(table => {
      console.log(`  - ${table.TABLE_NAME}`);
    });

    // 2. Vérifier la structure de parent_student_relations
    if (tables.some(t => t.TABLE_NAME === 'parent_student_relations')) {
      console.log('\n📋 Structure de parent_student_relations:');
      const [relationsColumns] = await connection.execute(`
        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY, EXTRA
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = 'chrono_carto' AND TABLE_NAME = 'parent_student_relations'
        ORDER BY ORDINAL_POSITION
      `);
      
      relationsColumns.forEach(col => {
        console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE} ${col.IS_NULLABLE === 'NO' ? 'NOT NULL' : 'NULL'} ${col.COLUMN_KEY ? `(${col.COLUMN_KEY})` : ''} ${col.EXTRA || ''}`);
      });

      // 3. Supprimer la table en double si elle existe
      console.log('\n🗑️ Suppression de la table parent_student_relations...');
      await connection.execute(`DROP TABLE IF EXISTS parent_student_relations`);
      console.log('✅ Table parent_student_relations supprimée');
    }

    // 4. Vérifier et corriger la structure de parent_student
    console.log('\n🔧 Vérification de la structure de parent_student...');
    const [psColumns] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY, EXTRA
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'chrono_carto' AND TABLE_NAME = 'parent_student'
      ORDER BY ORDINAL_POSITION
    `);

    console.log('📋 Structure actuelle de parent_student:');
    psColumns.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE} ${col.IS_NULLABLE === 'NO' ? 'NOT NULL' : 'NULL'} ${col.COLUMN_KEY ? `(${col.COLUMN_KEY})` : ''} ${col.EXTRA || ''}`);
    });

    // 5. Vérifier s'il manque des clés étrangères
    const [foreignKeys] = await connection.execute(`
      SELECT CONSTRAINT_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
      WHERE TABLE_SCHEMA = 'chrono_carto' AND TABLE_NAME = 'parent_student' AND REFERENCED_TABLE_NAME IS NOT NULL
    `);

    console.log('\n🔗 Clés étrangères existantes:');
    if (foreignKeys.length === 0) {
      console.log('  Aucune clé étrangère trouvée');
      
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
    } else {
      foreignKeys.forEach(fk => {
        console.log(`  - ${fk.CONSTRAINT_NAME}: ${fk.COLUMN_NAME} -> ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`);
      });
    }

    // 6. Vérifier s'il manque la colonne created_at
    const hasCreatedAt = psColumns.some(col => col.COLUMN_NAME === 'created_at');
    if (!hasCreatedAt) {
      console.log('\n🔧 Ajout de la colonne created_at...');
      await connection.execute(`
        ALTER TABLE parent_student 
        ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      `);
      console.log('✅ Colonne created_at ajoutée');
    } else {
      console.log('\n✅ Colonne created_at déjà présente');
    }

    console.log('\n✅ Nettoyage terminé avec succès!');

  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
  } finally {
    await connection.end();
  }
};

// Exécuter le nettoyage
if (require.main === module) {
  cleanupDuplicateTables().catch(console.error);
}

module.exports = { cleanupDuplicateTables };
