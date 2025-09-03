const http = require('http');

console.log('🔍 Test de l\'endpoint API des questions...');

// Test de l'API des questions pour le quiz "hvk" (ID 1)
const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/quizzes/1/questions',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

console.log('\n🔄 Test de l\'endpoint /quizzes/1/questions...');

const req = http.request(options, (res) => {
  console.log(`📥 Réponse reçue:`);
  console.log(`  Status: ${res.statusCode} ${res.statusMessage}`);
  console.log(`  Headers:`, res.headers);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode === 200) {
      try {
        const jsonData = JSON.parse(data);
        console.log(`  ✅ Succès! Données reçues:`, JSON.stringify(jsonData, null, 2));
        
        // Vérifier la structure des données
        console.log('\n🔍 Analyse de la structure:');
        console.log(`  Type de data: ${typeof jsonData}`);
        console.log(`  Array? ${Array.isArray(jsonData)}`);
        
        if (Array.isArray(jsonData)) {
          console.log(`  ✅ Nombre de questions: ${jsonData.length}`);
          
          jsonData.forEach((question, index) => {
            console.log(`\n  Question ${index + 1}:`);
            console.log(`    ID: ${question.id}`);
            console.log(`    question_text: ${question.question_text || '❌ MANQUANT'}`);
            console.log(`    question_type: ${question.question_type || '❌ MANQUANT'}`);
            console.log(`    points: ${question.points}`);
            console.log(`    correct_answer: ${question.correct_answer}`);
            console.log(`    options: ${Array.isArray(question.options) ? question.options.join(', ') : '❌ PAS UN TABLEAU'}`);
          });
          
        } else {
          console.log(`  ❌ Les données ne sont pas un tableau: ${typeof jsonData}`);
          console.log(`  Structure:`, jsonData);
        }
        
      } catch (error) {
        console.log(`  ❌ Erreur parsing JSON: ${error.message}`);
        console.log(`  Données brutes:`, data);
      }
    } else {
      console.log(`  ❌ Erreur! Corps de la réponse:`, data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Erreur de connexion:', error.message);
  console.log('\n💡 Vérifiez que:');
  console.log('  1. Le backend est démarré (npm run start:dev)');
  console.log('  2. Le backend écoute sur le port 3001');
  console.log('  3. Aucun pare-feu ne bloque la connexion');
});

req.end();
