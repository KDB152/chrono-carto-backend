// test-parent-student-creation.js
// Script de test pour vérifier la création automatique de comptes parents

const testStudentRegistrationWithParent = async () => {
  const testData = {
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean.dupont@test.com',
    password: 'password123',
    phone: '0123456789',
    userType: 'student',
    studentBirthDate: '2005-06-15',
    studentClass: '3ème',
    // Détails des parents (optionnels)
    parentFirstName: 'Marie',
    parentLastName: 'Dupont',
    parentEmail: 'marie.dupont@test.com',
    parentPhone: '0987654321'
  };

  try {
    console.log('🧪 Test: Inscription d\'un étudiant avec détails des parents');
    console.log('📝 Données de test:', JSON.stringify(testData, null, 2));

    const response = await fetch('http://localhost:3001/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Inscription réussie!');
      console.log('📋 Réponse:', result);
      console.log('🎯 ID de l\'étudiant créé:', result.userId);
    } else {
      console.log('❌ Erreur lors de l\'inscription:');
      console.log('📋 Réponse:', result);
    }
  } catch (error) {
    console.error('💥 Erreur de connexion:', error.message);
  }
};

const testStudentRegistrationWithoutParent = async () => {
  const testData = {
    firstName: 'Sophie',
    lastName: 'Martin',
    email: 'sophie.martin@test.com',
    password: 'password123',
    phone: '0123456789',
    userType: 'student',
    studentBirthDate: '2006-03-20',
    studentClass: '4ème',
    // Pas de détails des parents
  };

  try {
    console.log('\n🧪 Test: Inscription d\'un étudiant SANS détails des parents');
    console.log('📝 Données de test:', JSON.stringify(testData, null, 2));

    const response = await fetch('http://localhost:3001/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Inscription réussie!');
      console.log('📋 Réponse:', result);
      console.log('🎯 ID de l\'étudiant créé:', result.userId);
    } else {
      console.log('❌ Erreur lors de l\'inscription:');
      console.log('📋 Réponse:', result);
    }
  } catch (error) {
    console.error('💥 Erreur de connexion:', error.message);
  }
};

const testParentRegistration = async () => {
  const testData = {
    firstName: 'Pierre',
    lastName: 'Durand',
    email: 'pierre.durand@test.com',
    password: 'password123',
    phone: '0123456789',
    userType: 'parent',
  };

  try {
    console.log('\n🧪 Test: Inscription d\'un parent');
    console.log('📝 Données de test:', JSON.stringify(testData, null, 2));

    const response = await fetch('http://localhost:3001/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Inscription réussie!');
      console.log('📋 Réponse:', result);
      console.log('🎯 ID du parent créé:', result.userId);
    } else {
      console.log('❌ Erreur lors de l\'inscription:');
      console.log('📋 Réponse:', result);
    }
  } catch (error) {
    console.error('💥 Erreur de connexion:', error.message);
  }
};

// Exécuter les tests
const runTests = async () => {
  console.log('🚀 Démarrage des tests de création automatique de comptes parents\n');
  
  await testStudentRegistrationWithParent();
  await testStudentRegistrationWithoutParent();
  await testParentRegistration();
  
  console.log('\n🏁 Tests terminés!');
  console.log('\n📊 Résumé attendu:');
  console.log('- Test 1: Étudiant + détails parents → Compte étudiant + compte parent automatique');
  console.log('- Test 2: Étudiant sans détails parents → Compte étudiant seulement');
  console.log('- Test 3: Parent → Compte parent normal');
};

// Vérifier si le script est exécuté directement
if (typeof window === 'undefined') {
  runTests().catch(console.error);
}

module.exports = { runTests };
