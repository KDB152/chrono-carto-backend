# Gestion des Groupes Cibles pour les Quizzes

## Vue d'ensemble

Cette fonctionnalité permet aux administrateurs de spécifier quels groupes d'étudiants peuvent tenter un quiz spécifique. Par exemple, un quiz peut être créé uniquement pour "Terminale groupe 1" et seuls les étudiants de ce groupe pourront y accéder.

## Fonctionnalités

### 1. Sélection de Groupes lors de la Création/Édition
- Les administrateurs peuvent sélectionner un ou plusieurs groupes cibles lors de la création d'un quiz
- Les groupes disponibles sont :
  - Terminale groupe 1
  - Terminale groupe 2
  - Terminale groupe 3
  - Terminale groupe 4
  - 1ère groupe 1
  - 1ère groupe 2
  - 1ère groupe 3

### 2. Restriction d'Accès
- Si des groupes cibles sont spécifiés, seuls les étudiants de ces groupes peuvent tenter le quiz
- Si aucun groupe n'est spécifié, tous les étudiants peuvent tenter le quiz (comportement par défaut)

### 3. Vérification Automatique
- Le système vérifie automatiquement l'appartenance au groupe avant de permettre une tentative
- Les étudiants non autorisés reçoivent un message d'erreur explicite

## Implémentation Technique

### Backend

#### Entité Quiz
```typescript
@Column({ type: 'simple-array', nullable: true })
target_groups?: string[]; // ex: ['Terminale groupe 1', 'Terminale groupe 2']
```

#### DTO de Création
```typescript
@IsOptional()
@IsArray()
@IsString({ each: true })
target_groups?: string[];
```

#### Service
- `canStudentTakeQuiz(quizId: number, studentClassLevel: string): Promise<boolean>`
- Vérification automatique dans `submitAttempt()`

#### Endpoint API
```
GET /quizzes/:id/can-take/:studentClassLevel
```

### Frontend

#### Interface Quiz
```typescript
interface Quiz {
  // ... autres propriétés
  targetGroups?: string[]; // Groupes cibles qui peuvent tenter le quiz
}
```

#### Composants
- `CreateQuizModal` : Sélection de groupes lors de la création
- `EditQuizModal` : Modification des groupes cibles
- Affichage des groupes cibles dans la liste des quizzes

## Utilisation

### Pour les Administrateurs

1. **Créer un Quiz avec Groupes Cibles**
   - Créez un nouveau quiz
   - Sélectionnez les groupes cibles dans la section "Groupes cibles"
   - Sauvegardez le quiz

2. **Modifier les Groupes Cibles**
   - Éditez un quiz existant
   - Modifiez la sélection des groupes
   - Sauvegardez les modifications

3. **Visualiser les Groupes Cibles**
   - Les groupes cibles sont affichés dans chaque carte de quiz
   - Format : badges verts avec le nom du groupe

### Pour les Étudiants

- Les étudiants voient uniquement les quizzes auxquels ils ont accès
- Les tentatives non autorisées sont bloquées avec un message d'erreur explicite

## Migration de Base de Données

### Ajout du Champ
```sql
ALTER TABLE quizzes 
ADD COLUMN target_groups TEXT NULL COMMENT 'Groupes cibles qui peuvent tenter le quiz (format JSON array)';
```

### Mise à Jour des Données Existantes
```sql
-- Les quizzes existants sont accessibles à tous les groupes par défaut
UPDATE quizzes SET target_groups = NULL WHERE target_groups IS NULL;
```

## Sécurité

- Vérification côté serveur obligatoire
- Les étudiants ne peuvent pas contourner les restrictions
- Logs des tentatives d'accès non autorisées

## Évolutions Futures

- Gestion des permissions par rôle
- Historique des modifications de groupes cibles
- Notifications automatiques aux groupes cibles
- Statistiques par groupe cible
