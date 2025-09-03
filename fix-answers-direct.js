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
  
  // Corriger directement les réponses
  console.log('\n🛠️ Correction directe des réponses...');
  
  const correctedAnswers = JSON.stringify({ '1': 'cvc', '2': 'dd' });
  console.log(`  Réponses corrigées: ${correctedAnswers}`);
  
  connection.query(
    'UPDATE quiz_attempts SET answers = ? WHERE id = 1',
    [correctedAnswers],
    (err, updateResult) => {
      if (err) {
        console.error('❌ Erreur UPDATE:', err.message);
        return;
      }
      
      console.log(`✅ Correction appliquée: ${updateResult.affectedRows} ligne(s) modifiée(s)`);
      
      // Vérifier la correction
      console.log('\n🔍 Vérification après correction:');
      connection.query('SELECT id, answers FROM quiz_attempts WHERE id = 1', (err, result) => {
        if (err) {
          console.error('❌ Erreur SELECT après correction:', err.message);
          return;
        }
        
        if (result.length > 0) {
          const attempt = result[0];
          console.log(`  Tentative ID ${attempt.id}:`);
          console.log(`    Réponses: "${attempt.answers}"`);
          
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
    }
  );
});
