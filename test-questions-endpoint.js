const fetch = require('node-fetch');

console.log('🔍 Test de l\'endpoint API des questions...');

// Test de l'API des questions pour le quiz "hvk" (ID 1)
async function testQuestionsAPI() {
  try {
    console.log('\n🔄 Test de l\'endpoint /quizzes/1/questions...');
    
    const response = await fetch('http://localhost:3001/quizzes/1/questions');
    
    console.log(`📥 Réponse reçue:`);
    console.log(`  Status: ${response.status} ${response.statusText}`);
    console.log(`  Headers:`, Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log(`  ✅ Succès! Données reçues:`, JSON.stringify(data, null, 2));
      
      // Vérifier la structure des données
      console.log('\n🔍 Analyse de la structure:');
      console.log(`  Type de data: ${typeof data}`);
      console.log(`  Array? ${Array.isArray(data)}`);
      
      if (Array.isArray(data)) {
        console.log(`  ✅ Nombre de questions: ${data.length}`);
        
        data.forEach((question, index) => {
          console.log(`\n  Question ${index + 1}:`);
          console.log(`    ID: ${question.id}`);
          console.log(`    question_text: ${question.question_text || '❌ MANQUANT'}`);
          console.log(`    question_type: ${question.question_type || '❌ MANQUANT'}`);
          console.log(`    points: ${question.points}`);
          console.log(`    correct_answer: ${question.correct_answer}`);
          console.log(`    options: ${Array.isArray(question.options) ? question.options.join(', ') : '❌ PAS UN TABLEAU'}`);
        });
        
        // Vérifier que toutes les colonnes requises sont présentes
        const requiredFields = ['question_text', 'question_type', 'points', 'correct_answer', 'options'];
        const missingFields = requiredFields.filter(field => !data[0].hasOwnProperty(field));
        
        if (missingFields.length === 0) {
          console.log('\n🎉 Toutes les colonnes requises sont présentes!');
        } else {
          console.log('\n❌ Colonnes manquantes:', missingFields);
        }
        
      } else {
        console.log(`  ❌ Les données ne sont pas un tableau: ${typeof data}`);
        console.log(`  Structure:`, data);
      }
      
    } else {
      const errorText = await response.text();
      console.log(`  ❌ Erreur! Corps de la réponse:`, errorText);
      
      try {
        const errorJson = JSON.parse(errorText);
        console.log(`  ❌ Erreur JSON:`, errorJson);
      } catch (e) {
        console.log(`  ❌ Erreur texte brut:`, errorText);
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    console.log('\n💡 Vérifiez que:');
    console.log('  1. Le backend est démarré (npm run start:dev)');
    console.log('  2. Le backend écoute sur le port 3001');
    console.log('  3. Aucun pare-feu ne bloque la connexion');
  }
}

// Exécuter le test
testQuestionsAPI();
