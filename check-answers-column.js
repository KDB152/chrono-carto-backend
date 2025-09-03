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
  
  // Vérifier la structure de la colonne answers
  console.log('\n📋 Structure de la colonne answers:');
  connection.query('SHOW COLUMNS FROM quiz_attempts LIKE "answers"', (err, columns) => {
    if (err) {
      console.error('❌ Erreur SHOW COLUMNS:', err.message);
      return;
    }
    
    columns.forEach(col => {
      console.log(`  - Field: ${col.Field}`);
      console.log(`    Type: ${col.Type}`);
      console.log(`    Null: ${col.Null}`);
      console.log(`    Key: ${col.Key}`);
      console.log(`    Default: ${col.Default}`);
      console.log(`    Extra: ${col.Extra}`);
    });
    
    // Vérifier le type exact
    console.log('\n🔍 Test d\'insertion avec différents formats:');
    
    // Test 1: String JSON
    const testAnswers1 = '{"1": "cvc", "2": "dd"}';
    console.log(`  Test 1 - String JSON: ${testAnswers1}`);
    
    connection.query(
      'INSERT INTO quiz_attempts (quiz_id, student_id, score, student_name, total_points, percentage, time_spent, completed_at, answers) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?)',
      [1, 68, 2, 'Test 1', 2, 100, 15, testAnswers1],
      (err, result) => {
        if (err) {
          console.error(`    ❌ Erreur INSERT Test 1: ${err.message}`);
        } else {
          console.log(`    ✅ Test 1 inséré avec ID: ${result.insertId}`);
          
          // Vérifier ce qui a été stocké
          connection.query('SELECT answers FROM quiz_attempts WHERE id = ?', [result.insertId], (err, stored) => {
            if (err) {
              console.error(`    ❌ Erreur SELECT Test 1: ${err.message}`);
            } else {
              console.log(`    📝 Stocké: "${stored[0].answers}"`);
              console.log(`    Type: ${typeof stored[0].answers}`);
            }
          });
        }
      }
    );
    
    // Test 2: Objet JavaScript
    const testAnswers2 = { '1': 'cvc', '2': 'dd' };
    console.log(`  Test 2 - Objet JS:`, testAnswers2);
    
    connection.query(
      'INSERT INTO quiz_attempts (quiz_id, student_id, score, student_name, total_points, percentage, time_spent, completed_at, answers) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?)',
      [1, 68, 2, 'Test 2', 2, 100, 15, testAnswers2],
      (err, result) => {
        if (err) {
          console.error(`    ❌ Erreur INSERT Test 2: ${err.message}`);
        } else {
          console.log(`    ✅ Test 2 inséré avec ID: ${result.insertId}`);
          
          // Vérifier ce qui a été stocké
          connection.query('SELECT answers FROM quiz_attempts WHERE id = ?', [result.insertId], (err, stored) => {
            if (err) {
              console.error(`    ❌ Erreur SELECT Test 2: ${err.message}`);
            } else {
              console.log(`    📝 Stocké: "${stored[0].answers}"`);
              console.log(`    Type: ${typeof stored[0].answers}`);
            }
          });
        }
      }
    );
    
    // Attendre un peu puis fermer
    setTimeout(() => {
      console.log('\n🔌 Connexion fermée');
      connection.end();
    }, 2000);
  });
});
