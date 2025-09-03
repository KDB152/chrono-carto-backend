const mysql = require('mysql2');

// Connexion simple
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
  
  // Vérifier la structure
  connection.query('DESCRIBE quizzes', (err, columns) => {
    if (err) {
      console.error('❌ Erreur DESCRIBE:', err.message);
      return;
    }
    
    console.log('\n📋 Structure de la table quizzes:');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // Vérifier les données
    connection.query('SELECT id, title, target_groups, tags FROM quizzes', (err, quizzes) => {
      if (err) {
        console.error('❌ Erreur SELECT:', err.message);
        return;
      }
      
      console.log('\n🔍 Vérification des données JSON:');
      
      quizzes.forEach(quiz => {
        console.log(`\nQuiz ID ${quiz.id}: "${quiz.title}"`);
        
        // Vérifier target_groups
        if (quiz.target_groups) {
          try {
            const parsed = JSON.parse(quiz.target_groups);
            console.log(`  ✅ target_groups: ${JSON.stringify(parsed)}`);
          } catch (error) {
            console.log(`  ❌ target_groups (JSON invalide): "${quiz.target_groups}"`);
            console.log(`     Erreur: ${error.message}`);
          }
        } else {
          console.log(`  ⚪ target_groups: NULL`);
        }
        
        // Vérifier tags
        if (quiz.tags) {
          try {
            const parsed = JSON.parse(quiz.tags);
            console.log(`  ✅ tags: ${JSON.stringify(parsed)}`);
          } catch (error) {
            console.log(`  ❌ tags (JSON invalide): "${quiz.tags}"`);
            console.log(`     Erreur: ${error.message}`);
          }
        } else {
          console.log(`  ⚪ tags: NULL`);
        }
      });
      
      // Fermer la connexion
      connection.end();
      console.log('\n🔌 Connexion fermée');
    });
  });
});
