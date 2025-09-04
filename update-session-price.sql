-- Script pour mettre à jour le prix des séances de 50€ à 40dt
-- Ce script met à jour tous les enregistrements existants dans la table paiement

-- 1. Mettre à jour le prix par défaut pour les nouveaux enregistrements
ALTER TABLE paiement MODIFY COLUMN prix_seance DECIMAL(10,2) DEFAULT 40.00 COMMENT 'Prix par séance (configurable)';

-- 2. Mettre à jour tous les enregistrements existants qui ont le prix de 50€
UPDATE paiement 
SET 
  prix_seance = 40.00,
  montant_total = (seances_total * 40.00),
  montant_restant = ((seances_total * 40.00) - montant_paye),
  date_modification = CURRENT_TIMESTAMP
WHERE prix_seance = 50.00;

-- 3. Vérifier les résultats
SELECT 
  COUNT(*) as total_records,
  COUNT(CASE WHEN prix_seance = 40.00 THEN 1 END) as records_with_40dt,
  COUNT(CASE WHEN prix_seance = 50.00 THEN 1 END) as records_with_50euros,
  AVG(prix_seance) as average_price
FROM paiement;

-- 4. Afficher quelques exemples d'enregistrements mis à jour
SELECT 
  id,
  student_id,
  seances_total,
  prix_seance,
  montant_total,
  montant_paye,
  montant_restant,
  statut
FROM paiement 
WHERE prix_seance = 40.00
LIMIT 5;
