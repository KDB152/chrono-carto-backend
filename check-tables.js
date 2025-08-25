// check-tables.js
// Script pour vérifier l'existence et la structure des tables

const mysql = require('mysql2/promise');

const checkTables = async () => {
  // Configuration de la base de données
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'chrono_carto',
  });

  try {
    console.log('🔍 Vérification des tables\n');

    // 1. Vérifier toutes les tables
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'chrono_carto'
      ORDER BY TABLE_NAME
    `);

    console.log('📋 Tables existantes:');
    tables.forEach(table => {
      console.log(`  - ${table.TABLE_NAME}`);
    });

    // 2. Vérifier la structure de la table parents
    console.log('\n📋 Structure de la table parents:');
    try {
      const [parentColumns] = await connection.execute(`
        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY, EXTRA
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = 'chrono_carto' AND TABLE_NAME = 'parents'
        ORDER BY ORDINAL_POSITION
      `);
      
      parentColumns.forEach(col => {
        console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE} ${col.IS_NULLABLE === 'NO' ? 'NOT NULL' : 'NULL'} ${col.COLUMN_KEY ? `(${col.COLUMN_KEY})` : ''} ${col.EXTRA || ''}`);
      });
    } catch (error) {
      console.log('  ❌ Table parents non trouvée');
    }

    // 3. Vérifier la structure de la table students
    console.log('\n📋 Structure de la table students:');
    try {
      const [studentColumns] = await connection.execute(`
        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY, EXTRA
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = 'chrono_carto' AND TABLE_NAME = 'students'
        ORDER BY ORDINAL_POSITION
      `);
      
      studentColumns.forEach(col => {
        console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE} ${col.IS_NULLABLE === 'NO' ? 'NOT NULL' : 'NULL'} ${col.COLUMN_KEY ? `(${col.COLUMN_KEY})` : ''} ${col.EXTRA || ''}`);
      });
    } catch (error) {
      console.log('  ❌ Table students non trouvée');
    }

    // 4. Vérifier la structure de la table parent_student
    console.log('\n📋 Structure de la table parent_student:');
    try {
      const [psColumns] = await connection.execute(`
        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY, EXTRA
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = 'chrono_carto' AND TABLE_NAME = 'parent_student'
        ORDER BY ORDINAL_POSITION
      `);
      
      psColumns.forEach(col => {
        console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE} ${col.IS_NULLABLE === 'NO' ? 'NOT NULL' : 'NULL'} ${col.COLUMN_KEY ? `(${col.COLUMN_KEY})` : ''} ${col.EXTRA || ''}`);
      });
    } catch (error) {
      console.log('  ❌ Table parent_student non trouvée');
    }

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  } finally {
    await connection.end();
  }
};

// Exécuter la vérification
if (require.main === module) {
  checkTables().catch(console.error);
}

module.exports = { checkTables };
