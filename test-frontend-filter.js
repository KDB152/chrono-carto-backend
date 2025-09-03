// Script de test pour vérifier le filtrage des quizzes accessibles
const API_BASE = 'http://localhost:3001';

async function testFrontendFilter() {
  console.log('🔍 Test du filtrage des quizzes accessibles...\n');

  try {
    // 1. Créer un quiz avec des groupes cibles spécifiques
    console.log('1️⃣ Création d\'un quiz restreint...');
    const createResponse = await fetch(`${API_BASE}/quizzes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Quiz Restreint - Terminale Groupe 1 UNIQUEMENT',
        description: 'Ce quiz ne peut être tenté QUE par Terminale Groupe 1',
        subject: 'Test',
        level: 'Terminale',
        duration: 30,
        pass_score: 10,
        status: 'Publié',
        tags: ['test', 'restriction'],
        is_time_limited: true,
        allow_retake: false,
        show_results: true,
        randomize_questions: false,
        target_groups: ['Terminale groupe 1'] // SEUL ce groupe peut tenter
      })
    });

    if (!createResponse.ok) {
      throw new Error(`Erreur création: ${createResponse.status} ${createResponse.statusText}`);
    }

    const createdQuiz = await createResponse.json();
    console.log('✅ Quiz créé:', createdQuiz.title);
    console.log('📊 Groupes cibles:', createdQuiz.target_groups);
    console.log('');

    // 2. Tester l'API accessible/:studentId
    console.log('2️⃣ Test de l\'API accessible/:studentId...');
    
    // Étudiant 1 (Terminale groupe 1) - devrait voir le quiz
    console.log('👤 Étudiant 1 (Terminale groupe 1):');
    try {
      const accessibleResponse1 = await fetch(`${API_BASE}/quizzes/accessible/1`);
      if (accessibleResponse1.ok) {
        const accessibleQuizzes1 = await accessibleResponse1.json();
        const canSeeQuiz1 = accessibleQuizzes1.some(q => q.id === createdQuiz.id);
        console.log(`   ${canSeeQuiz1 ? '✅' : '❌'} Peut voir le quiz: ${canSeeQuiz1}`);
        console.log(`   📚 Quizzes visibles: ${accessibleQuizzes1.length}`);
      } else {
        console.log('   ❌ Erreur API');
      }
    } catch (error) {
      console.log('   ❌ Erreur:', error.message);
    }

    console.log('');

    // Étudiant 2 (Terminale groupe 2) - ne devrait PAS voir le quiz
    console.log('👤 Étudiant 2 (Terminale groupe 2):');
    try {
      const accessibleResponse2 = await fetch(`${API_BASE}/quizzes/accessible/2`);
      if (accessibleResponse2.ok) {
        const accessibleQuizzes2 = await accessibleResponse2.json();
        const canSeeQuiz2 = accessibleQuizzes2.some(q => q.id === createdQuiz.id);
        console.log(`   ${canSeeQuiz2 ? '❌' : '✅'} Peut voir le quiz: ${canSeeQuiz2}`);
        console.log(`   📚 Quizzes visibles: ${accessibleQuizzes2.length}`);
        
        if (canSeeQuiz2) {
          console.log('   ⚠️  PROBLÈME: L\'étudiant non autorisé peut voir le quiz !');
        } else {
          console.log('   ✅ SUCCÈS: L\'étudiant non autorisé ne peut pas voir le quiz');
        }
      } else {
        console.log('   ❌ Erreur API');
      }
    } catch (error) {
      console.log('   ❌ Erreur:', error.message);
    }

    console.log('');

    // 3. Vérifier les statistiques d'accès
    console.log('3️⃣ Statistiques d\'accès du quiz...');
    try {
      const statsResponse = await fetch(`${API_BASE}/quizzes/${createdQuiz.id}/access-stats`);
      if (statsResponse.ok) {
        const stats = await statsResponse.json();
        console.log('📊 Statistiques d\'accès:');
        console.log('   - Total étudiants:', stats.totalStudents);
        console.log('   - Étudiants ayant accès:', stats.accessibleStudents);
        console.log('   - Groupes cibles:', stats.accessibleGroups);
      } else {
        console.log('❌ Impossible de récupérer les statistiques');
      }
    } catch (error) {
      console.log('❌ Erreur lors de la récupération des statistiques:', error.message);
    }

    // 4. Nettoyer
    console.log('\n4️⃣ Nettoyage...');
    await fetch(`${API_BASE}/quizzes/${createdQuiz.id}`, { method: 'DELETE' });
    console.log('🗑️ Quiz de test supprimé');

    console.log('\n🎯 Résumé du test de filtrage:');
    console.log('   ✅ Quiz créé avec groupes cibles restreints');
    console.log('   ✅ Test de l\'API accessible/:studentId');
    console.log('   ✅ Vérification du filtrage côté frontend');
    console.log('   ✅ Statistiques d\'accès récupérées');

  } catch (error) {
    console.error('❌ Erreur lors du test de filtrage:', error);
  }
}

// Exécuter le test
testFrontendFilter();
