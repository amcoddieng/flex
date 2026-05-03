-- SCRIPT DE DIAGNOSTIC POUR LE SYSTÈME DE LIKES
-- Exécutez ce script pour identifier les problèmes

-- 1. Vérifier si les tables existent
SHOW TABLES LIKE 'forum_%';
SHOW TABLES LIKE 'likes';

-- 2. Vérifier la structure des tables existantes
DESCRIBE forum_topic;
DESCRIBE forum_reply;
DESCRIBE likes;

-- 3. Vérifier si la table comment_reply existe
SHOW TABLES LIKE 'comment_reply';

-- 4. Vérifier les triggers existants
SHOW TRIGGERS LIKE '%likes%';

-- 5. Vérifier les données existantes
SELECT COUNT(*) as total_topics FROM forum_topic;
SELECT COUNT(*) as total_replies FROM forum_reply;
SELECT COUNT(*) as total_likes FROM likes;

-- 6. Vérifier les valeurs actuelles des likes
SELECT 
    id, 
    title, 
    likes as current_likes,
    created_at
FROM forum_topic 
LIMIT 5;

SELECT 
    id, 
    content, 
    likes as current_likes,
    created_at
FROM forum_reply 
LIMIT 5;

-- 7. Nettoyer les triggers problématiques s'ils existent
DROP TRIGGER IF EXISTS update_topic_likes_after_insert;
DROP TRIGGER IF EXISTS update_topic_likes_after_delete;
DROP TRIGGER IF EXISTS update_reply_likes_after_insert;
DROP TRIGGER IF EXISTS update_reply_likes_after_delete;
DROP TRIGGER IF EXISTS update_comment_reply_likes_after_insert;
DROP TRIGGER IF EXISTS update_comment_reply_likes_after_delete;

-- 8. Supprimer la table likes si elle existe pour la recréer proprement
DROP TABLE IF EXISTS likes;

-- 9. Version simplifiée de la création de la table likes
CREATE TABLE likes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    target_type ENUM('topic', 'reply', 'comment_reply') NOT NULL,
    target_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_like (user_id, target_type, target_id),
    INDEX idx_target (target_type, target_id),
    INDEX idx_user (user_id)
);

-- 10. Test simple d'insertion
-- D'abord, vérifions qu'on a des utilisateurs et des topics
SELECT id, name, role FROM user LIMIT 3;
SELECT id, title FROM forum_topic LIMIT 3;

-- 11. Test d'insertion manuelle
-- Remplacez 1 par un ID d'utilisateur réel et 1 par un ID de topic réel
-- INSERT INTO likes (user_id, target_type, target_id) VALUES (1, 'topic', 1);

-- 12. Vérifier si l'insertion a fonctionné
SELECT * FROM likes;

-- 13. Créer un trigger simple pour les topics
DELIMITER //

CREATE TRIGGER update_topic_likes_after_insert
AFTER INSERT ON likes
FOR EACH ROW
BEGIN
    IF NEW.target_type = 'topic' THEN
        UPDATE forum_topic 
        SET likes = (
            SELECT COUNT(*) 
            FROM likes 
            WHERE target_type = 'topic' AND target_id = NEW.target_id
        )
        WHERE id = NEW.target_id;
    END IF;
END//

CREATE TRIGGER update_topic_likes_after_delete
AFTER DELETE ON likes
FOR EACH ROW
BEGIN
    IF OLD.target_type = 'topic' THEN
        UPDATE forum_topic 
        SET likes = (
            SELECT COUNT(*) 
            FROM likes 
            WHERE target_type = 'topic' AND target_id = OLD.target_id
        )
        WHERE id = OLD.target_id;
    END IF;
END//

DELIMITER ;

-- 14. Vérifier que les triggers sont créés
SHOW TRIGGERS;

-- 15. Test final
-- Insérez un like et vérifiez que le compteur se met à jour
-- INSERT INTO likes (user_id, target_type, target_id) VALUES (1, 'topic', 1);
-- SELECT id, likes FROM forum_topic WHERE id = 1;
