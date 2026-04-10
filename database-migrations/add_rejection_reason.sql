-- Ajouter un champ pour le motif de rejet dans la table employer_profile
ALTER TABLE employer_profile 
ADD COLUMN rejection_reason TEXT NULL AFTER validation_status;

-- Mettre à jour les profils existants pour s'assurer que le champ est NULL par défaut
UPDATE employer_profile 
SET rejection_reason = NULL 
WHERE rejection_reason IS NULL;
