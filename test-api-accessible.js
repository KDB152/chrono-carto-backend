// Script pour tester l'API accessible avec les vrais IDs des étudiants
const API_BASE = 'http://localhost:3001';

async function testApiAccessible() {
  console.log('🔍 Test de l\'API accessible avec les vrais IDs...\n');

  try {
    // 1. Récupérer les étudiants réels
    console.log('1️⃣ Récupération des étudiants réels...');
    const studentsResponse = await fetch(`${API_BASE}/students`);
    if (!studentsResponse.ok) {
      throw new Error('Impossible de récupérer les étudiants');
    }
    
    const studentsData = await studentsResponse.json();
    const students = studentsData.items || [];
    console.log(`👥 Étudiants trouvés: ${students.length}`);
    
    students.forEach(student => {
      console.log(`   - ID ${student.id}: ${student.firstName} ${student.lastName} (${student.classLevel})`);
    });
    
    // 2. Récupérer le quiz existant
    console.log('\n2️⃣ Récupération du quiz existant...');
    const quizzesResponse = await fetch(`${API_BASE}/quizzes`);
    if (!quizzesResponse.ok) {
      throw new Error('Impossible de récupérer les quizzes');
    }
    
    const quizzesData = await quizzesResponse.json();
    const quiz = quizzesData.items[0];
    console.log(`📚 Quiz: "${quiz.title}" (ID: ${quiz.id})`);
    console.log(`   - target_groups: ${JSON.stringify(quiz.target_groups)}`);
    
    // 3. Tester l'API accessible pour chaque étudiant
    console.log('\n3️⃣ Test de l\'API accessible/:studentId...');
    
    for (const student of students) {
      console.log(`\n👤 ${student.firstName} ${student.lastName} (ID: ${student.id})`);
      console.log(`   - Groupe: ${student.classLevel}`);
      
      // Vérifier si l'étudiant devrait voir le quiz
      const shouldSeeQuiz = !quiz.target_groups || quiz.target_groups.length === 0 || 
                           quiz.target_groups.includes(student.classLevel);
      console.log(`   - Devrait voir le quiz: ${shouldSeeQuiz}`);
      
      // Tester l'API accessible
      try {
        const accessibleResponse = await fetch(`${API_BASE}/quizzes/accessible/${student.id}`);
        console.log(`   - Status API: ${accessibleResponse.status}`);
        
        if (accessibleResponse.ok) {
          const accessibleQuizzes = await accessibleResponse.json();
          console.log(`   - Quizzes accessibles: ${accessibleQuizzes.length}`);
          
          const canSeeQuiz = accessibleQuizzes.some(q => q.id === quiz.id);
          console.log(`   - Peut voir le quiz: ${canSeeQuiz}`);
          
          if (canSeeQuiz === shouldSeeQuiz) {
            console.log(`   ✅ Comportement correct`);
          } else {
            console.log(`   ❌ Comportement incorrect!`);
          }
          
          // Afficher les quizzes accessibles
          if (accessibleQuizzes.length > 0) {
            console.log(`   📋 Quizzes accessibles:`);
            accessibleQuizzes.forEach(q => {
              console.log(`      - "${q.title}" (ID: ${q.id})`);
            });
          }
        } else {
          const errorText = await accessibleResponse.text();
          console.log(`   ❌ Erreur API: ${errorText}`);
        }
      } catch (error) {
        console.log(`   ❌ Erreur: ${error.message}`);
      }
    }
    
    // 4. Test direct de canStudentTakeQuiz
    console.log('\n4️⃣ Test direct de canStudentTakeQuiz...');
    
    for (const student of students) {
      console.log(`\n👤 ${student.firstName} ${student.lastName}:`);
      
      try {
        const canTakeResponse = await fetch(`${API_BASE}/quizzes/${quiz.id}/can-take-student/${student.id}`);
        if (canTakeResponse.ok) {
          const canTake = await canTakeResponse.json();
          console.log(`   - Peut tenter le quiz: ${canTake}`);
          
          const shouldTake = !quiz.target_groups || quiz.target_groups.length === 0 || 
                           quiz.target_groups.includes(student.classLevel);
          console.log(`   - Devrait pouvoir tenter: ${shouldTake}`);
          
          if (canTake === shouldTake) {
            console.log(`   ✅ Comportement correct`);
          } else {
            console.log(`   ❌ Comportement incorrect!`);
          }
        } else {
          const errorText = await canTakeResponse.text();
          console.log(`   ❌ Erreur: ${errorText}`);
        }
      } catch (error) {
        console.log(`   ❌ Erreur: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

testApiAccessible();
