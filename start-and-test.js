// start-and-test.js
// Script pour démarrer le serveur et tester la fonctionnalité de création automatique de comptes parents

const { spawn } = require('child_process');
const { runTests } = require('./test-parent-student-creation');
const { checkDatabaseData } = require('./check-parent-student-data');

let serverProcess = null;

const startServer = () => {
  return new Promise((resolve, reject) => {
    console.log('🚀 Démarrage du serveur backend...');
    
    serverProcess = spawn('npm', ['run', 'start:dev'], {
      stdio: 'pipe',
      shell: true
    });

    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`[SERVER] ${output.trim()}`);
      
      // Attendre que le serveur soit prêt
      if (output.includes('Application is running on: http://localhost:3001')) {
        console.log('✅ Serveur démarré avec succès!');
        setTimeout(resolve, 2000); // Attendre 2 secondes supplémentaires
      }
    });

    serverProcess.stderr.on('data', (data) => {
      console.error(`[SERVER ERROR] ${data.toString()}`);
    });

    serverProcess.on('error', (error) => {
      console.error('❌ Erreur lors du démarrage du serveur:', error);
      reject(error);
    });

    // Timeout de 30 secondes
    setTimeout(() => {
      reject(new Error('Timeout: Le serveur n\'a pas démarré dans les 30 secondes'));
    }, 30000);
  });
};

const stopServer = () => {
  return new Promise((resolve) => {
    if (serverProcess) {
      console.log('🛑 Arrêt du serveur...');
      serverProcess.kill('SIGTERM');
      
      serverProcess.on('close', (code) => {
        console.log(`✅ Serveur arrêté (code: ${code})`);
        resolve();
      });
      
      // Force kill après 5 secondes
      setTimeout(() => {
        if (serverProcess) {
          serverProcess.kill('SIGKILL');
          resolve();
        }
      }, 5000);
    } else {
      resolve();
    }
  });
};

const runAllTests = async () => {
  try {
    console.log('🧪 Démarrage des tests de création automatique de comptes parents\n');
    
    // 1. Démarrer le serveur
    await startServer();
    
    // 2. Attendre un peu pour s'assurer que tout est prêt
    console.log('⏳ Attente de 3 secondes pour s\'assurer que le serveur est prêt...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 3. Exécuter les tests de création
    console.log('\n📝 Exécution des tests de création...');
    await runTests();
    
    // 4. Attendre un peu pour que les données soient bien enregistrées
    console.log('\n⏳ Attente de 2 secondes avant la vérification des données...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 5. Vérifier les données en base
    console.log('\n🔍 Vérification des données en base...');
    await checkDatabaseData();
    
    console.log('\n🎉 Tous les tests sont terminés avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'exécution des tests:', error);
  } finally {
    // 6. Arrêter le serveur
    await stopServer();
  }
};

// Gestion de l'arrêt propre
process.on('SIGINT', async () => {
  console.log('\n🛑 Arrêt demandé par l\'utilisateur...');
  await stopServer();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Arrêt demandé par le système...');
  await stopServer();
  process.exit(0);
});

// Exécuter les tests si le script est appelé directement
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests, startServer, stopServer };
