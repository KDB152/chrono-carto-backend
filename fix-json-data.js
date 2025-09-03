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
  
  // 1. Vérifier l'état actuel
  console.log('\n📋 État actuel du quiz ID 2:');
  connection.query('SELECT id, title, target_groups, tags FROM quizzes WHERE id = 2', (err, results) => {
    if (err) {
      console.error('❌ Erreur SELECT:', err.message);
      return;
    }
    
    if (results.length > 0) {
      const quiz = results[0];
      console.log(`  ID: ${quiz.id}`);
      console.log(`  Titre: "${quiz.title}"`);
      console.log(`  target_groups: "${quiz.target_groups}"`);
      console.log(`  tags: "${quiz.tags}"`);
      
      // 2. Corriger le target_groups malformé
      console.log('\n🛠️ Application de la correction...');
      const correctedTargetGroups = '["1ère groupe 1"]';
      
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
          console.log('\n🔍 Vérification de la correction:');
          connection.query('SELECT id, title, target_groups, tags FROM quizzes WHERE id = 2', (err, results) => {
            if (err) {
              console.error('❌ Erreur SELECT après correction:', err.message);
              return;
            }
            
            if (results.length > 0) {
              const quiz = results[0];
              console.log(`  ID: ${quiz.id}`);
              console.log(`  Titre: "${quiz.title}"`);
              console.log(`  target_groups: "${quiz.target_groups}"`);
              console.log(`  tags: "${quiz.tags}"`);
              
              // Vérifier que le JSON est maintenant valide
              try {
                const parsed = JSON.parse(quiz.target_groups);
                console.log(`  ✅ target_groups JSON valide: ${JSON.stringify(parsed)}`);
              } catch (error) {
                console.log(`  ❌ target_groups toujours invalide: ${error.message}`);
              }
            }
            
            // 4. Vérifier tous les quizzes
            console.log('\n🔍 Vérification de tous les quizzes:');
            connection.query('SELECT id, title, target_groups, tags FROM quizzes WHERE target_groups IS NOT NULL OR tags IS NOT NULL', (err, allQuizzes) => {
              if (err) {
                console.error('❌ Erreur SELECT tous les quizzes:', err.message);
                return;
              }
              
              let allValid = true;
              
              allQuizzes.forEach(quiz => {
                console.log(`\nQuiz ID ${quiz.id}: "${quiz.title}"`);
                
                if (quiz.target_groups) {
                  try {
                    const parsed = JSON.parse(quiz.target_groups);
                    console.log(`  ✅ target_groups: ${JSON.stringify(parsed)}`);
                  } catch (error) {
                    console.log(`  ❌ target_groups (JSON invalide): "${quiz.target_groups}"`);
                    console.log(`     Erreur: ${error.message}`);
                    allValid = false;
                  }
                }
                
                if (quiz.tags) {
                  try {
                    const parsed = JSON.parse(quiz.tags);
                    console.log(`  ✅ tags: ${JSON.stringify(parsed)}`);
                  } catch (error) {
                    console.log(`  ❌ tags (JSON invalide): "${quiz.tags}"`);
                    console.log(`     Erreur: ${error.message}`);
                    allValid = false;
                  }
                }
              });
              
              if (allValid) {
                console.log('\n🎉 Tous les JSON sont maintenant valides !');
              } else {
                console.log('\n⚠️ Il reste des problèmes JSON à corriger');
              }
              
              // Fermer la connexion
              connection.end();
              console.log('\n🔌 Connexion fermée');
            });
          });
        }
      );
    } else {
      console.log('❌ Quiz ID 2 non trouvé');
      connection.end();
    }
  });
});
