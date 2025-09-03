const fetch = require('node-fetch');

console.log('🔍 Test de l\'API de soumission des tentatives...');

// Données de test
const testSubmission = {
  quiz_id: 1,
  student_id: 68,
  score: 1,
  student_name: 'Mayssa El Abed',
  total_points: 2,
  percentage: 50,
  time_spent: 10,
  answers: { '1': 'cvc', '2': 'wrong_answer' }
};

console.log('📤 Données à envoyer:', JSON.stringify(testSubmission, null, 2));

// Test de l'API
async function testAPI() {
  try {
    console.log('\n🔄 Envoi de la requête POST...');
    
    const response = await fetch('http://localhost:3001/quizzes/attempts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testSubmission)
    });
    
    console.log(`📥 Réponse reçue:`);
    console.log(`  Status: ${response.status} ${response.statusText}`);
    console.log(`  Headers:`, Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log(`  ✅ Succès! Données reçues:`, data);
    } else {
      const errorText = await response.text();
      console.log(`  ❌ Erreur! Corps de la réponse:`, errorText);
      
      // Essayer de parser comme JSON si possible
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
testAPI();
