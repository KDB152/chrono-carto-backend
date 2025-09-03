const http = require('http');

console.log('🔍 Test de soumission simple (sans guard)...');

// Test avec l'étudiant qui a accès
const quizData = {
  quiz_id: 1,
  student_id: 68,
  score: 1,
  student_name: "Mayssa ElAbed",
  total_points: 2,
  percentage: 50,
  time_spent: 120,
  answers: {
    "1": "A",
    "2": "B"
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

console.log('\n🔄 Test de soumission...');
console.log('📤 Données:', JSON.stringify(quizData, null, 2));

const req = http.request(options, (res) => {
  console.log(`📥 Réponse: ${res.statusCode} ${res.statusMessage}`);
  
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    if (res.statusCode === 201 || res.statusCode === 200) {
      console.log('✅ Succès! Tentative sauvegardée');
      console.log('📊 Données:', data);
    } else {
      console.log(`❌ Erreur ${res.statusCode}:`, data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Erreur:', error.message);
});

req.write(postData);
req.end();
