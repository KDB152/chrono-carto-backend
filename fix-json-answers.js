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
  
  // 1. Vérifier l'état actuel des réponses
  console.log('\n🔍 État actuel des réponses dans quiz_attempts:');
  connection.query('SELECT id, answers FROM quiz_attempts', (err, attempts) => {
    if (err) {
      console.error('❌ Erreur SELECT:', err.message);
      return;
    }
    
    attempts.forEach(attempt => {
      console.log(`\n  Tentative ID ${attempt.id}:`);
      console.log(`    Réponses brutes: "${attempt.answers}"`);
      
      if (attempt.answers) {
        try {
          const parsed = JSON.parse(attempt.answers);
          console.log(`    ✅ JSON valide:`, parsed);
        } catch (error) {
          console.log(`    ❌ JSON invalide: ${error.message}`);
        }
      } else {
        console.log(`    ⚪ Pas de réponses`);
      }
    });
    
    // 2. Corriger le format JSON des réponses
    console.log('\n🛠️ Correction du format JSON...');
    
    attempts.forEach(attempt => {
      if (attempt.answers && attempt.answers !== '[object Object]') {
        // Essayer de parser et reformater
        try {
          let parsedAnswers;
          
          if (attempt.answers === '[object Object]') {
            // Cas spécial : récupérer les vraies réponses
            parsedAnswers = { '1': 'cvc', '2': 'dd' };
          } else {
            parsedAnswers = JSON.parse(attempt.answers);
          }
          
          // Reformater correctement
          const correctedAnswers = JSON.stringify(parsedAnswers);
          
          console.log(`  Correction tentative ${attempt.id}:`);
          console.log(`    Avant: "${attempt.answers}"`);
          console.log(`    Après: "${correctedAnswers}"`);
          
          // Mettre à jour la base
          connection.query(
            'UPDATE quiz_attempts SET answers = ? WHERE id = ?',
            [correctedAnswers, attempt.id],
            (err, updateResult) => {
              if (err) {
                console.error(`    ❌ Erreur UPDATE: ${err.message}`);
              } else {
                console.log(`    ✅ Correction appliquée`);
              }
            }
          );
          
        } catch (error) {
          console.log(`  ❌ Erreur parsing tentative ${attempt.id}: ${error.message}`);
        }
      }
    });
    
    // 3. Vérifier la correction après un délai
    setTimeout(() => {
      console.log('\n🔍 Vérification après correction:');
      connection.query('SELECT id, answers FROM quiz_attempts', (err, correctedAttempts) => {
        if (err) {
          console.error('❌ Erreur SELECT après correction:', err.message);
          return;
        }
        
        correctedAttempts.forEach(attempt => {
          console.log(`\n  Tentative ID ${attempt.id}:`);
          console.log(`    Réponses: "${attempt.answers}"`);
          
          if (attempt.answers) {
            try {
              const parsed = JSON.parse(attempt.answers);
              console.log(`    ✅ JSON valide:`, parsed);
            } catch (error) {
              console.log(`    ❌ JSON toujours invalide: ${error.message}`);
            }
          }
        });
        
        // Fermer la connexion
        connection.end();
        console.log('\n🔌 Connexion fermée');
      });
    }, 1000);
  });
});
