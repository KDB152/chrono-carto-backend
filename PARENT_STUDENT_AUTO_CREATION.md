# Création Automatique de Comptes Parents

## Vue d'ensemble

Cette fonctionnalité permet la création automatique de comptes parents lors de l'inscription d'un étudiant qui fournit les détails de ses parents.

## Fonctionnement

### 1. Inscription d'un étudiant avec détails des parents

Lorsqu'un étudiant s'inscrit et fournit les informations de ses parents (nom, prénom, email), le système :

1. **Crée le compte étudiant** normalement
2. **Vérifie si un parent avec cet email existe déjà**
3. **Si le parent n'existe pas** :
   - Crée un nouveau compte utilisateur avec le rôle `parent`
   - Le compte est créé avec `is_approved: false` et `is_active: false`
   - Génère un mot de passe temporaire aléatoire
   - Crée l'entité parent associée
   - Crée la relation parent-student dans la table `parent_student`
4. **Si le parent existe déjà** :
   - Crée seulement la relation parent-student

### 2. Inscription d'un étudiant sans détails des parents

Si l'étudiant ne fournit pas les détails de ses parents, seul le compte étudiant est créé.

### 3. Inscription d'un parent

L'inscription directe d'un parent fonctionne normalement, sans création automatique d'étudiants.

## Structure de la base de données

### Nouvelle table : `parent_student`

```sql
CREATE TABLE parent_student (
  id INT PRIMARY KEY AUTO_INCREMENT,
  parent_id INT NOT NULL,
  student_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);
```

### Relations

- **One-to-Many** : Un parent peut avoir plusieurs étudiants
- **Many-to-One** : Un étudiant peut avoir plusieurs parents
- **Many-to-Many** : Relation gérée via la table `parent_student`

## Champs requis pour la création automatique

Pour qu'un compte parent soit créé automatiquement, l'étudiant doit fournir :

- `parentFirstName` (obligatoire)
- `parentLastName` (obligatoire)  
- `parentEmail` (obligatoire)
- `parentPhone` (optionnel)

## Sécurité et validation

### Comptes parents créés automatiquement

- **Non vérifiés** : `email_verified: false`
- **Non approuvés** : `is_approved: false`
- **Non actifs** : `is_active: false`
- **Mot de passe temporaire** : Généré aléatoirement

### Processus d'activation

Le parent devra :
1. Vérifier son email (lien envoyé automatiquement)
2. Être approuvé par un administrateur
3. Réinitialiser son mot de passe

## API Endpoints

### Inscription étudiant avec parents

```http
POST /auth/register
Content-Type: application/json

{
  "firstName": "Jean",
  "lastName": "Dupont",
  "email": "jean.dupont@example.com",
  "password": "password123",
  "phone": "0123456789",
  "userType": "student",
  "studentBirthDate": "2005-06-15",
  "studentClass": "3ème",
  "parentFirstName": "Marie",
  "parentLastName": "Dupont",
  "parentEmail": "marie.dupont@example.com",
  "parentPhone": "0987654321"
}
```

### Réponse

```json
{
  "message": "Inscription réussie. Un lien de vérification a été envoyé à votre adresse email.",
  "userId": 123
}
```

## Logs et monitoring

Le système enregistre les événements suivants :

- Création automatique de comptes parents
- Erreurs lors de la création automatique
- Relations parent-student créées

## Tests

### Scripts de test disponibles

1. **test-parent-student-creation.js** : Teste l'inscription avec et sans détails parents
2. **check-parent-student-data.js** : Vérifie les données créées en base

### Exécution des tests

```bash
# Test de création
node test-parent-student-creation.js

# Vérification des données
node check-parent-student-data.js
```

## Gestion des erreurs

### Erreurs non bloquantes

- Échec de création du compte parent automatique
- Échec de création de la relation parent-student
- Échec d'envoi d'email de vérification

Ces erreurs n'empêchent pas l'inscription de l'étudiant.

### Logs d'erreur

```javascript
console.error('Erreur lors de la création automatique du compte parent:', error);
console.error('Erreur lors de l\'envoi du lien de vérification:', error);
```

## Considérations futures

### Améliorations possibles

1. **Notification automatique** : Envoyer un email au parent pour l'informer de la création de son compte
2. **Interface d'administration** : Permettre aux admins de gérer les comptes parents créés automatiquement
3. **Validation renforcée** : Vérifier la validité des emails parents avant création
4. **Gestion des doublons** : Détecter et gérer les parents avec des emails similaires

### Sécurité

- Les mots de passe temporaires sont générés de manière sécurisée
- Les comptes créés automatiquement sont désactivés par défaut
- Validation des emails avant création de comptes

## Support

Pour toute question ou problème lié à cette fonctionnalité, consultez les logs du serveur ou contactez l'équipe de développement.
