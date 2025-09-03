-- Script de correction des données JSON malformées
-- Corriger le target_groups du quiz "VH" (ID 2)

-- 1. Vérifier l'état actuel
SELECT id, title, target_groups, tags FROM quizzes WHERE id = 2;

-- 2. Corriger le target_groups malformé
UPDATE quizzes 
SET target_groups = '["1ère groupe 1"]'
WHERE id = 2;

-- 3. Vérifier la correction
SELECT id, title, target_groups, tags FROM quizzes WHERE id = 2;

-- 4. Vérifier que tous les JSON sont valides
SELECT id, title, target_groups, tags 
FROM quizzes 
WHERE target_groups IS NOT NULL OR tags IS NOT NULL;
