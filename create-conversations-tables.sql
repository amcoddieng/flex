-- Création des tables pour le système de messagerie
-- Base de données : job_platform

-- Utiliser la base de données
USE job_platform;

-- Table des conversations
CREATE TABLE IF NOT EXISTS conversation (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    employer_id INT NOT NULL,
    offer_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (student_id) REFERENCES student(id),
    FOREIGN KEY (employer_id) REFERENCES employer(id),
    FOREIGN KEY (offer_id) REFERENCES offer(id)
);

-- Table des messages
CREATE TABLE IF NOT EXISTS message (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conversation_id INT NOT NULL,
    sender_type ENUM('student', 'employer') NOT NULL,
    sender_id INT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (conversation_id) REFERENCES conversation(id)
);

-- Afficher la structure des tables créées
DESCRIBE conversation;
DESCRIBE message;
