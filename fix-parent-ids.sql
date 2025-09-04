-- Script pour corriger les parent_id dans la table paiement
-- Ce script met à jour les parent_id manquants en utilisant les relations parent_student

-- 1. Vérifier l'état actuel
SELECT 
  'État actuel' as description,
  COUNT(*) as total_paiements,
  COUNT(parent_id) as paiements_avec_parent_id,
  COUNT(*) - COUNT(parent_id) as paiements_sans_parent_id
FROM paiement;

-- 2. Afficher les paiements sans parent_id
SELECT 
  p.id as paiement_id,
  p.student_id,
  p.parent_id,
  u.first_name as student_first_name,
  u.last_name as student_last_name
FROM paiement p
JOIN students s ON p.student_id = s.id
JOIN users u ON s.user_id = u.id
WHERE p.parent_id IS NULL
LIMIT 10;

-- 3. Afficher les relations parent-student disponibles
SELECT 
  ps.student_id,
  ps.parent_id,
  s_user.first_name as student_first_name,
  s_user.last_name as student_last_name,
  p_user.first_name as parent_first_name,
  p_user.last_name as parent_last_name
FROM parent_student ps
JOIN students s ON ps.student_id = s.id
JOIN users s_user ON s.user_id = s_user.id
JOIN parents p ON ps.parent_id = p.id
JOIN users p_user ON p.user_id = p_user.id
LIMIT 10;

-- 4. Mettre à jour les parent_id manquants
UPDATE paiement p
JOIN parent_student ps ON p.student_id = ps.student_id
SET p.parent_id = ps.parent_id
WHERE p.parent_id IS NULL;

-- 5. Vérifier le résultat après mise à jour
SELECT 
  'Après mise à jour' as description,
  COUNT(*) as total_paiements,
  COUNT(parent_id) as paiements_avec_parent_id,
  COUNT(*) - COUNT(parent_id) as paiements_sans_parent_id
FROM paiement;

-- 6. Afficher quelques exemples de paiements mis à jour
SELECT 
  p.id as paiement_id,
  p.student_id,
  p.parent_id,
  u.first_name as student_first_name,
  u.last_name as student_last_name,
  parent_user.first_name as parent_first_name,
  parent_user.last_name as parent_last_name
FROM paiement p
JOIN students s ON p.student_id = s.id
JOIN users u ON s.user_id = u.id
LEFT JOIN parents par ON p.parent_id = par.id
LEFT JOIN users parent_user ON par.user_id = parent_user.id
WHERE p.parent_id IS NOT NULL
LIMIT 5;
