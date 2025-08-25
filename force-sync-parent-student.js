// force-sync-parent-student.js
// Script pour forcer la synchronisation correcte de la table parent_student

const mysql = require('mysql2/promise');

const forceSyncParentStudent = async () => {
  // Configuration de la base de données
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'chrono_carto',
  });

  try {
    console.log('🔧 Forçage de la synchronisation de parent_student\n');

    // 1. Vérifier la structure actuelle
    console.log('📋 Structure actuelle de parent_student:');
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY, EXTRA
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'chrono_carto' AND TABLE_NAME = 'parent_student'
      ORDER BY ORDINAL_POSITION
    `);
    
    columns.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE} ${col.IS_NULLABLE === 'NO' ? 'NOT NULL' : 'NULL'} ${col.COLUMN_KEY ? `(${col.COLUMN_KEY})` : ''} ${col.EXTRA || ''}`);
    });

    // 2. Vérifier les clés étrangères
    console.log('\n🔗 Clés étrangères existantes:');
    const [foreignKeys] = await connection.execute(`
      SELECT CONSTRAINT_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
      WHERE TABLE_SCHEMA = 'chrono_carto' AND TABLE_NAME = 'parent_student' AND REFERENCED_TABLE_NAME IS NOT NULL
    `);
    
    if (foreignKeys.length === 0) {
      console.log('  Aucune clé étrangère trouvée - ajout...');
      
      // Ajouter les clés étrangères
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

    // 3. Vérifier si la colonne created_at a le bon type
    const createdAtColumn = columns.find(col => col.COLUMN_NAME === 'created_at');
    if (createdAtColumn && createdAtColumn.DATA_TYPE !== 'timestamp') {
      console.log('\n🔧 Correction du type de created_at...');
      await connection.execute(`
        ALTER TABLE parent_student 
        MODIFY COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      `);
      console.log('✅ Type de created_at corrigé');
    }

    // 4. Vérifier les index
    console.log('\n📊 Index existants:');
    const [indexes] = await connection.execute(`
      SELECT INDEX_NAME, COLUMN_NAME, NON_UNIQUE
      FROM INFORMATION_SCHEMA.STATISTICS 
      WHERE TABLE_SCHEMA = 'chrono_carto' AND TABLE_NAME = 'parent_student'
      ORDER BY INDEX_NAME, SEQ_IN_INDEX
    `);
    
    indexes.forEach(idx => {
      console.log(`  - ${idx.INDEX_NAME}: ${idx.COLUMN_NAME} ${idx.NON_UNIQUE ? '(non-unique)' : '(unique)'}`);
    });

    // 5. Vérifier s'il y a des contraintes de clé primaire multiples
    const primaryKeys = columns.filter(col => col.COLUMN_KEY === 'PRI');
    if (primaryKeys.length > 1) {
      console.log('\n⚠️ Plusieurs clés primaires détectées - nettoyage...');
      // Supprimer les clés primaires multiples sauf la première
      for (let i = 1; i < primaryKeys.length; i++) {
        await connection.execute(`
          ALTER TABLE parent_student 
          DROP PRIMARY KEY
        `);
      }
      // Recréer la clé primaire sur id
      await connection.execute(`
        ALTER TABLE parent_student 
        ADD PRIMARY KEY (id)
      `);
      console.log('✅ Clés primaires nettoyées');
    }

    console.log('\n✅ Synchronisation forcée terminée!');

  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation:', error);
  } finally {
    await connection.end();
  }
};

// Exécuter la synchronisation
if (require.main === module) {
  forceSyncParentStudent().catch(console.error);
}

module.exports = { forceSyncParentStudent };
