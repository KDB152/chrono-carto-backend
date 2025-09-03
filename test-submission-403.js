const http = require('http');

console.log('🔍 Test de diagnostic de l\'erreur 403...');

// Simuler une soumission de quiz
const quizData = {
  quiz_id: 1,
  student_id: 68, // ID de l'étudiant Mayssa ElAbed (Terminale groupe 3)
  score: 1,
  student_name: "Mayssa ElAbed",
  total_points: 2,
  percentage: 50,
  time_spent: 120,
  answers: {
    "1": "A", // Réponse de l'étudiant pour la question 1
    "2": "B"  // Réponse de l'étudiant pour la question 2
  }
};

const postData = JSON.stringify(quizData);

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/quizzes/attempts',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('\n🔄 Test de soumission de quiz...');
console.log('📤 Données envoyées:', JSON.stringify(quizData, null, 2));

const req = http.request(options, (res) => {
  console.log(`📥 Réponse reçue:`);
  console.log(`  Status: ${res.statusCode} ${res.statusMessage}`);
  console.log(`  Headers:`, res.headers);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode === 201 || res.statusCode === 200) {
      console.log(`  ✅ Succès! Tentative sauvegardée:`, data);
    } else if (res.statusCode === 403) {
      console.log(`  ❌ Accès interdit (403):`, data);
      console.log('\n🔍 Analyse de l\'erreur 403:');
      console.log('  Le QuizAccessGuard bloque la soumission');
      console.log('  Vérifiez:');
      console.log('    1. Les target_groups du quiz');
      console.log('    2. Le class_level de l\'étudiant');
      console.log('    3. La logique du QuizAccessService');
    } else {
      console.log(`  ❌ Erreur ${res.statusCode}:`, data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Erreur de connexion:', error.message);
});

req.write(postData);
req.end();
