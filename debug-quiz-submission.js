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
  
  // 1. Vérifier l'état de la table quiz_attempts
  console.log('\n📋 État de la table quiz_attempts:');
  connection.query('SELECT COUNT(*) as total FROM quiz_attempts', (err, countResult) => {
    if (err) {
      console.error('❌ Erreur COUNT:', err.message);
      return;
    }
    
    console.log(`  Total des tentatives: ${countResult[0].total}`);
    
    // 2. Vérifier les tentatives existantes
    if (countResult[0].total > 0) {
      console.log('\n🔍 Tentatives existantes:');
      connection.query('SELECT * FROM quiz_attempts ORDER BY id DESC LIMIT 5', (err, attempts) => {
        attempts.forEach(attempt => {
          console.log(`  - ID ${attempt.id}: Quiz ${attempt.quiz_id}, Student ${attempt.student_id}, Score ${attempt.score}/${attempt.total_points}`);
        });
      });
    }
    
    // 3. Vérifier les quizzes et leurs target_groups
    console.log('\n🔍 Quizzes et leurs target_groups:');
    connection.query('SELECT id, title, status, target_groups FROM quizzes WHERE status = "Publié"', (err, quizzes) => {
      if (err) {
        console.error('❌ Erreur SELECT quizzes:', err.message);
        return;
      }
      
      quizzes.forEach(quiz => {
        console.log(`\n  Quiz ID ${quiz.id}: "${quiz.title}"`);
        console.log(`    Status: ${quiz.status}`);
        console.log(`    target_groups: ${quiz.target_groups || 'NULL'}`);
        
        if (quiz.target_groups) {
          try {
            const parsed = JSON.parse(quiz.target_groups);
            console.log(`    ✅ Parsed: ${JSON.stringify(parsed)}`);
          } catch (error) {
            console.log(`    ❌ JSON invalide: ${error.message}`);
          }
        }
      });
      
      // 4. Vérifier les étudiants et leurs class_level
      console.log('\n🔍 Étudiants et leurs class_level:');
      connection.query('SELECT s.id, s.user_id, u.first_name, u.last_name, s.class_level FROM students s JOIN users u ON s.user_id = u.id', (err, students) => {
        if (err) {
          console.error('❌ Erreur SELECT students:', err.message);
          return;
        }
        
        students.forEach(student => {
          console.log(`  - Étudiant ID ${student.id}: ${student.first_name} ${student.last_name}`);
          console.log(`    User ID: ${student.user_id}`);
          console.log(`    Class Level: ${student.class_level || 'NULL'}`);
        });
        
        // 5. Vérifier la correspondance entre étudiants et quizzes
        console.log('\n🔍 Correspondance étudiants-quizzes:');
        students.forEach(student => {
          if (student.class_level) {
            quizzes.forEach(quiz => {
              if (quiz.target_groups) {
                try {
                  const targetGroups = JSON.parse(quiz.target_groups);
                  const canAccess = targetGroups.includes(student.class_level);
                  console.log(`  ${student.first_name} ${student.last_name} (${student.class_level}) → Quiz "${quiz.title}": ${canAccess ? '✅ Accès' : '❌ Pas d\'accès'}`);
                } catch (error) {
                  console.log(`  ${student.first_name} ${student.last_name} → Quiz "${quiz.title}": ❌ JSON invalide`);
                }
              } else {
                console.log(`  ${student.first_name} ${student.last_name} → Quiz "${quiz.title}": ⚪ Pas de restriction`);
              }
            });
          } else {
            console.log(`  ${student.first_name} ${student.last_name}: ❌ Pas de class_level défini`);
          }
        });
        
        // 6. Vérifier la structure de la table quiz_attempts
        console.log('\n📋 Structure de quiz_attempts:');
        connection.query('DESCRIBE quiz_attempts', (err, columns) => {
          if (err) {
            console.error('❌ Erreur DESCRIBE:', err.message);
            return;
          }
          
          columns.forEach(col => {
            console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
          });
          
          // Fermer la connexion
          connection.end();
          console.log('\n🔌 Connexion fermée');
        });
      });
    });
  });
});
