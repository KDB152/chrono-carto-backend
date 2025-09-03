-- Script de correction pour le champ target_groups
-- À exécuter sur votre base de données MySQL

-- 1. Vérifier si le champ existe déjà
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'quizzes' 
AND COLUMN_NAME = 'target_groups';

-- 2. Si le champ n'existe pas, l'ajouter
-- Décommentez la ligne suivante si nécessaire :
-- ALTER TABLE quizzes ADD COLUMN target_groups JSON NULL COMMENT 'Groupes cibles qui peuvent tenter le quiz';

-- 3. Si le champ existe mais avec le mauvais type, le modifier
-- Décommentez la ligne suivante si nécessaire :
-- ALTER TABLE quizzes MODIFY COLUMN target_groups JSON NULL COMMENT 'Groupes cibles qui peuvent tenter le quiz';

-- 4. Vérifier la structure finale
DESCRIBE quizzes;

-- 5. Vérifier les données existantes
SELECT 
    id,
    title,
    target_groups,
    JSON_TYPE(target_groups) as type_json
FROM quizzes 
ORDER BY id DESC 
LIMIT 5;
