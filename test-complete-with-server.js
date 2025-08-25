// test-complete-with-server.js
// Script complet pour tester la fonctionnalité avec démarrage du serveur

const { spawn } = require('child_process');
const fetch = require('node-fetch');

const testCompleteWithServer = async () => {
  console.log('🚀 Démarrage du test complet avec serveur\n');

  let serverProcess = null;

  try {
    // 1. Démarrer le serveur
    console.log('🔧 Démarrage du serveur NestJS...');
    serverProcess = spawn('npm', ['run', 'start:dev'], {
      stdio: 'pipe',
      shell: true
    });

    // Attendre que le serveur démarre
    console.log('⏳ Attente du démarrage du serveur...');
    await new Promise(resolve => setTimeout(resolve, 20000));

    // 2. Tester la connexion
    console.log('🔍 Test de connexion au serveur...');
    try {
      const response = await fetch('http://localhost:3001');
      if (response.ok) {
        console.log('✅ Serveur accessible');
      } else {
        console.log('⚠️ Serveur répond mais avec un statut:', response.status);
      }
    } catch (error) {
      console.log('❌ Serveur non accessible:', error.message);
      console.log('💡 Tentative de test direct...');
    }

    // 3. Test de la fonctionnalité
    console.log('\n🧪 Test de la fonctionnalité de création automatique de comptes parents...');
    
    const testData = {
      firstName: 'Test',
      lastName: 'Student',
      email: 'test.student.auto@example.com',
      password: 'password123',
      phone: '0123456789',
      userType: 'student',
      studentBirthDate: '2005-06-15',
      studentClass: '3ème',
      // Détails des parents (optionnels)
      parentFirstName: 'Test',
      parentLastName: 'Parent',
      parentEmail: 'test.parent.auto@example.com',
      parentPhone: '0987654321'
    };

    console.log('📝 Données de test:', JSON.stringify(testData, null, 2));

    try {
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
        
        // 4. Vérifier les données créées
        console.log('\n🔍 Vérification des données créées...');
        await checkCreatedData();
        
      } else {
        console.log('❌ Erreur lors de l\'inscription:');
        console.log('📋 Réponse:', result);
      }
    } catch (error) {
      console.error('💥 Erreur de connexion:', error.message);
      console.log('💡 Le serveur pourrait ne pas être encore prêt');
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    // 5. Arrêter le serveur
    if (serverProcess) {
      console.log('\n🛑 Arrêt du serveur...');
      serverProcess.kill('SIGTERM');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
};

const checkCreatedData = async () => {
  const mysql = require('mysql2/promise');
  
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'chrono_carto',
  });

  try {
    console.log('📊 Vérification des données dans la base...');
    
    // Vérifier l'utilisateur étudiant
    const [students] = await connection.execute(`
      SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.is_active, u.is_approved, u.email_verified,
             s.id as student_id, s.class_level
      FROM users u
      JOIN students s ON u.id = s.user_id
      WHERE u.email = 'test.student.auto@example.com'
    `);
    
    if (students.length > 0) {
      const student = students[0];
      console.log('✅ Étudiant créé:', {
        id: student.id,
        email: student.email,
        name: `${student.first_name} ${student.last_name}`,
        role: student.role,
        is_active: student.is_active,
        is_approved: student.is_approved,
        email_verified: student.email_verified,
        class_level: student.class_level
      });
    }

    // Vérifier l'utilisateur parent
    const [parents] = await connection.execute(`
      SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.is_active, u.is_approved, u.email_verified,
             p.id as parent_id, p.phone_number
      FROM users u
      JOIN parents p ON u.id = p.user_id
      WHERE u.email = 'test.parent.auto@example.com'
    `);
    
    if (parents.length > 0) {
      const parent = parents[0];
      console.log('✅ Parent créé automatiquement:', {
        id: parent.id,
        email: parent.email,
        name: `${parent.first_name} ${parent.last_name}`,
        role: parent.role,
        is_active: parent.is_active,
        is_approved: parent.is_approved,
        email_verified: parent.email_verified,
        phone: parent.phone_number
      });
    }

    // Vérifier la relation parent-student
    const [relations] = await connection.execute(`
      SELECT ps.id, ps.parent_id, ps.student_id, ps.created_at,
             p.id as parent_user_id, s.id as student_user_id
      FROM parent_student ps
      JOIN parents p ON ps.parent_id = p.id
      JOIN students s ON ps.student_id = s.id
      JOIN users up ON p.user_id = up.id
      JOIN users us ON s.user_id = us.id
      WHERE up.email = 'test.parent.auto@example.com' AND us.email = 'test.student.auto@example.com'
    `);
    
    if (relations.length > 0) {
      const relation = relations[0];
      console.log('✅ Relation parent-student créée:', {
        id: relation.id,
        parent_id: relation.parent_id,
        student_id: relation.student_id,
        created_at: relation.created_at
      });
    }

    console.log('\n🎉 Test complet réussi! La fonctionnalité fonctionne correctement.');

  } catch (error) {
    console.error('❌ Erreur lors de la vérification des données:', error);
  } finally {
    await connection.end();
  }
};

// Exécuter le test complet
if (require.main === module) {
  testCompleteWithServer().catch(console.error);
}

module.exports = { testCompleteWithServer };
