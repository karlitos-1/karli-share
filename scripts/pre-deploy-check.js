
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification pré-déploiement de Karli\'Share...\n');

let hasErrors = false;

// Vérifier les fichiers essentiels
const requiredFiles = [
  'app.json',
  'eas.json',
  'package.json',
  'app/integrations/supabase/client.ts',
  'assets/images/ea7ba2fc-1cf2-4330-a169-2ab9480db233.png'
];

console.log('📁 Vérification des fichiers essentiels:');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MANQUANT`);
    hasErrors = true;
  }
});

// Vérifier app.json
console.log('\n📱 Vérification de app.json:');
try {
  const appJson = JSON.parse(fs.readFileSync('app.json', 'utf8'));
  
  // Vérifications essentielles
  const checks = [
    { key: 'expo.name', value: appJson.expo?.name, required: true },
    { key: 'expo.slug', value: appJson.expo?.slug, required: true },
    { key: 'expo.version', value: appJson.expo?.version, required: true },
    { key: 'expo.android.package', value: appJson.expo?.android?.package, required: true },
    { key: 'expo.ios.bundleIdentifier', value: appJson.expo?.ios?.bundleIdentifier, required: true },
    { key: 'expo.icon', value: appJson.expo?.icon, required: true }
  ];
  
  checks.forEach(check => {
    if (check.required && !check.value) {
      console.log(`❌ ${check.key} - MANQUANT`);
      hasErrors = true;
    } else if (check.value) {
      console.log(`✅ ${check.key}: ${check.value}`);
    }
  });
  
} catch (error) {
  console.log('❌ Erreur lors de la lecture de app.json:', error.message);
  hasErrors = true;
}

// Vérifier eas.json
console.log('\n🏗️  Vérification de eas.json:');
try {
  const easJson = JSON.parse(fs.readFileSync('eas.json', 'utf8'));
  
  if (easJson.build) {
    console.log('✅ Configuration de build présente');
    
    const profiles = ['development', 'preview', 'production'];
    profiles.forEach(profile => {
      if (easJson.build[profile]) {
        console.log(`✅ Profil ${profile} configuré`);
      } else {
        console.log(`⚠️  Profil ${profile} manquant`);
      }
    });
  } else {
    console.log('❌ Configuration de build manquante');
    hasErrors = true;
  }
  
} catch (error) {
  console.log('❌ Erreur lors de la lecture de eas.json:', error.message);
  hasErrors = true;
}

// Vérifier les dépendances
console.log('\n📦 Vérification des dépendances:');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  const criticalDeps = [
    'expo',
    'react',
    'react-native',
    '@supabase/supabase-js',
    'expo-router'
  ];
  
  criticalDeps.forEach(dep => {
    if (packageJson.dependencies?.[dep]) {
      console.log(`✅ ${dep}: ${packageJson.dependencies[dep]}`);
    } else {
      console.log(`❌ ${dep} - MANQUANT`);
      hasErrors = true;
    }
  });
  
} catch (error) {
  console.log('❌ Erreur lors de la lecture de package.json:', error.message);
  hasErrors = true;
}

// Vérifier la configuration Supabase
console.log('\n🗄️  Vérification de la configuration Supabase:');
try {
  const supabaseClient = fs.readFileSync('app/integrations/supabase/client.ts', 'utf8');
  
  if (supabaseClient.includes('hzumemhwbvrkdkbdrfyk.supabase.co')) {
    console.log('✅ URL Supabase configurée');
  } else {
    console.log('❌ URL Supabase manquante');
    hasErrors = true;
  }
  
  if (supabaseClient.includes('createClient')) {
    console.log('✅ Client Supabase initialisé');
  } else {
    console.log('❌ Client Supabase non initialisé');
    hasErrors = true;
  }
  
} catch (error) {
  console.log('❌ Erreur lors de la lecture du client Supabase:', error.message);
  hasErrors = true;
}

// Résumé
console.log('\n📊 Résumé de la vérification:');
if (hasErrors) {
  console.log('❌ Des erreurs ont été détectées. Veuillez les corriger avant le déploiement.');
  process.exit(1);
} else {
  console.log('✅ Toutes les vérifications sont passées avec succès !');
  console.log('🚀 L\'application est prête pour le déploiement.');
  
  console.log('\n📋 Prochaines étapes:');
  console.log('1. Exécutez: npm run deploy (pour un build preview)');
  console.log('2. Ou: npm run deploy:production (pour un build de production)');
  console.log('3. Suivez le build sur https://expo.dev');
}
