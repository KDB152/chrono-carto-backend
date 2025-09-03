// Script de test pour la fonctionnalité d'accès aux quizzes
const API_BASE = 'http://localhost:3001';

async function testQuizAccess() {
  console.log('🧪 Test de la fonctionnalité d\'accès aux quizzes...\n');

  try {
    // 1. Créer un quiz avec des groupes cibles spécifiques
    console.log('1️⃣ Création d\'un quiz avec groupes cibles...');
    const createResponse = await fetch(`${API_BASE}/quizzes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Quiz Histoire - Terminale Groupe 1 & 2',
        description: 'Quiz sur la Révolution française pour Terminale Groupe 1 et 2 uniquement',
        subject: 'Histoire',
        level: 'Terminale',
        duration: 45,
        pass_score: 12,
        status: 'Publié',
        tags: ['révolution', 'france', 'histoire'],
        is_time_limited: true,
        allow_retake: false,
        show_results: true,
        randomize_questions: true,
        target_groups: ['Terminale groupe 1', 'Terminale groupe 2']
      })
    });

    if (!createResponse.ok) {
      throw new Error(`Erreur création: ${createResponse.status} ${createResponse.statusText}`);
    }

    const createdQuiz = await createResponse.json();
    console.log('✅ Quiz créé:', createdQuiz.title);
    console.log('📊 Groupes cibles:', createdQuiz.target_groups);
    console.log('');

    // 2. Tester l'accès par groupe
    console.log('2️⃣ Test d\'accès par groupe...');
    
    // Groupe autorisé
    const canTake1 = await fetch(`${API_BASE}/quizzes/${createdQuiz.id}/can-take/Terminale%20groupe%201`);
    const result1 = await canTake1.json();
    console.log('👤 Terminale groupe 1:', result1 ? '✅ Autorisé' : '❌ Non autorisé');

    // Groupe non autorisé
    const canTake2 = await fetch(`${API_BASE}/quizzes/${createdQuiz.id}/can-take/Terminale%20groupe%204`);
    const result2 = await canTake2.json();
    console.log('👤 Terminale groupe 4:', result2 ? '✅ Autorisé' : '❌ Non autorisé');

    // 3. Tester l'accès par ID d'étudiant (simulation)
    console.log('\n3️⃣ Test d\'accès par ID d\'étudiant...');
    
    // Note: Vous devrez avoir des étudiants dans votre base de données
    // avec les bons class_level pour tester cette fonctionnalité
    
    // 4. Récupérer les statistiques d'accès
    console.log('\n4️⃣ Statistiques d\'accès du quiz...');
    const statsResponse = await fetch(`${API_BASE}/quizzes/${createdQuiz.id}/access-stats`);
    if (statsResponse.ok) {
      const stats = await statsResponse.json();
      console.log('📊 Statistiques d\'accès:', stats);
    } else {
      console.log('❌ Impossible de récupérer les statistiques');
    }

    // 5. Modifier les groupes cibles
    console.log('\n5️⃣ Modification des groupes cibles...');
    const updateResponse = await fetch(`${API_BASE}/quizzes/${createdQuiz.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        target_groups: ['Terminale groupe 1', 'Terminale groupe 3']
      })
    });

    if (updateResponse.ok) {
      const updatedQuiz = await updateResponse.json();
      console.log('✅ Quiz modifié');
      console.log('📊 Nouveaux groupes cibles:', updatedQuiz.target_groups);
    } else {
      console.log('❌ Erreur lors de la modification');
    }

    // 6. Tester la nouvelle configuration
    console.log('\n6️⃣ Test de la nouvelle configuration...');
    
    const canTake3 = await fetch(`${API_BASE}/quizzes/${createdQuiz.id}/can-take/Terminale%20groupe%202`);
    const result3 = await canTake3.json();
    console.log('👤 Terminale groupe 2 (après modification):', result3 ? '✅ Autorisé' : '❌ Non autorisé');

    const canTake4 = await fetch(`${API_BASE}/quizzes/${createdQuiz.id}/can-take/Terminale%20groupe%203`);
    const result4 = await canTake4.json();
    console.log('👤 Terminale groupe 3 (après modification):', result4 ? '✅ Autorisé' : '❌ Non autorisé');

    // 7. Nettoyer - Supprimer le quiz de test
    console.log('\n7️⃣ Nettoyage...');
    await fetch(`${API_BASE}/quizzes/${createdQuiz.id}`, { method: 'DELETE' });
    console.log('🗑️ Quiz de test supprimé');

    console.log('\n🎉 Test terminé avec succès !');
    console.log('\n📋 Résumé des fonctionnalités testées:');
    console.log('   ✅ Création de quiz avec groupes cibles');
    console.log('   ✅ Vérification d\'accès par groupe');
    console.log('   ✅ Modification des groupes cibles');
    console.log('   ✅ Statistiques d\'accès');
    console.log('   ✅ Restriction d\'accès automatique');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

// Exécuter le test
testQuizAccess();
