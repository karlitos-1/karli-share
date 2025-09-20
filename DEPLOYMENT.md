
# Guide de Déploiement - Karli'Share

## Prérequis

1. **Compte Expo/EAS** : Créez un compte sur [expo.dev](https://expo.dev)
2. **EAS CLI** : Installez EAS CLI globalement
   ```bash
   npm install -g @expo/eas-cli
   ```
3. **Authentification** : Connectez-vous à votre compte
   ```bash
   npx eas login
   ```

## Configuration du Projet

### 1. Initialiser EAS
```bash
npx eas init
```
Cette commande va créer un projet EAS et mettre à jour votre `app.json` avec l'ID du projet.

### 2. Configurer les Variables d'Environnement
Copiez `.env.example` vers `.env` et configurez vos variables :
```bash
cp .env.example .env
```

## Types de Déploiement

### 1. Build de Développement (Development Build)
Pour tester sur des appareils physiques avec Expo Go :
```bash
npm run build:preview
```

### 2. Build Android (APK)
Pour créer un APK Android :
```bash
npm run deploy:android
```

### 3. Build iOS
Pour créer une version iOS :
```bash
npm run deploy:ios
```

### 4. Build de Production
Pour les stores (Google Play Store / Apple App Store) :
```bash
npm run deploy:production
```

## Processus de Déploiement Automatisé

Utilisez le script de déploiement automatisé :

```bash
# Build preview pour les deux plateformes
npm run deploy

# Build Android uniquement
npm run deploy:android

# Build iOS uniquement
npm run deploy:ios

# Build de production
npm run deploy:production
```

## Configuration des Stores

### Google Play Store
1. Créez un compte développeur Google Play (25$ unique)
2. Générez une clé de signature :
   ```bash
   npx eas credentials
   ```
3. Configurez les métadonnées dans Google Play Console

### Apple App Store
1. Créez un compte développeur Apple (99$/an)
2. Configurez les certificats et profils de provisioning
3. Utilisez EAS pour gérer les credentials :
   ```bash
   npx eas credentials
   ```

## Vérifications Avant Déploiement

### 1. Tests
```bash
npm run lint
npm test
```

### 2. Vérification des Permissions
- ✅ Caméra (scan QR codes)
- ✅ Stockage (accès aux fichiers)
- ✅ Réseau (transferts)
- ✅ Localisation (Wi-Fi Direct)

### 3. Vérification des Assets
- ✅ Icône de l'app (1024x1024)
- ✅ Splash screen
- ✅ Images adaptatives Android

## Suivi des Builds

1. Visitez [expo.dev](https://expo.dev)
2. Accédez à votre projet
3. Consultez l'onglet "Builds"
4. Téléchargez les builds terminés

## Mise à Jour OTA (Over-The-Air)

Pour les mises à jour rapides sans passer par les stores :

```bash
npx eas update --branch production --message "Correction de bugs"
```

## Dépannage

### Erreurs Communes

1. **Build failed** : Vérifiez les logs dans EAS
2. **Permissions manquantes** : Vérifiez `app.json`
3. **Credentials invalides** : Régénérez avec `npx eas credentials`

### Support
- Documentation EAS : https://docs.expo.dev/eas/
- Forum Expo : https://forums.expo.dev/
- Discord Expo : https://chat.expo.dev/

## Checklist de Déploiement

- [ ] Tests passés
- [ ] Lint sans erreurs
- [ ] Variables d'environnement configurées
- [ ] Permissions correctes dans app.json
- [ ] Assets optimisés
- [ ] Version incrémentée
- [ ] Changelog mis à jour
- [ ] Build EAS réussi
- [ ] Test sur appareil physique
- [ ] Soumission au store (si production)
