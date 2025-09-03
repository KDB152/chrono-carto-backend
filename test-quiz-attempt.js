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
  
  // 1. Vérifier les questions du quiz "hvk" (ID 1)
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
    
    questions.forEach(q => {
      console.log(`  - Question ${q.id}: "${q.question}" (${q.points} points)`);
      console.log(`    Réponse correcte: "${q.correct_answer}"`);
      console.log(`    Options: ${q.options}`);
    });
    
    // 2. Simuler une tentative de quiz
    console.log('\n🔄 Simulation d\'une tentative de quiz...');
    
    const studentId = 68; // Mayssa
    const quizId = 1; // Quiz "hvk"
    const studentName = 'Mayssa El Abed';
    
    // Simuler des réponses (toutes correctes pour ce test)
    const studentAnswers = {
      [questions[0].id]: questions[0].correct_answer, // "cvc"
      [questions[1].id]: questions[1].correct_answer  // "dd"
    };
    
    // Calculer le score
    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
    const score = questions.reduce((sum, q) => {
      return sum + (studentAnswers[q.id] === q.correct_answer ? q.points : 0);
    }, 0);
    const percentage = Math.round((score / totalPoints) * 100);
    const timeSpent = 15; // 15 minutes
    
    console.log(`  Score: ${score}/${totalPoints} (${percentage}%)`);
    console.log(`  Temps: ${timeSpent} minutes`);
    console.log(`  Réponses:`, studentAnswers);
    
    // 3. Insérer la tentative dans quiz_attempts
    console.log('\n💾 Sauvegarde de la tentative...');
    
    const insertQuery = `
      INSERT INTO quiz_attempts 
      (quiz_id, student_id, score, student_name, total_points, percentage, time_spent, completed_at, answers)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?)
    `;
    
    const insertValues = [
      quizId,
      studentId,
      score,
      studentName,
      totalPoints,
      percentage,
      timeSpent,
      JSON.stringify(studentAnswers)
    ];
    
    connection.query(insertQuery, insertValues, (err, result) => {
      if (err) {
        console.error('❌ Erreur INSERT:', err.message);
        return;
      }
      
      console.log(`✅ Tentative sauvegardée avec l'ID: ${result.insertId}`);
      
      // 4. Vérifier que la tentative a été sauvegardée
      console.log('\n🔍 Vérification de la sauvegarde:');
      connection.query('SELECT * FROM quiz_attempts WHERE id = ?', [result.insertId], (err, savedAttempt) => {
        if (err) {
          console.error('❌ Erreur SELECT après sauvegarde:', err.message);
          return;
        }
        
        if (savedAttempt.length > 0) {
          const attempt = savedAttempt[0];
          console.log(`  ✅ Tentative trouvée:`);
          console.log(`    ID: ${attempt.id}`);
          console.log(`    Quiz ID: ${attempt.quiz_id}`);
          console.log(`    Student ID: ${attempt.student_id}`);
          console.log(`    Score: ${attempt.score}/${attempt.total_points}`);
          console.log(`    Pourcentage: ${attempt.percentage}%`);
          console.log(`    Temps: ${attempt.time_spent} min`);
          console.log(`    Date: ${attempt.completed_at}`);
          console.log(`    Réponses: ${attempt.answers ? 'Oui' : 'Non'}`);
          
          // Parser les réponses JSON
          try {
            const parsedAnswers = JSON.parse(attempt.answers);
            console.log(`    Réponses parsées:`, parsedAnswers);
          } catch (error) {
            console.log(`    ❌ Erreur parsing JSON: ${error.message}`);
          }
        } else {
          console.log('  ❌ Tentative non trouvée après sauvegarde');
        }
        
        // 5. Vérifier le total des tentatives
        console.log('\n📊 Total des tentatives dans la base:');
        connection.query('SELECT COUNT(*) as total FROM quiz_attempts', (err, countResult) => {
          if (err) {
            console.error('❌ Erreur COUNT:', err.message);
          } else {
            console.log(`  Total: ${countResult[0].total} tentative(s)`);
          }
          
          // Fermer la connexion
          connection.end();
          console.log('\n🔌 Connexion fermée');
        });
      });
    });
  });
});
