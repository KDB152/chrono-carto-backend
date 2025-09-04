// Script de vérification pour s'assurer que le prix des séances a été correctement mis à jour
const mysql = require('mysql2/promise');

// Configuration de la base de données
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'chrono_carto',
  port: parseInt(process.env.DB_PORT || '3306')
};

async function verifyPriceChanges() {
  let connection;
  
  try {
    console.log('🔍 Vérification des changements de prix des séances...\n');
    
    connection = await mysql.createConnection(dbConfig);
    
    // 1. Vérifier la structure de la table
    console.log('1. Vérification de la structure de la table paiement:');
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME, COLUMN_DEFAULT, COLUMN_COMMENT 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'paiement' AND COLUMN_NAME = 'prix_seance'
    `, [dbConfig.database]);
    
    if (columns.length > 0) {
      console.log(`   ✅ Prix par défaut: ${columns[0].COLUMN_DEFAULT}`);
      console.log(`   📝 Commentaire: ${columns[0].COLUMN_COMMENT}\n`);
    }
    
    // 2. Statistiques des prix actuels
    console.log('2. Statistiques des prix actuels:');
    const [stats] = await connection.execute(`
      SELECT 
        COUNT(*) as total_records,
        COUNT(CASE WHEN prix_seance = 40.00 THEN 1 END) as records_with_40dt,
        COUNT(CASE WHEN prix_seance = 50.00 THEN 1 END) as records_with_50euros,
        MIN(prix_seance) as min_price,
        MAX(prix_seance) as max_price,
        AVG(prix_seance) as average_price
      FROM paiement
    `);
    
    const stat = stats[0];
    console.log(`   📊 Total des enregistrements: ${stat.total_records}`);
    console.log(`   ✅ Enregistrements à 40dt: ${stat.records_with_40dt}`);
    console.log(`   ❌ Enregistrements à 50€: ${stat.records_with_50euros}`);
    console.log(`   📈 Prix minimum: ${stat.min_price}dt`);
    console.log(`   📈 Prix maximum: ${stat.max_price}dt`);
    console.log(`   📈 Prix moyen: ${parseFloat(stat.average_price).toFixed(2)}dt\n`);
    
    // 3. Vérifier la cohérence des calculs
    console.log('3. Vérification de la cohérence des calculs:');
    const [calculations] = await connection.execute(`
      SELECT 
        COUNT(*) as total_records,
        COUNT(CASE WHEN ABS(montant_total - (seances_total * prix_seance)) < 0.01 THEN 1 END) as correct_total_calculations,
        COUNT(CASE WHEN ABS(montant_restant - ((seances_total * prix_seance) - montant_paye)) < 0.01 THEN 1 END) as correct_remaining_calculations
      FROM paiement
      WHERE seances_total > 0
    `);
    
    const calc = calculations[0];
    console.log(`   📊 Total des enregistrements avec séances: ${calc.total_records}`);
    console.log(`   ✅ Calculs de montant_total corrects: ${calc.correct_total_calculations}`);
    console.log(`   ✅ Calculs de montant_restant corrects: ${calc.correct_remaining_calculations}\n`);
    
    // 4. Exemples d'enregistrements
    console.log('4. Exemples d\'enregistrements mis à jour:');
    const [examples] = await connection.execute(`
      SELECT 
        id,
        student_id,
        seances_total,
        prix_seance,
        montant_total,
        montant_paye,
        montant_restant,
        statut
      FROM paiement 
      WHERE prix_seance = 40.00
      ORDER BY id DESC
      LIMIT 3
    `);
    
    examples.forEach((example, index) => {
      console.log(`   📋 Exemple ${index + 1}:`);
      console.log(`      ID: ${example.id}, Étudiant: ${example.student_id}`);
      console.log(`      Séances: ${example.seances_total}, Prix: ${example.prix_seance}dt`);
      console.log(`      Total: ${example.montant_total}dt, Payé: ${example.montant_paye}dt, Restant: ${example.montant_restant}dt`);
      console.log(`      Statut: ${example.statut}\n`);
    });
    
    // 5. Résumé final
    console.log('5. Résumé final:');
    if (stat.records_with_50euros === 0) {
      console.log('   ✅ Tous les enregistrements ont été mis à jour avec succès!');
    } else {
      console.log(`   ⚠️  Il reste ${stat.records_with_50euros} enregistrements à 50€ à mettre à jour.`);
    }
    
    if (calc.correct_total_calculations === calc.total_records && calc.correct_remaining_calculations === calc.total_records) {
      console.log('   ✅ Tous les calculs de montants sont cohérents!');
    } else {
      console.log('   ⚠️  Certains calculs de montants ne sont pas cohérents.');
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
verifyPriceChanges();
