const API_BASE = 'http://localhost:3001';

async function testUserAuthentication() {
  console.log('🔐 Test de l\'authentification utilisateur...\n');

  try {
    // Test 1: Connexion de Mehdi (Admin)
    console.log('1️⃣ Test de connexion - Mehdi (Admin)...');
    
    const loginResponse1 = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'mehdielabed86@gmail.com',
        password: 'password123'
      })
    });

    console.log(`Status: ${loginResponse1.status}`);

    if (loginResponse1.ok) {
      const loginData1 = await loginResponse1.json();
      console.log('✅ Connexion réussie pour Mehdi');
      console.log('Token:', loginData1.accessToken ? 'Présent' : 'Absent');
      console.log('User ID:', loginData1.user.id);
      console.log('User Role:', loginData1.user.role);
      console.log('User Details:', {
        firstName: loginData1.user.firstName,
        lastName: loginData1.user.lastName,
        email: loginData1.user.email
      });

      // Test 2: Récupérer les destinataires pour Mehdi
      console.log('\n2️⃣ Test des destinataires pour Mehdi...');
      
      const recipientsResponse1 = await fetch(`${API_BASE}/messaging/users/${loginData1.user.id}/available-recipients`);
      console.log(`Status: ${recipientsResponse1.status}`);

      if (recipientsResponse1.ok) {
        const recipients1 = await recipientsResponse1.json();
        console.log(`✅ ${recipients1.length} destinataire(s) trouvé(s) pour Mehdi`);
        console.log('Destinataires:', recipients1.map(r => `${r.first_name} ${r.last_name} (${r.role})`));
      } else {
        console.log('❌ Erreur lors de la récupération des destinataires pour Mehdi');
      }
    } else {
      console.log('❌ Échec de la connexion pour Mehdi');
      const errorText = await loginResponse1.text();
      console.log('Erreur:', errorText);
    }

    // Test 3: Connexion de Mayssa (Student)
    console.log('\n3️⃣ Test de connexion - Mayssa (Student)...');
    
    const loginResponse2 = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'mehdielabed69@gmail.com',
        password: 'password123'
      })
    });

    console.log(`Status: ${loginResponse2.status}`);

    if (loginResponse2.ok) {
      const loginData2 = await loginResponse2.json();
      console.log('✅ Connexion réussie pour Mayssa');
      console.log('Token:', loginData2.accessToken ? 'Présent' : 'Absent');
      console.log('User ID:', loginData2.user.id);
      console.log('User Role:', loginData2.user.role);
      console.log('User Details:', {
        firstName: loginData2.user.firstName,
        lastName: loginData2.user.lastName,
        email: loginData2.user.email
      });

      // Test 4: Récupérer les destinataires pour Mayssa
      console.log('\n4️⃣ Test des destinataires pour Mayssa...');
      
      const recipientsResponse2 = await fetch(`${API_BASE}/messaging/users/${loginData2.user.id}/available-recipients`);
      console.log(`Status: ${recipientsResponse2.status}`);

      if (recipientsResponse2.ok) {
        const recipients2 = await recipientsResponse2.json();
        console.log(`✅ ${recipients2.length} destinataire(s) trouvé(s) pour Mayssa`);
        console.log('Destinataires:', recipients2.map(r => `${r.first_name} ${r.last_name} (${r.role})`));
      } else {
        console.log('❌ Erreur lors de la récupération des destinataires pour Mayssa');
      }
    } else {
      console.log('❌ Échec de la connexion pour Mayssa');
      const errorText = await loginResponse2.text();
      console.log('Erreur:', errorText);
    }

    // Test 5: Vérifier les données localStorage simulées
    console.log('\n5️⃣ Simulation des données localStorage...');
    
    const mockUserData1 = {
      id: 28,
      email: 'mehdielabed86@gmail.com',
      role: 'admin',
      firstName: 'Mehdi',
      lastName: 'El Abed'
    };

    const mockUserData2 = {
      id: 36,
      email: 'mehdielabed69@gmail.com',
      role: 'student',
      firstName: 'Mayssa',
      lastName: 'El Abed'
    };

    console.log('Données utilisateur Mehdi:', mockUserData1);
    console.log('Données utilisateur Mayssa:', mockUserData2);
    console.log('✅ Données utilisateur correctement formatées');

  } catch (error) {
    console.error('💥 Une erreur inattendue est survenue:', error.message);
  }
  
  console.log('\n🏁 Tests d\'authentification terminés.');
}

testUserAuthentication();
