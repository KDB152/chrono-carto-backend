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
  
  // 1. Vérifier la structure de la table quiz_attempts
  console.log('\n📋 Structure de la table quiz_attempts:');
  connection.query('DESCRIBE quiz_attempts', (err, columns) => {
    if (err) {
      console.error('❌ Erreur DESCRIBE:', err.message);
      return;
    }
    
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // 2. Vérifier les données existantes
    console.log('\n🔍 Données existantes dans quiz_attempts:');
    connection.query('SELECT * FROM quiz_attempts ORDER BY id DESC LIMIT 10', (err, attempts) => {
      if (err) {
        console.error('❌ Erreur SELECT:', err.message);
        return;
      }
      
      if (attempts.length === 0) {
        console.log('  ⚪ Aucune tentative trouvée');
      } else {
        attempts.forEach(attempt => {
          console.log(`\n  Tentative ID ${attempt.id}:`);
          console.log(`    Quiz ID: ${attempt.quiz_id}`);
          console.log(`    Student ID: ${attempt.student_id}`);
          console.log(`    Score: ${attempt.score}/${attempt.total_points}`);
          console.log(`    Pourcentage: ${attempt.percentage}%`);
          console.log(`    Temps: ${attempt.time_spent} min`);
          console.log(`    Date: ${attempt.completed_at}`);
          console.log(`    Réponses: ${attempt.answers ? 'Oui' : 'Non'}`);
        });
      }
      
      // 3. Vérifier les quizzes disponibles
      console.log('\n🔍 Quizzes disponibles:');
      connection.query('SELECT id, title, status FROM quizzes WHERE status = "Publié"', (err, quizzes) => {
        if (err) {
          console.error('❌ Erreur SELECT quizzes:', err.message);
          return;
        }
        
        if (quizzes.length === 0) {
          console.log('  ⚪ Aucun quiz publié trouvé');
        } else {
          quizzes.forEach(quiz => {
            console.log(`  - Quiz ID ${quiz.id}: "${quiz.title}" (${quiz.status})`);
          });
        }
        
        // 4. Vérifier les étudiants
        console.log('\n🔍 Étudiants disponibles:');
        connection.query('SELECT s.id, s.user_id, u.first_name, u.last_name, s.class_level FROM students s JOIN users u ON s.user_id = u.id', (err, students) => {
          if (err) {
            console.error('❌ Erreur SELECT students:', err.message);
            return;
          }
          
          if (students.length === 0) {
            console.log('  ⚪ Aucun étudiant trouvé');
          } else {
            students.forEach(student => {
              console.log(`  - Étudiant ID ${student.id} (User ID: ${student.user_id}): ${student.first_name} ${student.last_name} - ${student.class_level}`);
            });
          }
          
          // 5. Vérifier les questions des quizzes
          console.log('\n🔍 Questions des quizzes:');
          connection.query('SELECT q.id, q.quiz_id, q.question_text, q.correct_answer, q.points FROM questions q JOIN quizzes qu ON q.quiz_id = qu.id WHERE qu.status = "Publié"', (err, questions) => {
            if (err) {
              console.error('❌ Erreur SELECT questions:', err.message);
              return;
            }
            
            if (questions.length === 0) {
              console.log('  ⚪ Aucune question trouvée');
            } else {
              const questionsByQuiz = {};
              questions.forEach(q => {
                if (!questionsByQuiz[q.quiz_id]) {
                  questionsByQuiz[q.quiz_id] = [];
                }
                questionsByQuiz[q.quiz_id].push(q);
              });
              
              Object.keys(questionsByQuiz).forEach(quizId => {
                console.log(`  Quiz ID ${quizId}: ${questionsByQuiz[quizId].length} questions`);
                questionsByQuiz[quizId].forEach(q => {
                  console.log(`    - Question ${q.id}: "${q.question_text}" (${q.points} points)`);
                });
              });
            }
            
            // Fermer la connexion
            connection.end();
            console.log('\n🔌 Connexion fermée');
          });
        });
      });
    });
  });
});
