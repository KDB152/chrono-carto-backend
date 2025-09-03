const mysql = require('mysql2/promise');

async function checkAccessConfig() {
  console.log('🔍 Vérification de la configuration d\'accès...\n');
  
  let connection;
  
  try {
    // Connexion à la base de données
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'chrono_carto'
    });
    
    console.log('✅ Connexion à la base de données établie\n');
    
    // 1. Vérifier le quiz ID 1
    console.log('📋 Quiz ID 1:');
    const [quizRows] = await connection.execute(
      'SELECT id, title, target_groups, show_results FROM quizzes WHERE id = 1'
    );
    
    if (quizRows.length > 0) {
      const quiz = quizRows[0];
      console.log(`  ID: ${quiz.id}`);
      console.log(`  Titre: ${quiz.title}`);
      console.log(`  target_groups: ${quiz.target_groups}`);
      console.log(`  Type target_groups: ${typeof quiz.target_groups}`);
      console.log(`  show_results: ${quiz.show_results}`);
      
      // Analyser target_groups
      if (quiz.target_groups) {
        try {
          const parsed = JSON.parse(quiz.target_groups);
          console.log(`  target_groups parsé: ${JSON.stringify(parsed)}`);
          console.log(`  Type parsé: ${typeof parsed}`);
          console.log(`  Array? ${Array.isArray(parsed)}`);
        } catch (e) {
          console.log(`  ❌ Erreur parsing JSON: ${e.message}`);
        }
      }
    } else {
      console.log('  ❌ Quiz ID 1 non trouvé');
    }
    
    console.log('\n👥 Étudiants disponibles:');
    const [studentRows] = await connection.execute(
      'SELECT s.id, s.class_level, u.first_name, u.last_name FROM students s JOIN users u ON s.user_id = u.id ORDER BY s.id'
    );
    
    studentRows.forEach(student => {
      console.log(`  ID: ${student.id}, Nom: ${student.first_name} ${student.last_name}, Classe: ${student.class_level}`);
    });
    
    // 2. Vérifier les tentatives existantes
    console.log('\n📊 Tentatives existantes:');
    const [attemptRows] = await connection.execute(
      'SELECT id, quiz_id, student_id, score, completed_at FROM quiz_attempts ORDER BY id DESC LIMIT 5'
    );
    
    if (attemptRows.length > 0) {
      attemptRows.forEach(attempt => {
        console.log(`  ID: ${attempt.id}, Quiz: ${attempt.quiz_id}, Étudiant: ${attempt.student_id}, Score: ${attempt.score}, Date: ${attempt.completed_at}`);
      });
    } else {
      console.log('  Aucune tentative trouvée');
    }
    
    // 3. Test de logique d'accès
    console.log('\n🧪 Test de logique d\'accès:');
    if (quizRows.length > 0 && studentRows.length > 0) {
      const quiz = quizRows[0];
      const student = studentRows[0]; // Premier étudiant
      
      console.log(`  Quiz target_groups: ${quiz.target_groups}`);
      console.log(`  Étudiant class_level: ${student.class_level}`);
      
      if (quiz.target_groups) {
        try {
          const targetGroups = JSON.parse(quiz.target_groups);
          if (Array.isArray(targetGroups)) {
            const hasAccess = targetGroups.includes(student.class_level);
            console.log(`  ✅ Accès autorisé: ${hasAccess}`);
          } else {
            console.log(`  ❌ target_groups n'est pas un tableau`);
          }
        } catch (e) {
          console.log(`  ❌ Erreur parsing target_groups: ${e.message}`);
        }
      } else {
        console.log(`  ✅ Pas de restriction (target_groups est NULL)`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Connexion fermée');
    }
  }
}

checkAccessConfig();
