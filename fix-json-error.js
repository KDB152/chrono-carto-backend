const mysql = require('mysql2/promise');

async function fixJsonError() {
  let connection;
  
  try {
    // Connexion à la base de données
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '', // Ajoutez votre mot de passe si nécessaire
      database: 'chrono_carto'
    });

    console.log('🔍 Connexion à la base de données établie');

    // 1. Vérifier la structure de la table quizzes
    console.log('\n📋 Structure de la table quizzes:');
    const [columns] = await connection.execute('DESCRIBE quizzes');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    // 2. Vérifier les données JSON problématiques
    console.log('\n🔍 Vérification des données JSON:');
    
    const [quizzes] = await connection.execute('SELECT id, title, target_groups, tags FROM quizzes');
    
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

    // 3. Identifier les enregistrements problématiques
    console.log('\n🚨 Enregistrements avec JSON invalide:');
    
    const [problematicQuizzes] = await connection.execute(`
      SELECT id, title, target_groups, tags 
      FROM quizzes 
      WHERE target_groups IS NOT NULL OR tags IS NOT NULL
    `);
    
    let hasProblems = false;
    
    for (const quiz of problematicQuizzes) {
      let isProblematic = false;
      
      if (quiz.target_groups) {
        try {
          JSON.parse(quiz.target_groups);
        } catch (error) {
          isProblematic = true;
          hasProblems = true;
          console.log(`\n❌ Quiz ID ${quiz.id} - target_groups invalide:`);
          console.log(`   Titre: "${quiz.title}"`);
          console.log(`   Valeur: "${quiz.target_groups}"`);
          console.log(`   Erreur: ${error.message}`);
        }
      }
      
      if (quiz.tags) {
        try {
          JSON.parse(quiz.tags);
        } catch (error) {
          isProblematic = true;
          hasProblems = true;
          console.log(`\n❌ Quiz ID ${quiz.id} - tags invalide:`);
          console.log(`   Titre: "${quiz.title}"`);
          console.log(`   Valeur: "${quiz.tags}"`);
          console.log(`   Erreur: ${error.message}`);
        }
      }
      
      if (isProblematic) {
        console.log(`   ID: ${quiz.id}`);
      }
    }
    
    if (!hasProblems) {
      console.log('  ✅ Aucun problème JSON détecté');
    }

    // 4. Proposer des corrections
    if (hasProblems) {
      console.log('\n🛠️ Corrections suggérées:');
      console.log('  1. Mettre à jour les colonnes JSON invalides');
      console.log('  2. Vérifier la logique de sauvegarde');
      console.log('  3. Ajouter une validation côté serveur');
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

// Exécuter le diagnostic
fixJsonError();
