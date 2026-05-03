-- Création des tables pour les discussions d'espace collaboratif

-- Table pour les discussions de projet
CREATE TABLE IF NOT EXISTS project_discussions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    author_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type ENUM('general', 'decision', 'milestone', 'issue') DEFAULT 'general',
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    status ENUM('open', 'closed', 'archived') DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES collaborative_projects(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES student_profile(id) ON DELETE CASCADE,
    INDEX idx_project_discussions_project (project_id),
    INDEX idx_project_discussions_author (author_id),
    INDEX idx_project_discussions_status (status),
    INDEX idx_project_discussions_created (created_at)
);

-- Table pour les commentaires de discussion
CREATE TABLE IF NOT EXISTS project_discussion_comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    discussion_id INT NOT NULL,
    author_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (discussion_id) REFERENCES project_discussions(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES student_profile(id) ON DELETE CASCADE,
    INDEX idx_discussion_comments_discussion (discussion_id),
    INDEX idx_discussion_comments_author (author_id),
    INDEX idx_discussion_comments_created (created_at)
);

-- Table pour suivre les membres qui ont lu chaque discussion
CREATE TABLE IF NOT EXISTS project_discussion_reads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    discussion_id INT NOT NULL,
    member_id INT NOT NULL,
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_discussion_member (discussion_id, member_id),
    FOREIGN KEY (discussion_id) REFERENCES project_discussions(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES student_profile(id) ON DELETE CASCADE,
    INDEX idx_discussion_reads_discussion (discussion_id),
    INDEX idx_discussion_reads_member (member_id)
);

-- Insertion de données de test pour le projet 2
INSERT INTO project_discussions (project_id, author_id, title, content, type, priority, status) VALUES
(2, 11, 'Bienvenue dans l''équipe !', 'Félicitations pour avoir rejoint ce projet collaboratif. Présentons-nous et partageons nos objectifs.', 'general', 'medium', 'open'),
(2, 11, 'Réunion de lancement', 'Proposition: Planifions une réunion de lancement la semaine prochaine pour définir les rôles et les prochaines étapes.', 'decision', 'high', 'open'),
(2, 11, 'Objectif: Développement fonctionnel', 'Nous devons développer les fonctionnalités principales de l''application d''ici la fin du mois.', 'milestone', 'high', 'open');

-- Insertion de commentaires de test
INSERT INTO project_discussion_comments (discussion_id, author_id, content) VALUES
(1, 11, 'Bienvenue ! Super motivé pour commencer ce projet.'),
(2, 11, 'Excellente idée ! Je suis disponible pour la réunion.'),
(3, 11, 'Ajoutons un délai pour la préparation.');
