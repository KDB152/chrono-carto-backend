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
  
  // 1. Vérifier la structure de la table quiz_questions
  console.log('\n📋 Structure de la table quiz_questions:');
  connection.query('DESCRIBE quiz_questions', (err, columns) => {
    if (err) {
      console.error('❌ Erreur DESCRIBE:', err.message);
      return;
    }
    
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // 2. Vérifier les questions du quiz "hvk" (ID 1)
    console.log('\n🔍 Questions du quiz "hvk" (ID 1):');
    connection.query('SELECT * FROM quiz_questions WHERE quiz_id = 1', (err, questions) => {
      if (err) {
        console.error('❌ Erreur SELECT questions:', err.message);
        return;
      }
      
      if (questions.length === 0) {
        console.log('  ⚪ Aucune question trouvée');
        return;
      }
      
      console.log(`  ✅ ${questions.length} question(s) trouvée(s):`);
      questions.forEach(q => {
        console.log(`\n    Question ID ${q.id}:`);
        console.log(`      Quiz ID: ${q.quiz_id}`);
        console.log(`      Question: "${q.question}"`);
        console.log(`      Type: ${q.type}`);
        console.log(`      Points: ${q.points}`);
        console.log(`      Réponse correcte: "${q.correct_answer}"`);
        console.log(`      Options: ${q.options || 'N/A'}`);
      });
      
      // 3. Simuler ce que l'API devrait retourner
      console.log('\n🔄 Simulation de la réponse API:');
      
      // Format attendu par le frontend
      const apiResponse = {
        questions: questions.map(q => ({
          id: q.id,
          question_text: q.question,
          question_type: q.type,
          points: q.points,
          correct_answer: q.correct_answer,
          options: q.options ? q.options.split(',') : []
        }))
      };
      
      console.log('  Format attendu:');
      console.log('  questions:', apiResponse.questions);
      console.log('  Type de questions:', Array.isArray(apiResponse.questions) ? 'Array' : typeof apiResponse.questions);
      console.log('  Nombre de questions:', apiResponse.questions.length);
      
      // 4. Vérifier la méthode findQuestions dans le service
      console.log('\n🔍 Test de la méthode findQuestions:');
      
      // Simuler la requête SQL directe utilisée dans le service
      const sqlQuery = 'SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY id ASC';
      const quizId = 1;
      
      connection.query(sqlQuery, [quizId], (err, sqlResults) => {
        if (err) {
          console.error('  ❌ Erreur requête SQL:', err.message);
        } else {
          console.log('  ✅ Résultats de la requête SQL:');
          console.log('    Type:', typeof sqlResults);
          console.log('    Array?', Array.isArray(sqlResults));
          console.log('    Nombre:', sqlResults.length);
          console.log('    Données:', sqlResults);
        }
        
        // 5. Vérifier la table questions aussi (au cas où)
        console.log('\n🔍 Vérification de la table questions:');
        connection.query('SELECT COUNT(*) as total FROM questions', (err, questionsCount) => {
          if (err) {
            console.error('  ❌ Erreur COUNT questions:', err.message);
          } else {
            console.log(`  Total dans table 'questions': ${questionsCount[0].total}`);
          }
          
          // Fermer la connexion
          connection.end();
          console.log('\n🔌 Connexion fermée');
        });
      });
    });
  });
});
