-- Migration pour ajouter le champ target_groups à la table quizzes
-- Ce champ permettra de spécifier quels groupes peuvent tenter un quiz

ALTER TABLE quizzes 
ADD COLUMN target_groups TEXT NULL COMMENT 'Groupes cibles qui peuvent tenter le quiz (format JSON array)';

-- Mise à jour des quizzes existants pour qu'ils soient accessibles à tous les groupes
-- (pas de restriction par défaut)
UPDATE quizzes SET target_groups = NULL WHERE target_groups IS NULL;
