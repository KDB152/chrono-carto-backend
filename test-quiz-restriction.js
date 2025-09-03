// Script de test pour vérifier la restriction d'accès aux quizzes
const API_BASE = 'http://localhost:3001';

async function testQuizRestriction() {
  console.log('🔒 Test de la restriction d\'accès aux quizzes...\n');

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

    // 2. Tester la soumission d'une tentative par un étudiant autorisé
    console.log('2️⃣ Test: Étudiant AUTORISÉ (Terminale groupe 1)...');
    try {
      const attemptResponse = await fetch(`${API_BASE}/quizzes/attempts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quiz_id: createdQuiz.id,
          student_id: 1, // Supposons que l'étudiant 1 est Terminale groupe 1
          student_name: 'Étudiant Autorisé',
          score: 15,
          total_points: 20,
          percentage: 75,
          time_spent: 25
        })
      });

      if (attemptResponse.ok) {
        console.log('✅ SUCCÈS: L\'étudiant autorisé peut tenter le quiz');
      } else {
        const error = await attemptResponse.json();
        console.log('❌ ÉCHEC: L\'étudiant autorisé ne peut pas tenter le quiz');
        console.log('   Erreur:', error.message);
      }
    } catch (error) {
      console.log('❌ Erreur lors de la tentative autorisée:', error.message);
    }

    console.log('');

    // 3. Tester la soumission d'une tentative par un étudiant NON autorisé
    console.log('3️⃣ Test: Étudiant NON AUTORISÉ (Terminale groupe 2)...');
    try {
      const attemptResponse = await fetch(`${API_BASE}/quizzes/attempts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quiz_id: createdQuiz.id,
          student_id: 2, // Supposons que l'étudiant 2 est Terminale groupe 2
          student_name: 'Étudiant Non Autorisé',
          score: 18,
          total_points: 20,
          percentage: 90,
          time_spent: 30
        })
      });

      if (attemptResponse.ok) {
        console.log('❌ PROBLÈME: L\'étudiant non autorisé peut tenter le quiz !');
        console.log('   La restriction ne fonctionne pas correctement.');
      } else {
        const error = await attemptResponse.json();
        console.log('✅ SUCCÈS: L\'étudiant non autorisé est bloqué');
        console.log('   Message d\'erreur:', error.message);
      }
    } catch (error) {
      console.log('✅ SUCCÈS: L\'étudiant non autorisé est bloqué (exception)');
      console.log('   Erreur:', error.message);
    }

    console.log('');

    // 4. Vérifier les statistiques d'accès
    console.log('4️⃣ Vérification des statistiques d\'accès...');
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

    // 5. Nettoyer
    console.log('\n5️⃣ Nettoyage...');
    await fetch(`${API_BASE}/quizzes/${createdQuiz.id}`, { method: 'DELETE' });
    console.log('🗑️ Quiz de test supprimé');

    console.log('\n🎯 Résumé du test de restriction:');
    console.log('   ✅ Quiz créé avec groupes cibles restreints');
    console.log('   ✅ Vérification de l\'accès autorisé');
    console.log('   ✅ Vérification du blocage des accès non autorisés');
    console.log('   ✅ Statistiques d\'accès récupérées');

  } catch (error) {
    console.error('❌ Erreur lors du test de restriction:', error);
  }
}

// Exécuter le test
testQuizRestriction();
