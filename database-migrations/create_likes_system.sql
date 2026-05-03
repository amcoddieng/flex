/* ================================
   LIKES SYSTEM MIGRATION
   ================================ */

-- 1. Créer la table des likes avec contrainte unique
CREATE TABLE likes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    target_type ENUM('topic', 'reply', 'comment_reply') NOT NULL,
    target_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_like (user_id, target_type, target_id),
    INDEX idx_target (target_type, target_id),
    INDEX idx_user (user_id),
    INDEX idx_created_at (created_at)
);

-- 2. Créer la table comment_reply si elle n'existe pas (sans likes_count)
CREATE TABLE IF NOT EXISTS comment_reply (
    id INT PRIMARY KEY AUTO_INCREMENT,
    reply_id INT NOT NULL,
    author_id INT,
    author_name VARCHAR(255),
    author_university VARCHAR(255),
    content TEXT,
    likes INT DEFAULT 0,
    is_helpful BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reply_id) REFERENCES forum_reply(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES student_profile(id) ON DELETE SET NULL
);

-- 3. Créer des triggers pour maintenir les compteurs dans la colonne likes
DELIMITER //

-- Trigger pour les topics
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

-- Trigger pour les replies
CREATE TRIGGER update_reply_likes_after_insert
AFTER INSERT ON likes
FOR EACH ROW
BEGIN
    IF NEW.target_type = 'reply' THEN
        UPDATE forum_reply 
        SET likes = (
            SELECT COUNT(*) 
            FROM likes 
            WHERE target_type = 'reply' AND target_id = NEW.target_id
        )
        WHERE id = NEW.target_id;
    END IF;
END//

CREATE TRIGGER update_reply_likes_after_delete
AFTER DELETE ON likes
FOR EACH ROW
BEGIN
    IF OLD.target_type = 'reply' THEN
        UPDATE forum_reply 
        SET likes = (
            SELECT COUNT(*) 
            FROM likes 
            WHERE target_type = 'reply' AND target_id = OLD.target_id
        )
        WHERE id = OLD.target_id;
    END IF;
END//

-- Trigger pour les comment_replies
CREATE TRIGGER update_comment_reply_likes_after_insert
AFTER INSERT ON likes
FOR EACH ROW
BEGIN
    IF NEW.target_type = 'comment_reply' THEN
        UPDATE comment_reply 
        SET likes = (
            SELECT COUNT(*) 
            FROM likes 
            WHERE target_type = 'comment_reply' AND target_id = NEW.target_id
        )
        WHERE id = NEW.target_id;
    END IF;
END//

CREATE TRIGGER update_comment_reply_likes_after_delete
AFTER DELETE ON likes
FOR EACH ROW
BEGIN
    IF OLD.target_type = 'comment_reply' THEN
        UPDATE comment_reply 
        SET likes = (
            SELECT COUNT(*) 
            FROM likes 
            WHERE target_type = 'comment_reply' AND target_id = OLD.target_id
        )
        WHERE id = OLD.target_id;
    END IF;
END//

DELIMITER ;

-- 6. Vues pour les statistiques
CREATE VIEW like_stats AS
SELECT 
    DATE(l.created_at) as date,
    l.target_type,
    COUNT(*) as total_likes,
    COUNT(DISTINCT l.user_id) as unique_users
FROM likes l
GROUP BY DATE(l.created_at), l.target_type
ORDER BY date DESC, target_type;

-- 4. Index pour les performances
CREATE INDEX idx_forum_topic_likes ON forum_topic(likes DESC);
CREATE INDEX idx_forum_reply_likes ON forum_reply(likes DESC);
CREATE INDEX idx_comment_reply_likes ON comment_reply(likes DESC);
