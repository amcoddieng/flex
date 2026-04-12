-- Ajouter un champ updated_at à la table employer_profile pour suivre les modifications
ALTER TABLE employer_profile 
ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

-- Mettre à jour les enregistrements existants pour que updated_at = created_at
UPDATE employer_profile 
SET updated_at = created_at 
WHERE updated_at IS NULL;
