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
  
  // 1. Vérifier la structure de la table questions
  console.log('\n📋 Structure de la table questions:');
  connection.query('DESCRIBE questions', (err, columns) => {
    if (err) {
      console.error('❌ Erreur DESCRIBE questions:', err.message);
      return;
    }
    
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // 2. Vérifier les données existantes
    console.log('\n🔍 Données existantes dans questions:');
    connection.query('SELECT * FROM questions LIMIT 5', (err, questions) => {
      if (err) {
        console.error('❌ Erreur SELECT questions:', err.message);
        return;
      }
      
      if (questions.length === 0) {
        console.log('  ⚪ Aucune question trouvée');
      } else {
        questions.forEach(q => {
          console.log(`\n  Question ID ${q.id}:`);
          console.log(`    Quiz ID: ${q.quiz_id}`);
          console.log(`    Question: "${q.question_text || q.question}"`);
          console.log(`    Type: ${q.question_type || q.type}`);
          console.log(`    Points: ${q.points}`);
          console.log(`    Réponse correcte: "${q.correct_answer}"`);
          console.log(`    Options: ${q.options || 'N/A'}`);
        });
      }
      
      // 3. Vérifier la table quiz_questions aussi
      console.log('\n🔍 Structure de la table quiz_questions:');
      connection.query('DESCRIBE quiz_questions', (err, quizQuestionsColumns) => {
        if (err) {
          console.error('❌ Erreur DESCRIBE quiz_questions:', err.message);
        } else {
          quizQuestionsColumns.forEach(col => {
            console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
          });
          
          // 4. Vérifier les données de quiz_questions
          console.log('\n🔍 Données existantes dans quiz_questions:');
          connection.query('SELECT * FROM quiz_questions LIMIT 5', (err, quizQuestions) => {
            if (err) {
              console.error('❌ Erreur SELECT quiz_questions:', err.message);
            } else if (quizQuestions.length === 0) {
              console.log('  ⚪ Aucune question trouvée dans quiz_questions');
            } else {
              quizQuestions.forEach(q => {
                console.log(`\n  Question ID ${q.id}:`);
                console.log(`    Quiz ID: ${q.quiz_id}`);
                console.log(`    Question: "${q.question}"`);
                console.log(`    Type: ${q.type}`);
                console.log(`    Points: ${q.points}`);
                console.log(`    Réponse correcte: "${q.correct_answer}"`);
                console.log(`    Options: ${q.options || 'N/A'}`);
              });
            }
            
            // Fermer la connexion
            connection.end();
            console.log('\n🔌 Connexion fermée');
          });
        }
      });
    });
  });
});
