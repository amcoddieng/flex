-- SCRIPT DE VÉRIFICATION POST-INSTALLATION
-- Exécutez ce script pour vérifier que tout est correctement installé

-- 1. Vérifier que la table likes existe
SELECT 'Table likes' as Status, 
       CASE WHEN COUNT(*) > 0 THEN '✅ EXISTS' ELSE '❌ MISSING' END as Result
FROM information_schema.tables 
WHERE table_schema = DATABASE() AND table_name = 'likes';

-- 2. Vérifier la structure de la table likes
DESCRIBE likes;

-- 3. Vérifier que les triggers existent
SELECT 'Triggers' as Status, 
       COUNT(*) as Count,
       CASE WHEN COUNT(*) > 0 THEN '✅ ACTIVE' ELSE '❌ MISSING' END as Result
FROM information_schema.triggers 
WHERE trigger_schema = DATABASE() AND trigger_name LIKE '%likes%';

-- 4. Afficher les triggers créés
SHOW TRIGGERS LIKE '%likes%';

-- 5. Vérifier les colonnes likes dans les tables forum
SELECT 'forum_topic.likes column' as Status,
       CASE WHEN COUNT(*) > 0 THEN '✅ EXISTS' ELSE '❌ MISSING' END as Result
FROM information_schema.columns 
WHERE table_schema = DATABASE() 
  AND table_name = 'forum_topic' 
  AND column_name = 'likes';

SELECT 'forum_reply.likes column' as Status,
       CASE WHEN COUNT(*) > 0 THEN '✅ EXISTS' ELSE '❌ MISSING' END as Result
FROM information_schema.columns 
WHERE table_schema = DATABASE() 
  AND table_name = 'forum_reply' 
  AND column_name = 'likes';

-- 6. Vérifier les données existantes
SELECT 'forum_topic records' as Status, COUNT(*) as Count FROM forum_topic;
SELECT 'forum_reply records' as Status, COUNT(*) as Count FROM forum_reply;
SELECT 'likes records' as Status, COUNT(*) as Count FROM likes;

-- 7. Test d'insertion (décommentez pour tester)
/*
-- Insérer un test de like (remplacez 1 par des IDs réels)
INSERT IGNORE INTO likes (user_id, target_type, target_id) VALUES (1, 'topic', 1);

-- Vérifier l'insertion
SELECT * FROM likes WHERE target_type = 'topic' AND target_id = 1;

-- Vérifier que le trigger fonctionne (si activé)
SELECT id, likes FROM forum_topic WHERE id = 1;
*/
