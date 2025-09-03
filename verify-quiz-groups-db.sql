-- Script de vérification et correction pour la fonctionnalité des groupes cibles
-- À exécuter sur votre base de données MySQL

-- 1. Vérifier la structure actuelle de la table quizzes
DESCRIBE quizzes;

-- 2. Vérifier si le champ target_groups existe
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'quizzes' 
AND COLUMN_NAME = 'target_groups';

-- 3. Si le champ n'existe pas, l'ajouter
-- Décommentez la ligne suivante si le champ n'existe pas :
-- ALTER TABLE quizzes ADD COLUMN target_groups TEXT NULL COMMENT 'Groupes cibles qui peuvent tenter le quiz (format JSON array)';

-- 4. Vérifier les données existantes
SELECT 
    id,
    title,
    subject,
    level,
    target_groups,
    created_at,
    updated_at
FROM quizzes 
ORDER BY id DESC 
LIMIT 10;

-- 5. Vérifier s'il y a des quizzes avec des groupes cibles
SELECT 
    COUNT(*) as total_quizzes,
    COUNT(CASE WHEN target_groups IS NOT NULL THEN 1 END) as quizzes_with_groups,
    COUNT(CASE WHEN target_groups IS NULL THEN 1 END) as quizzes_without_groups,
    COUNT(CASE WHEN target_groups = '' THEN 1 END) as quizzes_with_empty_groups
FROM quizzes;

-- 6. Afficher les quizzes qui ont des groupes cibles
SELECT 
    id,
    title,
    target_groups,
    JSON_LENGTH(target_groups) as nombre_groupes
FROM quizzes 
WHERE target_groups IS NOT NULL 
AND target_groups != '[]'
ORDER BY id DESC;

-- 7. Vérifier la structure JSON des groupes cibles
SELECT 
    id,
    title,
    target_groups,
    JSON_VALID(target_groups) as json_valide,
    JSON_TYPE(target_groups) as type_json
FROM quizzes 
WHERE target_groups IS NOT NULL 
AND target_groups != '';

-- 8. Nettoyer les données corrompues (optionnel)
-- UPDATE quizzes SET target_groups = NULL WHERE target_groups = '';
-- UPDATE quizzes SET target_groups = NULL WHERE target_groups = '[]';

-- 9. Vérifier les index (optionnel)
SHOW INDEX FROM quizzes WHERE Key_name LIKE '%target_groups%';

-- 10. Statistiques finales
SELECT 
    'Statistiques finales' as info,
    COUNT(*) as total_quizzes,
    COUNT(CASE WHEN target_groups IS NOT NULL AND target_groups != '' AND target_groups != '[]' THEN 1 END) as quizzes_with_valid_groups,
    COUNT(CASE WHEN target_groups IS NULL OR target_groups = '' OR target_groups = '[]' THEN 1 END) as quizzes_without_groups
FROM quizzes;
