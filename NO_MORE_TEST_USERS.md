# Suppression de la création automatique d'utilisateurs de test

## Changements effectués

### 1. Suppression de la fonction `createTestData`
- **Fichier modifié**: `src/modules/admin/admin.service.ts`
- **Action**: Suppression complète de la fonction `createTestData()` qui créait automatiquement des étudiants et parents de test
- **Impact**: Plus aucun utilisateur de test ne sera créé automatiquement

### 2. Modification des méthodes `listStudents` et `listParents`
- **Fichier modifié**: `src/modules/admin/admin.service.ts`
- **Action**: Suppression des appels à `createTestData()` dans ces méthodes
- **Impact**: Les listes d'étudiants et parents ne déclencheront plus la création automatique d'utilisateurs de test

### 3. Ajout d'une méthode de nettoyage
- **Fichier modifié**: `src/modules/admin/admin.service.ts`
- **Action**: Ajout de la méthode `cleanTestUsers()` pour supprimer les utilisateurs de test existants
- **Impact**: Possibilité de nettoyer la base de données des utilisateurs de test existants

### 4. Ajout d'un endpoint de nettoyage
- **Fichier modifié**: `src/modules/admin/admin.controller.ts`
- **Action**: Ajout de l'endpoint `DELETE /admin/clean-test-users`
- **Impact**: Les administrateurs peuvent nettoyer les utilisateurs de test via l'API

### 5. Script de nettoyage autonome
- **Fichier créé**: `clean-test-users.js`
- **Action**: Script Node.js pour nettoyer directement la base de données
- **Impact**: Nettoyage rapide sans démarrer l'application

## Utilisateurs de test supprimés

Les utilisateurs de test suivants ne seront plus créés automatiquement :

### Étudiants de test :
- lucas.dubois@student.fr
- emma.martin@student.fr
- thomas.bernard@student.fr
- sophie.leroy@student.fr

### Parents de test :
- marie.dubois@parent.fr
- jean.martin@parent.fr
- pierre.bernard@parent.fr

## Comment nettoyer les utilisateurs de test existants

### Option 1 : Via l'API (recommandé)
```bash
# Démarrer l'application
npm run start:dev

# Appeler l'endpoint de nettoyage (nécessite d'être connecté en tant qu'admin)
curl -X DELETE http://localhost:3000/admin/clean-test-users
```

### Option 2 : Via le script autonome
```bash
# Configurer les variables d'environnement si nécessaire
export DB_HOST=localhost
export DB_USER=root
export DB_PASSWORD=votre_mot_de_passe
export DB_NAME=chrono_carto

# Exécuter le script de nettoyage
npm run clean-test-users
```

### Option 3 : Manuellement via SQL
```sql
-- Supprimer les profils étudiants de test
DELETE FROM students WHERE user_id IN (
  SELECT id FROM users WHERE email IN (
    'lucas.dubois@student.fr',
    'emma.martin@student.fr',
    'thomas.bernard@student.fr',
    'sophie.leroy@student.fr'
  )
);

-- Supprimer les profils parents de test
DELETE FROM parents WHERE user_id IN (
  SELECT id FROM users WHERE email IN (
    'marie.dubois@parent.fr',
    'jean.martin@parent.fr',
    'pierre.bernard@parent.fr'
  )
);

-- Supprimer les utilisateurs de test
DELETE FROM users WHERE email IN (
  'lucas.dubois@student.fr',
  'emma.martin@student.fr',
  'thomas.bernard@student.fr',
  'sophie.leroy@student.fr',
  'marie.dubois@parent.fr',
  'jean.martin@parent.fr',
  'pierre.bernard@parent.fr'
);
```

## Garanties

✅ **Aucun utilisateur de test ne sera plus créé automatiquement**

✅ **Les utilisateurs existants créés manuellement ne seront pas affectés**

✅ **La fonctionnalité de création manuelle d'utilisateurs par les administrateurs reste intacte**

✅ **Les inscriptions normales via le formulaire d'inscription continuent de fonctionner**

## Notes importantes

- Les utilisateurs de test existants dans la base de données ne seront pas automatiquement supprimés
- Utilisez l'une des méthodes de nettoyage ci-dessus pour les supprimer si nécessaire
- La méthode `createMissingProfiles()` reste active pour créer des profils pour les utilisateurs existants qui n'en ont pas
