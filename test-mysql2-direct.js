const mysql = require('mysql2/promise');

async function testDirectInsert() {
  console.log('🔍 Test d\'insertion directe avec mysql2...\n');
  
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
    
    // Données de la tentative
    const attemptData = {
      quiz_id: 1,
      student_id: 68,
      score: 1,
      student_name: "Mayssa ElAbed",
      total_points: 2,
      percentage: 50,
      time_spent: 120,
      answers: JSON.stringify({
        "1": "A",
        "2": "B"
      })
    };
    
    console.log('📤 Données à insérer:', JSON.stringify(attemptData, null, 2));
    
    // Requête d'insertion
    const insertQuery = `
      INSERT INTO quiz_attempts 
      (quiz_id, student_id, score, student_name, total_points, percentage, time_spent, completed_at, answers)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?)
    `;
    
    const insertValues = [
      attemptData.quiz_id,
      attemptData.student_id,
      attemptData.score,
      attemptData.student_name,
      attemptData.total_points,
      attemptData.percentage,
      attemptData.time_spent,
      attemptData.answers
    ];
    
    console.log('\n🔄 Exécution de l\'insertion...');
    
    // Exécuter l'insertion avec mysql2
    const [result] = await connection.execute(insertQuery, insertValues);
    
    console.log('✅ Insertion réussie!');
    console.log('📊 Résultat complet:', JSON.stringify(result, null, 2));
    console.log(`  insertId: ${result.insertId}`);
    console.log(`  affectedRows: ${result.affectedRows}`);
    
    // Vérifier que l'insertion a bien eu lieu
    const [verifyRows] = await connection.execute(
      'SELECT * FROM quiz_attempts WHERE id = ?',
      [result.insertId]
    );
    
    if (verifyRows.length > 0) {
      const attempt = verifyRows[0];
      console.log('\n📊 Tentative vérifiée:');
      console.log(`  ID: ${attempt.id}`);
      console.log(`  Quiz ID: ${attempt.quiz_id}`);
      console.log(`  Étudiant ID: ${attempt.student_id}`);
      console.log(`  Score: ${attempt.score}/${attempt.total_points} (${attempt.percentage}%)`);
      console.log(`  Temps: ${attempt.time_spent}s`);
      console.log(`  Date: ${attempt.completed_at}`);
      console.log(`  Réponses: ${attempt.answers}`);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'insertion:', error.message);
    console.log('\n🔍 Détails de l\'erreur:');
    console.log('  Code:', error.code);
    console.log('  SQL State:', error.sqlState);
    console.log('  Message SQL:', error.sqlMessage);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Connexion fermée');
    }
  }
}

testDirectInsert();
