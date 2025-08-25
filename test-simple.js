// test-simple.js
// Script de test simple pour vérifier la fonctionnalité

const testRegistration = async () => {
  const testData = {
    firstName: 'Test',
    lastName: 'Student',
    email: 'test.student@example.com',
    password: 'password123',
    phone: '0123456789',
    userType: 'student',
    studentBirthDate: '2005-06-15',
    studentClass: '3ème',
    // Détails des parents (optionnels)
    parentFirstName: 'Test',
    parentLastName: 'Parent',
    parentEmail: 'test.parent@example.com',
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
    console.log('💡 Assurez-vous que le serveur est démarré sur http://localhost:3001');
  }
};

// Exécuter le test
testRegistration();
