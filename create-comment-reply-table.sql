-- Création de la table comment_reply pour les réponses aux commentaires du forum
-- Cette table permet aux étudiants de répondre aux commentaires (forum_reply)

CREATE TABLE comment_reply (
    id INT PRIMARY KEY AUTO_INCREMENT,
    reply_id INT NOT NULL,                    -- FK vers forum_reply (le commentaire auquel on répond)
    author_id INT NOT NULL,                   -- FK vers student_profile (l'auteur de la réponse)
    author_name VARCHAR(255) NOT NULL,         -- Nom de l'auteur (redondant pour performance)
    author_university VARCHAR(255),             -- Université de l'auteur
    content TEXT NOT NULL,                      -- Contenu de la réponse
    likes INT DEFAULT 0,                       -- Nombre de likes
    is_helpful BOOLEAN DEFAULT FALSE,            -- Si la réponse est marquée comme utile
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- Date de création
    
    -- Contraintes étrangères
    FOREIGN KEY (reply_id) REFERENCES forum_reply(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES student_profile(id) ON DELETE SET NULL
);

-- Index pour optimiser les performances
CREATE INDEX idx_comment_reply_reply_id ON comment_reply(reply_id);
CREATE INDEX idx_comment_reply_author_id ON comment_reply(author_id);
CREATE INDEX idx_comment_reply_created_at ON comment_reply(created_at);

-- Insertion de données de test
INSERT INTO comment_reply (reply_id, author_id, author_name, author_university, content, created_at) VALUES
-- Réponses au premier commentaire du premier topic
(1, 2, 'Marie Dupont', 'Université Paris 1', 'Merci pour cette information ! C''est très utile.', NOW()),
(1, 3, 'Thomas Martin', 'ENS Lyon', 'Je confirme, cette approche fonctionne bien.', NOW()),

-- Réponses au deuxième commentaire du premier topic  
(2, 1, 'Jean Durand', 'Sorbonne', 'Attention, il faut aussi vérifier les dépendances.', NOW()),

-- Réponses au premier commentaire du deuxième topic
(3, 2, 'Marie Dupont', 'Université Paris 1', 'Excellente suggestion ! Je vais essayer.', NOW()),
(3, 4, 'Sophie Bernard', 'Polytechnique', 'Pensez aussi à la sécurité des données.', NOW()),

-- Réponse avec like
(4, 1, 'Jean Durand', 'Sorbonne', 'J''ai une question complémentaire : comment gérer les erreurs ?', NOW()),

-- Réponse marquée comme utile
(5, 3, 'Thomas Martin', 'ENS Lyon', 'Pour la sécurité, utilisez toujours des requêtes préparées.', NOW());

-- Mise à jour des likes pour les données de test
UPDATE comment_reply SET likes = 3 WHERE id = 1;
UPDATE comment_reply SET likes = 1 WHERE id = 2;
UPDATE comment_reply SET likes = 5 WHERE id = 3;
UPDATE comment_reply SET likes = 2 WHERE id = 4;
UPDATE comment_reply SET likes = 4 WHERE id = 5;

UPDATE comment_reply SET is_helpful = TRUE WHERE id IN (3, 5);

-- Affichage de vérification
SELECT 
    cr.id,
    cr.reply_id,
    cr.author_id,
    cr.author_name,
    cr.author_university,
    cr.content,
    cr.likes,
    cr.is_helpful,
    cr.created_at,
    fr.content as reply_content,
    ft.title as topic_title
FROM comment_reply cr
JOIN forum_reply fr ON cr.reply_id = fr.id
JOIN forum_topic ft ON fr.topic_id = ft.id
ORDER BY cr.created_at DESC;
