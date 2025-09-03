// Script de débogage pour la fonctionnalité des groupes cibles
const API_BASE = 'http://localhost:3001';

async function testQuizGroups() {
  console.log('🧪 Test de la fonctionnalité des groupes cibles...\n');

  try {
    // 1. Créer un quiz avec des groupes cibles
    console.log('1️⃣ Création d\'un quiz avec groupes cibles...');
    const createResponse = await fetch(`${API_BASE}/quizzes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Quiz Test - Groupes Cibles',
        description: 'Quiz de test pour vérifier la fonctionnalité des groupes',
        subject: 'Test',
        level: 'Terminale',
        duration: 30,
        pass_score: 10,
        status: 'Brouillon',
        tags: ['test', 'groupes'],
        is_time_limited: true,
        allow_retake: false,
        show_results: true,
        randomize_questions: false,
        target_groups: ['Terminale groupe 1', 'Terminale groupe 2']
      })
    });

    if (!createResponse.ok) {
      throw new Error(`Erreur création: ${createResponse.status} ${createResponse.statusText}`);
    }

    const createdQuiz = await createResponse.json();
    console.log('✅ Quiz créé:', createdQuiz);
    console.log('📊 Groupes cibles:', createdQuiz.target_groups);
    console.log('');

    // 2. Vérifier que le quiz a bien les groupes cibles
    console.log('2️⃣ Vérification de la création...');
    const getResponse = await fetch(`${API_BASE}/quizzes/${createdQuiz.id}`);
    const retrievedQuiz = await getResponse.json();
    console.log('📋 Quiz récupéré:', retrievedQuiz);
    console.log('📊 Groupes cibles récupérés:', retrievedQuiz.target_groups);
    console.log('');

    // 3. Modifier les groupes cibles
    console.log('3️⃣ Modification des groupes cibles...');
    const updateResponse = await fetch(`${API_BASE}/quizzes/${createdQuiz.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        target_groups: ['Terminale groupe 1', 'Terminale groupe 3']
      })
    });

    if (!updateResponse.ok) {
      throw new Error(`Erreur modification: ${updateResponse.status} ${updateResponse.statusText}`);
    }

    const updatedQuiz = await updateResponse.json();
    console.log('✅ Quiz modifié:', updatedQuiz);
    console.log('📊 Nouveaux groupes cibles:', updatedQuiz.target_groups);
    console.log('');

    // 4. Tester la vérification d'accès
    console.log('4️⃣ Test de vérification d\'accès...');
    
    // Étudiant autorisé
    const canTake1 = await fetch(`${API_BASE}/quizzes/${createdQuiz.id}/can-take/Terminale%20groupe%201`);
    const result1 = await canTake1.json();
    console.log('👤 Étudiant Terminale groupe 1:', result1 ? '✅ Autorisé' : '❌ Non autorisé');

    // Étudiant non autorisé
    const canTake2 = await fetch(`${API_BASE}/quizzes/${createdQuiz.id}/can-take/Terminale%20groupe%204`);
    const result2 = await canTake2.json();
    console.log('👤 Étudiant Terminale groupe 4:', result2 ? '✅ Autorisé' : '❌ Non autorisé');

    // 5. Nettoyer - Supprimer le quiz de test
    console.log('\n5️⃣ Nettoyage...');
    await fetch(`${API_BASE}/quizzes/${createdQuiz.id}`, { method: 'DELETE' });
    console.log('🗑️ Quiz de test supprimé');

    console.log('\n🎉 Test terminé avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

// Exécuter le test
testQuizGroups();
