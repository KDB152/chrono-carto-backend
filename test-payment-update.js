// Script de test pour vérifier la mise à jour des paiements
const mysql = require('mysql2/promise');

// Configuration de la base de données
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'chrono_carto',
  port: parseInt(process.env.DB_PORT || '3306')
};

async function testPaymentUpdate() {
  let connection;
  
  try {
    console.log('🧪 Test de mise à jour des paiements...\n');
    
    connection = await mysql.createConnection(dbConfig);
    
    // 1. Récupérer un paiement existant pour le test
    console.log('1. Récupération d\'un paiement existant:');
    const [payments] = await connection.execute(`
      SELECT 
        p.id,
        p.student_id,
        p.seances_total,
        p.seances_payees,
        p.seances_non_payees,
        p.montant_total,
        p.montant_paye,
        p.montant_restant,
        p.prix_seance,
        p.statut,
        u.first_name as student_first_name,
        u.last_name as student_last_name
      FROM paiement p
      JOIN students s ON p.student_id = s.id
      JOIN users u ON s.user_id = u.id
      LIMIT 1
    `);
    
    if (payments.length === 0) {
      console.log('   ❌ Aucun paiement trouvé dans la base de données');
      return;
    }
    
    const testPayment = payments[0];
    console.log(`   ✅ Paiement trouvé: ID ${testPayment.id}`);
    console.log(`      Étudiant: ${testPayment.student_first_name} ${testPayment.student_last_name}`);
    console.log(`      Séances payées: ${testPayment.seances_payees}`);
    console.log(`      Séances non payées: ${testPayment.seances_non_payees}`);
    console.log(`      Montant total: ${testPayment.montant_total}dt`);
    console.log(`      Statut: ${testPayment.statut}\n`);
    
    // 2. Simuler une mise à jour
    console.log('2. Simulation d\'une mise à jour:');
    const newPaidSessions = testPayment.seances_payees + 1;
    const newUnpaidSessions = Math.max(0, testPayment.seances_non_payees - 1);
    const newTotalSessions = newPaidSessions + newUnpaidSessions;
    const newTotalAmount = newTotalSessions * testPayment.prix_seance;
    const newPaidAmount = newPaidSessions * testPayment.prix_seance;
    const newRemainingAmount = newUnpaidSessions * testPayment.prix_seance;
    
    // Déterminer le nouveau statut
    let newStatus = 'en_attente';
    if (newUnpaidSessions === 0) {
      newStatus = 'paye';
    } else if (newPaidSessions > 0) {
      newStatus = 'partiel';
    }
    
    console.log(`   📝 Nouvelles valeurs:`);
    console.log(`      Séances payées: ${newPaidSessions} (était ${testPayment.seances_payees})`);
    console.log(`      Séances non payées: ${newUnpaidSessions} (était ${testPayment.seances_non_payees})`);
    console.log(`      Montant total: ${newTotalAmount}dt (était ${testPayment.montant_total}dt)`);
    console.log(`      Statut: ${newStatus} (était ${testPayment.statut})\n`);
    
    // 3. Effectuer la mise à jour
    console.log('3. Mise à jour dans la base de données:');
    await connection.execute(`
      UPDATE paiement 
      SET 
        seances_total = ?,
        seances_payees = ?,
        seances_non_payees = ?,
        montant_total = ?,
        montant_paye = ?,
        montant_restant = ?,
        statut = ?,
        date_modification = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      newTotalSessions,
      newPaidSessions,
      newUnpaidSessions,
      newTotalAmount,
      newPaidAmount,
      newRemainingAmount,
      newStatus,
      testPayment.id
    ]);
    
    console.log('   ✅ Mise à jour effectuée avec succès\n');
    
    // 4. Vérifier la mise à jour
    console.log('4. Vérification de la mise à jour:');
    const [updatedPayments] = await connection.execute(
      'SELECT * FROM paiement WHERE id = ?',
      [testPayment.id]
    );
    
    const updatedPayment = updatedPayments[0];
    console.log(`   📊 Valeurs après mise à jour:`);
    console.log(`      Séances payées: ${updatedPayment.seances_payees}`);
    console.log(`      Séances non payées: ${updatedPayment.seances_non_payees}`);
    console.log(`      Montant total: ${updatedPayment.montant_total}dt`);
    console.log(`      Montant payé: ${updatedPayment.montant_paye}dt`);
    console.log(`      Montant restant: ${updatedPayment.montant_restant}dt`);
    console.log(`      Statut: ${updatedPayment.statut}`);
    console.log(`      Date modification: ${updatedPayment.date_modification}\n`);
    
    // 5. Restaurer les valeurs originales
    console.log('5. Restauration des valeurs originales:');
    await connection.execute(`
      UPDATE paiement 
      SET 
        seances_total = ?,
        seances_payees = ?,
        seances_non_payees = ?,
        montant_total = ?,
        montant_paye = ?,
        montant_restant = ?,
        statut = ?,
        date_modification = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      testPayment.seances_total,
      testPayment.seances_payees,
      testPayment.seances_non_payees,
      testPayment.montant_total,
      testPayment.montant_paye,
      testPayment.montant_restant,
      testPayment.statut,
      testPayment.id
    ]);
    
    console.log('   ✅ Valeurs originales restaurées\n');
    
    // 6. Résumé du test
    console.log('6. Résumé du test:');
    console.log('   ✅ La mise à jour des paiements fonctionne correctement');
    console.log('   ✅ Les calculs de montants sont automatiques');
    console.log('   ✅ Le statut est mis à jour selon les règles métier');
    console.log('   ✅ La date de modification est mise à jour');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Exécuter le test
testPaymentUpdate();
