const mysql = require('mysql2');

// Connexion à la base de données
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // Ajoutez votre mot de passe si nécessaire
  database: 'chrono_carto'
});

console.log('🔍 Connexion à la base de données...');

connection.connect((err) => {
  if (err) {
    console.error('❌ Erreur de connexion:', err.message);
    return;
  }
  
  console.log('✅ Connexion établie');
  
  // Corriger la tentative existante
  console.log('\n🛠️ Correction de la tentative existante...');
  
  // Supprimer la tentative corrompue
  console.log('  Suppression de la tentative corrompue...');
  connection.query('DELETE FROM quiz_attempts WHERE id = 1', (err, deleteResult) => {
    if (err) {
      console.error('❌ Erreur DELETE:', err.message);
      return;
    }
    
    console.log(`✅ Tentative supprimée: ${deleteResult.affectedRows} ligne(s)`);
    
    // Créer une nouvelle tentative avec le bon format
    console.log('\n  Création d\'une nouvelle tentative...');
    
    const insertQuery = `
      INSERT INTO quiz_attempts 
      (quiz_id, student_id, score, student_name, total_points, percentage, time_spent, completed_at, answers)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?)
    `;
    
    const correctAnswers = JSON.stringify({ '1': 'cvc', '2': 'dd' });
    const insertValues = [
      1,        // quiz_id
      68,       // student_id
      2,        // score
      'Mayssa El Abed', // student_name
      2,        // total_points
      100,      // percentage
      15,       // time_spent
      correctAnswers
    ];
    
    connection.query(insertQuery, insertValues, (err, insertResult) => {
      if (err) {
        console.error('❌ Erreur INSERT:', err.message);
        return;
      }
      
      console.log(`✅ Nouvelle tentative créée avec l'ID: ${insertResult.insertId}`);
      
      // Vérifier la correction
      console.log('\n🔍 Vérification de la correction:');
      connection.query('SELECT * FROM quiz_attempts WHERE id = ?', [insertResult.insertId], (err, result) => {
        if (err) {
          console.error('❌ Erreur SELECT après correction:', err.message);
          return;
        }
        
        if (result.length > 0) {
          const attempt = result[0];
          console.log(`  ✅ Tentative corrigée:`);
          console.log(`    ID: ${attempt.id}`);
          console.log(`    Quiz ID: ${attempt.quiz_id}`);
          console.log(`    Student ID: ${attempt.student_id}`);
          console.log(`    Score: ${attempt.score}/${attempt.total_points}`);
          console.log(`    Pourcentage: ${attempt.percentage}%`);
          console.log(`    Temps: ${attempt.time_spent} min`);
          console.log(`    Date: ${attempt.completed_at}`);
          console.log(`    Réponses: "${attempt.answers}"`);
          
          // Vérifier le JSON
          try {
            const parsed = JSON.parse(attempt.answers);
            console.log(`    ✅ JSON valide:`, parsed);
          } catch (error) {
            console.log(`    ❌ JSON toujours invalide: ${error.message}`);
          }
        }
        
        // Fermer la connexion
        connection.end();
        console.log('\n🔌 Connexion fermée');
      });
    });
  });
});
