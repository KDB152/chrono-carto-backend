const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/app.module');
const { SettingsService } = require('./dist/modules/settings/settings.service');

async function initializeSettings() {
  console.log('🚀 Initialisation des paramètres système...');
  
  try {
    const app = await NestFactory.createApplicationContext(AppModule);
    const settingsService = app.get(SettingsService);
    
    // Initialize default system settings
    await settingsService.initializeDefaultSettings();
    
    console.log('✅ Paramètres système initialisés avec succès');
    
    // Display current settings
    const allSettings = await settingsService.getAllSystemSettings();
    console.log('\n📋 Paramètres système actuels:');
    allSettings.forEach(setting => {
      console.log(`  ${setting.key}: ${setting.value} (${setting.category})`);
    });
    
    await app.close();
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    process.exit(1);
  }
}

initializeSettings();
