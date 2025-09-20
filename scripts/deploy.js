
#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Démarrage du processus de déploiement de Karli\'Share...\n');

// Vérifier que les fichiers nécessaires existent
const requiredFiles = [
  'app.json',
  'eas.json',
  'package.json'
];

console.log('📋 Vérification des fichiers requis...');
for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    console.error(`❌ Fichier manquant: ${file}`);
    process.exit(1);
  }
  console.log(`✅ ${file}`);
}

// Vérifier la configuration EAS
try {
  console.log('\n🔧 Vérification de la configuration EAS...');
  execSync('npx eas --version', { stdio: 'inherit' });
} catch (error) {
  console.log('📦 Installation d\'EAS CLI...');
  execSync('npm install -g @expo/eas-cli', { stdio: 'inherit' });
}

// Vérifier l'authentification
try {
  console.log('\n🔐 Vérification de l\'authentification...');
  execSync('npx eas whoami', { stdio: 'inherit' });
} catch (error) {
  console.log('⚠️  Vous devez vous connecter à EAS:');
  console.log('Exécutez: npx eas login');
  process.exit(1);
}

// Lancer le build
const buildType = process.argv[2] || 'preview';
console.log(`\n🏗️  Lancement du build ${buildType}...`);

try {
  if (buildType === 'android') {
    execSync('npx eas build --platform android --profile preview', { stdio: 'inherit' });
  } else if (buildType === 'ios') {
    execSync('npx eas build --platform ios --profile preview', { stdio: 'inherit' });
  } else if (buildType === 'production') {
    execSync('npx eas build --platform all --profile production', { stdio: 'inherit' });
  } else {
    execSync('npx eas build --platform all --profile preview', { stdio: 'inherit' });
  }
  
  console.log('\n✅ Build terminé avec succès!');
  console.log('📱 Vous pouvez maintenant télécharger votre application depuis https://expo.dev');
  
} catch (error) {
  console.error('\n❌ Erreur lors du build:', error.message);
  process.exit(1);
}
