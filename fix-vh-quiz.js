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
  
  // 1. Vérifier l'état actuel du quiz "VH"
  console.log('\n🔍 État actuel du quiz "VH":');
  connection.query('SELECT id, title, target_groups FROM quizzes WHERE id = 2', (err, results) => {
    if (err) {
      console.error('❌ Erreur SELECT:', err.message);
      return;
    }
    
    if (results.length > 0) {
      const quiz = results[0];
      console.log(`  Quiz ID ${quiz.id}: "${quiz.title}"`);
      console.log(`  target_groups actuel: "${quiz.target_groups}"`);
      console.log(`  Type: ${typeof quiz.target_groups}`);
      
      // 2. Corriger le target_groups
      console.log('\n🛠️ Correction du target_groups...');
      const correctedTargetGroups = JSON.stringify(['1ère groupe 1']);
      console.log(`  Nouveau target_groups: ${correctedTargetGroups}`);
      
      connection.query(
        'UPDATE quizzes SET target_groups = ? WHERE id = 2',
        [correctedTargetGroups],
        (err, updateResult) => {
          if (err) {
            console.error('❌ Erreur UPDATE:', err.message);
            return;
          }
          
          console.log(`✅ Correction appliquée: ${updateResult.affectedRows} ligne(s) modifiée(s)`);
          
          // 3. Vérifier la correction
          console.log('\n🔍 Vérification après correction:');
          connection.query('SELECT id, title, target_groups FROM quizzes WHERE id = 2', (err, results) => {
            if (err) {
              console.error('❌ Erreur SELECT après correction:', err.message);
              return;
            }
            
            if (results.length > 0) {
              const quiz = results[0];
              console.log(`  Quiz ID ${quiz.id}: "${quiz.title}"`);
              console.log(`  target_groups corrigé: "${quiz.target_groups}"`);
              
              try {
                const parsed = JSON.parse(quiz.target_groups);
                console.log(`  ✅ JSON valide: ${JSON.stringify(parsed)}`);
                console.log(`  Type: ${Array.isArray(parsed) ? 'Array' : typeof parsed}`);
              } catch (error) {
                console.log(`  ❌ JSON toujours invalide: ${error.message}`);
              }
            }
            
            // 4. Vérifier tous les quizzes
            console.log('\n🔍 Vérification de tous les quizzes:');
            connection.query('SELECT id, title, target_groups FROM quizzes WHERE status = "Publié"', (err, allQuizzes) => {
              if (err) {
                console.error('❌ Erreur SELECT tous les quizzes:', err.message);
                return;
              }
              
              allQuizzes.forEach(quiz => {
                console.log(`\n  Quiz ID ${quiz.id}: "${quiz.title}"`);
                console.log(`    target_groups: "${quiz.target_groups}"`);
                
                if (quiz.target_groups) {
                  try {
                    const parsed = JSON.parse(quiz.target_groups);
                    console.log(`    ✅ JSON valide: ${JSON.stringify(parsed)}`);
                    console.log(`    Type: ${Array.isArray(parsed) ? 'Array' : typeof parsed}`);
                  } catch (error) {
                    console.log(`    ❌ JSON invalide: ${error.message}`);
                  }
                } else {
                  console.log(`    ⚪ NULL`);
                }
              });
              
              // Fermer la connexion
              connection.end();
              console.log('\n🔌 Connexion fermée');
            });
          });
        }
      );
    } else {
      console.log('❌ Quiz "VH" non trouvé');
      connection.end();
    }
  });
});
