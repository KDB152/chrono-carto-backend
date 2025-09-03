// Script pour examiner la structure des étudiants
const API_BASE = 'http://localhost:3001';

async function verifierEtudiants() {
  console.log('🔍 Vérification détaillée des étudiants...\n');

  try {
    const studentsResponse = await fetch(`${API_BASE}/students`);
    if (studentsResponse.ok) {
      const studentsData = await studentsResponse.json();
      console.log('📥 Réponse brute de /students:');
      console.log(JSON.stringify(studentsData, null, 2));
      
      const students = studentsData.items || [];
      console.log(`\n👥 Total étudiants: ${students.length}`);
      
      students.forEach((student, index) => {
        console.log(`\n📋 Étudiant ${index + 1}:`);
        console.log('   - ID:', student.id);
        console.log('   - Nom:', student.name || student.first_name || student.last_name || 'Non défini');
        console.log('   - Email:', student.email || 'Non défini');
        console.log('   - class_level:', student.class_level || 'NON DÉFINI ❌');
        console.log('   - Toutes les propriétés:', Object.keys(student));
        console.log('   - Contenu complet:', JSON.stringify(student, null, 2));
      });
      
      // Vérifier s'il y a d'autres champs pour le groupe
      if (students.length > 0) {
        const firstStudent = students[0];
        console.log('\n🔍 Recherche de champs alternatifs pour le groupe...');
        
        const possibleGroupFields = ['group', 'class', 'level', 'grade', 'section', 'classe'];
        possibleGroupFields.forEach(field => {
          if (firstStudent[field] !== undefined) {
            console.log(`   ✅ Champ trouvé: ${field} = ${firstStudent[field]}`);
          }
        });
      }
      
    } else {
      console.log('❌ Erreur API /students');
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

verifierEtudiants();
