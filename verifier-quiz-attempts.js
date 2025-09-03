// Script pour vérifier la table quiz_attempts et les tentatives
const API_BASE = 'http://localhost:3001';

async function verifierQuizAttempts() {
  console.log('🔍 Vérification de la table quiz_attempts...\n');

  try {
    // 1. Vérifier la structure de la table via l'API
    console.log('1️⃣ Vérification de la structure...');
    
    // Récupérer tous les quizzes pour avoir un ID valide
    const quizzesResponse = await fetch(`${API_BASE}/quizzes`);
    if (!quizzesResponse.ok) {
      throw new Error('Impossible de récupérer les quizzes');
    }
    
    const quizzesData = await quizzesResponse.json();
    const quizzes = quizzesData.items || [];
    
    if (quizzes.length === 0) {
      console.log('❌ Aucun quiz trouvé pour tester');
      return;
    }
    
    const testQuiz = quizzes[0];
    console.log(`✅ Quiz de test: "${testQuiz.title}" (ID: ${testQuiz.id})`);
    console.log(`   - target_groups: ${JSON.stringify(testQuiz.target_groups)}`);
    
    // 2. Vérifier les tentatives existantes
    console.log('\n2️⃣ Vérification des tentatives existantes...');
    
    const attemptsResponse = await fetch(`${API_BASE}/quizzes/${testQuiz.id}/attempts`);
    if (attemptsResponse.ok) {
      const attempts = await attemptsResponse.json();
      console.log(`📊 Tentatives existantes pour ce quiz: ${attempts.length}`);
      
      if (attempts.length > 0) {
        attempts.forEach((attempt, index) => {
          console.log(`\n   Tentative ${index + 1}:`);
          console.log('   - ID:', attempt.id);
          console.log('   - Student ID:', attempt.student_id);
          console.log('   - Score:', attempt.score);
          console.log('   - Date:', attempt.created_at);
        });
      }
    } else {
      console.log('⚠️  Impossible de récupérer les tentatives existantes');
    }
    
    // 3. Tester la création d'une tentative
    console.log('\n3️⃣ Test de création d\'une tentative...');
    
    const testAttempt = {
      quiz_id: testQuiz.id,
      student_id: 68, // Mayssa El Abed - Terminale groupe 3 (AUTORISÉ)
      student_name: 'Mayssa El Abed',
      score: 15,
      total_points: 20,
      percentage: 75,
      time_spent: 25,
      answers: {
        question_1: { answer: 'A', is_correct: true },
        question_2: { answer: 'B', is_correct: false }
      }
    };
    
    console.log('📝 Données de la tentative à créer:');
    console.log('   - quiz_id:', testAttempt.quiz_id);
    console.log('   - student_id:', testAttempt.student_id);
    console.log('   - score:', testAttempt.score);
    
    const createAttemptResponse = await fetch(`${API_BASE}/quizzes/attempts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testAttempt)
    });
    
    console.log('\n📡 Réponse de l\'API:');
    console.log('   - Status:', createAttemptResponse.status);
    console.log('   - OK:', createAttemptResponse.ok);
    
    if (createAttemptResponse.ok) {
      const createdAttempt = await createAttemptResponse.json();
      console.log('✅ Tentative créée avec succès!');
      console.log('   - ID:', createdAttempt.id);
      console.log('   - Quiz ID:', createdAttempt.quiz_id);
      console.log('   - Student ID:', createdAttempt.student_id);
      console.log('   - Score:', createdAttempt.score);
      
      // 4. Vérifier que la tentative est bien sauvegardée
      console.log('\n4️⃣ Vérification de la sauvegarde...');
      
      const verifyResponse = await fetch(`${API_BASE}/quizzes/${testQuiz.id}/attempts`);
      if (verifyResponse.ok) {
        const updatedAttempts = await verifyResponse.json();
        console.log(`📊 Tentatives après création: ${updatedAttempts.length}`);
        
        const newAttempt = updatedAttempts.find(a => a.id === createdAttempt.id);
        if (newAttempt) {
          console.log('✅ Tentative trouvée dans la base!');
          console.log('   - Sauvegarde confirmée');
        } else {
          console.log('❌ Tentative NON trouvée dans la base!');
          console.log('   - Problème de sauvegarde');
        }
      }
      
      // 5. Nettoyer - Supprimer la tentative de test
      console.log('\n5️⃣ Nettoyage...');
      try {
        const deleteResponse = await fetch(`${API_BASE}/quizzes/attempts/${createdAttempt.id}`, {
          method: 'DELETE'
        });
        if (deleteResponse.ok) {
          console.log('🗑️ Tentative de test supprimée');
        } else {
          console.log('⚠️  Impossible de supprimer la tentative de test');
        }
      } catch (error) {
        console.log('⚠️  Erreur lors de la suppression:', error.message);
      }
      
    } else {
      const errorText = await createAttemptResponse.text();
      console.log('❌ Erreur lors de la création de la tentative:');
      console.log('   - Erreur:', errorText);
      
      // Analyser l'erreur
      try {
        const errorData = JSON.parse(errorText);
        console.log('   - Détails:', JSON.stringify(errorData, null, 2));
      } catch (e) {
        console.log('   - Erreur brute:', errorText);
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  }
}

verifierQuizAttempts();
