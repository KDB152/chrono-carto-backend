// Script pour corriger les parent_id manquants dans la table paiement
const mysql = require('mysql2/promise');

// Configuration de la base de données
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'chrono_carto',
  port: parseInt(process.env.DB_PORT || '3306')
};

async function fixParentIds() {
  let connection;
  
  try {
    console.log('🔧 Correction des parent_id manquants...\n');
    
    connection = await mysql.createConnection(dbConfig);
    
    // 1. Vérifier l'état actuel
    console.log('1. État actuel:');
    const [currentState] = await connection.execute(`
      SELECT 
        COUNT(*) as total_paiements,
        COUNT(parent_id) as paiements_avec_parent_id,
        COUNT(*) - COUNT(parent_id) as paiements_sans_parent_id
      FROM paiement
    `);
    
    const state = currentState[0];
    console.log(`   📊 Total paiements: ${state.total_paiements}`);
    console.log(`   ✅ Avec parent_id: ${state.paiements_avec_parent_id}`);
    console.log(`   ❌ Sans parent_id: ${state.paiements_sans_parent_id}\n`);
    
    if (state.paiements_sans_parent_id === 0) {
      console.log('   ✅ Tous les paiements ont déjà un parent_id !');
      return;
    }
    
    // 2. Afficher les paiements sans parent_id
    console.log('2. Paiements sans parent_id:');
    const [paiementsSansParent] = await connection.execute(`
      SELECT 
        p.id as paiement_id,
        p.student_id,
        p.parent_id,
        u.first_name as student_first_name,
        u.last_name as student_last_name
      FROM paiement p
      JOIN students s ON p.student_id = s.id
      JOIN users u ON s.user_id = u.id
      WHERE p.parent_id IS NULL
      LIMIT 5
    `);
    
    console.log('   📋 Exemples:');
    paiementsSansParent.forEach(p => {
      console.log(`      Paiement ID: ${p.paiement_id}, Étudiant: ${p.student_first_name} ${p.student_last_name} (ID: ${p.student_id})`);
    });
    console.log('');
    
    // 3. Vérifier les relations parent-student disponibles
    console.log('3. Relations parent-student disponibles:');
    const [relations] = await connection.execute(`
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
      LIMIT 5
    `);
    
    console.log('   🔗 Exemples de relations:');
    relations.forEach(rel => {
      console.log(`      Étudiant: ${rel.student_first_name} ${rel.student_last_name} (ID: ${rel.student_id})`);
      console.log(`      Parent: ${rel.parent_first_name} ${rel.parent_last_name} (ID: ${rel.parent_id})`);
      console.log('');
    });
    
    // 4. Effectuer la mise à jour
    console.log('4. Mise à jour des parent_id manquants:');
    const [updateResult] = await connection.execute(`
      UPDATE paiement p
      JOIN parent_student ps ON p.student_id = ps.student_id
      SET p.parent_id = ps.parent_id
      WHERE p.parent_id IS NULL
    `);
    
    console.log(`   ✅ ${updateResult.affectedRows} paiements mis à jour\n`);
    
    // 5. Vérifier le résultat après mise à jour
    console.log('5. État après mise à jour:');
    const [newState] = await connection.execute(`
      SELECT 
        COUNT(*) as total_paiements,
        COUNT(parent_id) as paiements_avec_parent_id,
        COUNT(*) - COUNT(parent_id) as paiements_sans_parent_id
      FROM paiement
    `);
    
    const newStateData = newState[0];
    console.log(`   📊 Total paiements: ${newStateData.total_paiements}`);
    console.log(`   ✅ Avec parent_id: ${newStateData.paiements_avec_parent_id}`);
    console.log(`   ❌ Sans parent_id: ${newStateData.paiements_sans_parent_id}\n`);
    
    // 6. Afficher quelques exemples de paiements mis à jour
    console.log('6. Exemples de paiements mis à jour:');
    const [updatedPaiements] = await connection.execute(`
      SELECT 
        p.id as paiement_id,
        p.student_id,
        p.parent_id,
        u.first_name as student_first_name,
        u.last_name as student_last_name,
        parent_user.first_name as parent_first_name,
        parent_user.last_name as parent_last_name
      FROM paiement p
      JOIN students s ON p.student_id = s.id
      JOIN users u ON s.user_id = u.id
      LEFT JOIN parents par ON p.parent_id = par.id
      LEFT JOIN users parent_user ON par.user_id = parent_user.id
      WHERE p.parent_id IS NOT NULL
      LIMIT 5
    `);
    
    console.log('   📋 Exemples:');
    updatedPaiements.forEach(p => {
      console.log(`      Paiement ID: ${p.paiement_id}`);
      console.log(`        Étudiant: ${p.student_first_name} ${p.student_last_name}`);
      console.log(`        Parent: ${p.parent_first_name || 'NULL'} ${p.parent_last_name || 'NULL'}`);
      console.log('');
    });
    
    // 7. Résumé final
    console.log('7. Résumé:');
    if (newStateData.paiements_sans_parent_id === 0) {
      console.log('   ✅ Tous les paiements ont maintenant un parent_id !');
      console.log('   ✅ Les noms des parents devraient maintenant s\'afficher dans le dashboard admin');
    } else {
      console.log(`   ⚠️  Il reste ${newStateData.paiements_sans_parent_id} paiements sans parent_id`);
      console.log('   💡 Cela peut être normal si certains étudiants n\'ont pas de parent associé');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Exécuter la correction
fixParentIds();
