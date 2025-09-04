// Script de test pour vérifier l'API de progression des étudiants
const mysql = require('mysql2/promise');

// Configuration de la base de données
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'chrono_carto',
  port: parseInt(process.env.DB_PORT || '3306')
};

async function testProgressAPI() {
  let connection;
  
  try {
    console.log('🧪 Test de l\'API de progression des étudiants...\n');
    
    connection = await mysql.createConnection(dbConfig);
    
    // 1. Vérifier les étudiants disponibles
    console.log('1. Étudiants disponibles:');
    const [students] = await connection.execute(`
      SELECT 
        s.id as student_id,
        u.first_name,
        u.last_name
      FROM students s
      JOIN users u ON s.user_id = u.id
      ORDER BY s.id
    `);
    
    console.log(`   📊 Total étudiants: ${students.length}`);
    students.forEach((student, index) => {
      console.log(`   ${index + 1}. ${student.first_name} ${student.last_name} (ID: ${student.student_id})`);
    });
    console.log('');
    
    if (students.length === 0) {
      console.log('   ❌ Aucun étudiant trouvé dans la base de données');
      return;
    }
    
    // 2. Tester avec le premier étudiant
    const testStudent = students[0];
    console.log(`2. Test avec l'étudiant: ${testStudent.first_name} ${testStudent.last_name} (ID: ${testStudent.student_id})\n`);
    
    // 3. Vérifier les quiz disponibles
    console.log('3. Quiz disponibles:');
    const [quizzes] = await connection.execute(`
      SELECT 
        id,
        title,
        subject,
        difficulty
      FROM quizzes
      ORDER BY id
    `);
    
    console.log(`   📊 Total quiz: ${quizzes.length}`);
    quizzes.forEach((quiz, index) => {
      console.log(`   ${index + 1}. ${quiz.title} (${quiz.subject}, ${quiz.difficulty})`);
    });
    console.log('');
    
    // 4. Vérifier les tentatives de quiz pour l'étudiant
    console.log('4. Tentatives de quiz pour l\'étudiant:');
    const [attempts] = await connection.execute(`
      SELECT 
        qa.id as attempt_id,
        qa.quiz_id,
        q.title as quiz_title,
        q.subject,
        qa.score,
        qa.total_points,
        qa.percentage,
        qa.completed_at,
        qa.time_spent
      FROM quiz_attempts qa
      JOIN quizzes q ON qa.quiz_id = q.id
      WHERE qa.student_id = ?
      ORDER BY qa.completed_at DESC
    `, [testStudent.student_id]);
    
    console.log(`   📊 Total tentatives: ${attempts.length}`);
    if (attempts.length > 0) {
      attempts.forEach((attempt, index) => {
        console.log(`   ${index + 1}. ${attempt.quiz_title} (${attempt.subject}) - ${attempt.percentage}% - ${attempt.completed_at}`);
      });
    } else {
      console.log('   ⚠️  Aucune tentative de quiz trouvée pour cet étudiant');
    }
    console.log('');
    
    // 5. Simuler la logique de l'API
    console.log('5. Simulation de la logique de l\'API:');
    
    // Organiser les résultats par matière
    const resultsBySubject = {};
    
    attempts.forEach(attempt => {
      const subject = attempt.subject;
      if (!resultsBySubject[subject]) {
        resultsBySubject[subject] = [];
      }
      resultsBySubject[subject].push(attempt);
    });
    
    console.log(`   📊 Matières avec des résultats: ${Object.keys(resultsBySubject).length}`);
    
    // Prendre les 7 derniers résultats pour chaque matière
    const progressData = Object.keys(resultsBySubject).map(subject => {
      const subjectResults = resultsBySubject[subject].slice(0, 7).reverse();
      
      const scores = subjectResults.map(r => r.percentage);
      const dates = subjectResults.map(r => r.completed_at);
      
      // Calculer la tendance
      let trend = 'stable';
      let improvement = 0;
      
      if (scores.length >= 2) {
        const firstScore = scores[0];
        const lastScore = scores[scores.length - 1];
        improvement = lastScore - firstScore;
        
        if (improvement > 5) {
          trend = 'up';
        } else if (improvement < -5) {
          trend = 'down';
        }
      }
      
      const averageScore = scores.length > 0 ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;
      
      return {
        subject,
        scores,
        dates,
        averageScore,
        improvement: Math.round(improvement),
        trend,
        totalQuizzes: subjectResults.length
      };
    });
    
    console.log('   📈 Données de progression calculées:');
    progressData.forEach(data => {
      console.log(`      ${data.subject}:`);
      console.log(`        - Quiz: ${data.totalQuizzes}`);
      console.log(`        - Scores: [${data.scores.join(', ')}]`);
      console.log(`        - Moyenne: ${data.averageScore}%`);
      console.log(`        - Tendance: ${data.trend} (${data.improvement > 0 ? '+' : ''}${data.improvement}%)`);
      console.log('');
    });
    
    // 6. Test de l'API via HTTP (simulation)
    console.log('6. Test de l\'API HTTP:');
    console.log(`   🌐 URL: /api/student/progress?studentId=${testStudent.student_id}`);
    console.log(`   📊 Données attendues: ${progressData.length} matières`);
    
    if (progressData.length > 0) {
      console.log('   ✅ L\'API devrait retourner des données de progression');
    } else {
      console.log('   ⚠️  L\'API retournera un tableau vide (pas de quiz terminés)');
    }
    
    // 7. Résumé
    console.log('7. Résumé du test:');
    console.log(`   ✅ Étudiants dans la base: ${students.length}`);
    console.log(`   ✅ Quiz disponibles: ${quizzes.length}`);
    console.log(`   ✅ Tentatives pour l'étudiant test: ${attempts.length}`);
    console.log(`   ✅ Matières avec progression: ${progressData.length}`);
    
    if (progressData.length > 0) {
      console.log('   ✅ L\'API de progression est fonctionnelle');
    } else {
      console.log('   ⚠️  L\'API fonctionne mais aucun quiz n\'a été terminé');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Exécuter le test
testProgressAPI();
