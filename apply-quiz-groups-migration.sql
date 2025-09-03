-- Script de migration pour ajouter la fonctionnalité de groupes cibles aux quizzes
-- À exécuter sur votre base de données MySQL

-- 1. Ajouter le champ target_groups à la table quizzes
ALTER TABLE quizzes 
ADD COLUMN target_groups TEXT NULL COMMENT 'Groupes cibles qui peuvent tenter le quiz (format JSON array)';

-- 2. Vérifier que le champ a été ajouté
DESCRIBE quizzes;

-- 3. Mettre à jour les quizzes existants (optionnel - pour la cohérence)
-- Les quizzes existants seront accessibles à tous les groupes par défaut
UPDATE quizzes SET target_groups = NULL WHERE target_groups IS NULL;

-- 4. Vérifier la structure finale
SELECT 
    id,
    title,
    subject,
    level,
    target_groups,
    created_at
FROM quizzes 
LIMIT 5;

-- 5. Créer un index pour améliorer les performances (optionnel)
-- CREATE INDEX idx_quizzes_target_groups ON quizzes((CAST(target_groups AS CHAR(1000))));

-- 6. Vérifier que la migration s'est bien passée
SELECT 
    COUNT(*) as total_quizzes,
    COUNT(CASE WHEN target_groups IS NOT NULL THEN 1 END) as quizzes_with_groups,
    COUNT(CASE WHEN target_groups IS NULL THEN 1 END) as quizzes_without_groups
FROM quizzes;
