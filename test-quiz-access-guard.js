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
  
  // 1. Vérifier l'état actuel des quizzes et étudiants
  console.log('\n🔍 Test de la logique d\'accès au quiz:');
  
  // Simuler la logique du QuizAccessService
  const testAccess = async () => {
    // Récupérer le quiz "hvk" (ID 1)
    connection.query('SELECT id, title, target_groups FROM quizzes WHERE id = 1', (err, quizResults) => {
      if (err) {
        console.error('❌ Erreur SELECT quiz:', err.message);
        return;
      }
      
      if (quizResults.length === 0) {
        console.log('❌ Quiz "hvk" non trouvé');
        return;
      }
      
      const quiz = quizResults[0];
      console.log(`\n  Quiz: "${quiz.title}" (ID: ${quiz.id})`);
      console.log(`  target_groups: ${quiz.target_groups}`);
      
      // Récupérer l'étudiant Mayssa (ID 68)
      connection.query('SELECT id, user_id, class_level FROM students WHERE id = 68', (err, studentResults) => {
        if (err) {
          console.error('❌ Erreur SELECT student:', err.message);
          return;
        }
        
        if (studentResults.length === 0) {
          console.log('❌ Étudiant Mayssa non trouvé');
          return;
        }
        
        const student = studentResults[0];
        console.log(`\n  Étudiant: Mayssa (ID: ${student.id}, User ID: ${student.user_id})`);
        console.log(`  class_level: ${student.class_level}`);
        
        // Tester la logique d'accès
        console.log('\n🔄 Test de la logique d\'accès:');
        
        if (!quiz.target_groups || quiz.target_groups.length === 0) {
          console.log('  ✅ Quiz accessible à tous (pas de restriction)');
        } else {
          try {
            let targetGroups;
            if (typeof quiz.target_groups === 'string') {
              targetGroups = JSON.parse(quiz.target_groups);
            } else {
              targetGroups = quiz.target_groups;
            }
            
            console.log(`  target_groups parsé: ${JSON.stringify(targetGroups)}`);
            console.log(`  Type: ${Array.isArray(targetGroups) ? 'Array' : typeof targetGroups}`);
            
            if (Array.isArray(targetGroups)) {
              const canAccess = targetGroups.includes(student.class_level);
              console.log(`  ${student.class_level} dans ${JSON.stringify(targetGroups)}: ${canAccess ? '✅ OUI' : '❌ NON'}`);
              console.log(`  Accès au quiz: ${canAccess ? '✅ AUTORISÉ' : '❌ REFUSÉ'}`);
            } else {
              console.log(`  ❌ target_groups n'est pas un tableau: ${typeof targetGroups}`);
            }
          } catch (error) {
            console.log(`  ❌ Erreur parsing target_groups: ${error.message}`);
          }
        }
        
        // 2. Tester la création d'une tentative
        console.log('\n🔄 Test de création d\'une tentative:');
        
        const testAttempt = {
          quiz_id: quiz.id,
          student_id: student.id,
          score: 1,
          student_name: 'Mayssa El Abed',
          total_points: 2,
          percentage: 50,
          time_spent: 10,
          answers: JSON.stringify({ '1': 'cvc', '2': 'wrong_answer' })
        };
        
        console.log('  Données de la tentative:', testAttempt);
        
        // Insérer la tentative
        const insertQuery = `
          INSERT INTO quiz_attempts 
          (quiz_id, student_id, score, student_name, total_points, percentage, time_spent, completed_at, answers)
          VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?)
        `;
        
        const insertValues = [
          testAttempt.quiz_id,
          testAttempt.student_id,
          testAttempt.score,
          testAttempt.student_name,
          testAttempt.total_points,
          testAttempt.percentage,
          testAttempt.time_spent,
          testAttempt.answers
        ];
        
        connection.query(insertQuery, insertValues, (err, insertResult) => {
          if (err) {
            console.error('  ❌ Erreur INSERT:', err.message);
          } else {
            console.log(`  ✅ Tentative créée avec ID: ${insertResult.insertId}`);
            
            // Vérifier la création
            connection.query('SELECT * FROM quiz_attempts WHERE id = ?', [insertResult.insertId], (err, verifyResults) => {
              if (err) {
                console.error('  ❌ Erreur SELECT après création:', err.message);
              } else if (verifyResults.length > 0) {
                const attempt = verifyResults[0];
                console.log('  ✅ Tentative vérifiée:');
                console.log(`    ID: ${attempt.id}`);
                console.log(`    Quiz ID: ${attempt.quiz_id}`);
                console.log(`    Student ID: ${attempt.student_id}`);
                console.log(`    Score: ${attempt.score}/${attempt.total_points}`);
                console.log(`    Réponses: ${attempt.answers ? 'Oui' : 'Non'}`);
              }
              
              // Fermer la connexion
              connection.end();
              console.log('\n🔌 Connexion fermée');
            });
          }
        });
      });
    });
  };
  
  testAccess();
});
