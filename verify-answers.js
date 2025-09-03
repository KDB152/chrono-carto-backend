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
  
  // Vérifier l'état actuel
  console.log('\n🔍 État actuel de quiz_attempts:');
  connection.query('SELECT * FROM quiz_attempts', (err, attempts) => {
    if (err) {
      console.error('❌ Erreur SELECT:', err.message);
      return;
    }
    
    attempts.forEach(attempt => {
      console.log(`\n  Tentative ID ${attempt.id}:`);
      console.log(`    Quiz ID: ${attempt.quiz_id}`);
      console.log(`    Student ID: ${attempt.student_id}`);
      console.log(`    Score: ${attempt.score}/${attempt.total_points}`);
      console.log(`    Pourcentage: ${attempt.percentage}%`);
      console.log(`    Temps: ${attempt.time_spent} min`);
      console.log(`    Date: ${attempt.completed_at}`);
      console.log(`    Réponses (brutes): "${attempt.answers}"`);
      console.log(`    Type des réponses: ${typeof attempt.answers}`);
      
      if (attempt.answers) {
        try {
          const parsed = JSON.parse(attempt.answers);
          console.log(`    ✅ JSON valide:`, parsed);
        } catch (error) {
          console.log(`    ❌ JSON invalide: ${error.message}`);
        }
      }
    });
    
    // Fermer la connexion
    connection.end();
    console.log('\n🔌 Connexion fermée');
  });
});
