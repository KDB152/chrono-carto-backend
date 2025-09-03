// Script de diagnostic complet pour identifier le problème de restriction
const API_BASE = 'http://localhost:3001';

async function diagnosticComplet() {
  console.log('🔍 DIAGNOSTIC COMPLET - Restriction d\'accès aux quizzes...\n');

  try {
    // 1. Vérifier la structure de la base de données
    console.log('1️⃣ Vérification de la structure de la base...');
    
    // Récupérer tous les quizzes pour voir leur structure
    const allQuizzesResponse = await fetch(`${API_BASE}/quizzes`);
    if (allQuizzesResponse.ok) {
      const allQuizzesData = await allQuizzesResponse.json();
      console.log('📥 Réponse brute de l\'API /quizzes:');
      console.log('   - Type:', typeof allQuizzesData);
      console.log('   - Est array:', Array.isArray(allQuizzesData));
      console.log('   - Contenu:', JSON.stringify(allQuizzesData, null, 2));
      
      // Extraire les quizzes selon la structure de réponse
      let allQuizzes = [];
      if (Array.isArray(allQuizzesData)) {
        allQuizzes = allQuizzesData;
      } else if (allQuizzesData && allQuizzesData.data && Array.isArray(allQuizzesData.data)) {
        allQuizzes = allQuizzesData.data;
      } else if (allQuizzesData && allQuizzesData.quizzes && Array.isArray(allQuizzesData.quizzes)) {
        allQuizzes = allQuizzesData.quizzes;
      } else if (allQuizzesData && allQuizzesData.items && Array.isArray(allQuizzesData.items)) {
        allQuizzes = allQuizzesData.items;
        console.log('✅ Structure items détectée et extraite');
      } else {
        console.log('⚠️  Structure de réponse inattendue');
        allQuizzes = [];
      }
      
      console.log(`\n📚 Total quizzes extraits: ${allQuizzes.length}`);
      
      if (allQuizzes.length > 0) {
        // Analyser la structure des quizzes
        allQuizzes.forEach((quiz, index) => {
          console.log(`\n   Quiz ${index + 1}: "${quiz.title}"`);
          console.log(`   - ID: ${quiz.id}`);
          console.log(`   - Status: ${quiz.status}`);
          console.log(`   - target_groups: ${JSON.stringify(quiz.target_groups)}`);
          console.log(`   - Type target_groups: ${typeof quiz.target_groups}`);
          console.log(`   - Est array: ${Array.isArray(quiz.target_groups)}`);
        });
      } else {
        console.log('   ℹ️  Aucun quiz trouvé dans la base');
      }
    } else {
      console.log('❌ Impossible de récupérer les quizzes');
      const errorText = await allQuizzesResponse.text();
      console.log('   Erreur:', errorText);
    }

    console.log('\n' + '='.repeat(60) + '\n');

    // 2. Vérifier les étudiants et leurs class_level
    console.log('2️⃣ Vérification des étudiants et leurs groupes...');
    
    // Récupérer tous les étudiants (si l'endpoint existe)
    try {
      console.log('🔍 Test de l\'endpoint /students...');
      const studentsResponse = await fetch(`${API_BASE}/students`);
      console.log('   - Status:', studentsResponse.status);
      console.log('   - OK:', studentsResponse.ok);
      
      if (studentsResponse.ok) {
        const studentsData = await studentsResponse.json();
        console.log('   - Type réponse:', typeof studentsData);
        console.log('   - Est array:', Array.isArray(studentsData));
        
                 let students = [];
         if (Array.isArray(studentsData)) {
           students = studentsData;
         } else if (studentsData && studentsData.data && Array.isArray(studentsData.data)) {
           students = studentsData.data;
         } else if (studentsData && studentsData.items && Array.isArray(studentsData.items)) {
           students = studentsData.items;
           console.log('   ✅ Structure items détectée pour les étudiants');
         } else if (studentsData && studentsData.students && Array.isArray(studentsData.students)) {
           students = studentsData.students;
           console.log('   ✅ Structure students détectée');
         } else {
           console.log('   ⚠️  Structure de réponse inattendue pour les étudiants');
           console.log('   📋 Contenu:', JSON.stringify(studentsData, null, 2));
           students = [];
         }
        
        console.log(`👥 Total étudiants dans la base: ${students.length}`);
        
        if (students.length > 0) {
                   // Analyser les groupes des étudiants
         const groupCounts = {};
         students.forEach(student => {
           const group = student.classLevel || 'Non défini';
           groupCounts[group] = (groupCounts[group] || 0) + 1;
         });
          
          console.log('📊 Répartition par groupe:');
          Object.entries(groupCounts).forEach(([group, count]) => {
            console.log(`   - ${group}: ${count} étudiants`);
          });
        } else {
          console.log('   ℹ️  Aucun étudiant trouvé dans la base');
        }
      } else {
        console.log('⚠️  Endpoint /students non disponible ou erreur');
        const errorText = await studentsResponse.text();
        console.log('   Erreur:', errorText);
      }
    } catch (error) {
      console.log('⚠️  Impossible de récupérer les étudiants:', error.message);
    }

    console.log('\n' + '='.repeat(60) + '\n');

    // 3. Test de création d'un quiz avec restriction
    console.log('3️⃣ Test de création d\'un quiz avec restriction...');
    
    const testQuiz = {
      title: 'QUIZ TEST RESTRICTION - ' + new Date().toISOString(),
      description: 'Quiz de test pour vérifier la restriction',
      subject: 'Test',
      level: 'Test',
      duration: 15,
      pass_score: 5,
      status: 'Publié',
      tags: ['test'],
      is_time_limited: false,
      allow_retake: false,
      show_results: true,
      randomize_questions: false,
      target_groups: ['Terminale groupe 1', '1ère groupe 1'] // Groupes spécifiques
    };

    console.log('📝 Données du quiz à créer:');
    console.log('   - target_groups:', JSON.stringify(testQuiz.target_groups));
    console.log('   - Type:', typeof testQuiz.target_groups);
    console.log('   - Est array:', Array.isArray(testQuiz.target_groups));

    const createResponse = await fetch(`${API_BASE}/quizzes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testQuiz)
    });

    if (createResponse.ok) {
      const createdQuiz = await createResponse.json();
      console.log('\n✅ Quiz créé avec succès!');
      console.log('   - ID:', createdQuiz.id);
      console.log('   - target_groups sauvegardés:', JSON.stringify(createdQuiz.target_groups));
      console.log('   - Type sauvegardé:', typeof createdQuiz.target_groups);
      console.log('   - Est array sauvegardé:', Array.isArray(createdQuiz.target_groups));

      // 4. Test de l'API accessible
      console.log('\n4️⃣ Test de l\'API accessible/:studentId...');
      
      // Simuler différents étudiants
      const testStudents = [
        { id: 1, name: 'Étudiant 1', expectedGroup: 'Terminale groupe 1' },
        { id: 2, name: 'Étudiant 2', expectedGroup: 'Terminale groupe 2' },
        { id: 3, name: 'Étudiant 3', expectedGroup: '1ère groupe 1' },
        { id: 4, name: 'Étudiant 4', expectedGroup: '1ère groupe 2' }
      ];

      for (const student of testStudents) {
        console.log(`\n👤 ${student.name} (${student.expectedGroup}):`);
        
        try {
          const accessibleResponse = await fetch(`${API_BASE}/quizzes/accessible/${student.id}`);
          if (accessibleResponse.ok) {
            const accessibleQuizzes = await accessibleResponse.json();
            const canSeeQuiz = accessibleQuizzes.some(q => q.id === createdQuiz.id);
            
            const shouldSeeQuiz = testQuiz.target_groups.includes(student.expectedGroup);
            const status = canSeeQuiz === shouldSeeQuiz ? '✅' : '❌';
            
            console.log(`   ${status} Peut voir le quiz: ${canSeeQuiz} (devrait: ${shouldSeeQuiz})`);
            console.log(`   📚 Quizzes visibles: ${accessibleQuizzes.length}`);
            
            if (canSeeQuiz !== shouldSeeQuiz) {
              console.log(`   ⚠️  PROBLÈME: Comportement inattendu!`);
            }
          } else {
            console.log('   ❌ Erreur API');
          }
        } catch (error) {
          console.log('   ❌ Erreur:', error.message);
        }
      }

      // 5. Nettoyer
      console.log('\n5️⃣ Nettoyage...');
      await fetch(`${API_BASE}/quizzes/${createdQuiz.id}`, { method: 'DELETE' });
      console.log('🗑️ Quiz de test supprimé');

    } else {
      const error = await createResponse.text();
      console.log('❌ Erreur lors de la création:', error);
    }

    console.log('\n🎯 Résumé du diagnostic:');
    console.log('   ✅ Structure de la base analysée');
    console.log('   ✅ Étudiants et groupes vérifiés');
    console.log('   ✅ Quiz de test créé et supprimé');
    console.log('   ✅ API accessible testée pour différents groupes');

  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error);
  }
}

// Exécuter le diagnostic
diagnosticComplet();
