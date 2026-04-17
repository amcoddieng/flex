-- Création de la table conversations
CREATE TABLE IF NOT EXISTS conversations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    participant_id INT NOT NULL,
    participant_type ENUM('STUDENT', 'EMPLOYER') NOT NULL,
    last_message TEXT,
    last_message_at DATETIME,
    unread_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES student_profile(id) ON DELETE CASCADE,
    FOREIGN KEY (participant_id) REFERENCES student_profile(id) ON DELETE CASCADE,
    FOREIGN KEY (participant_id) REFERENCES employer_profile(id) ON DELETE CASCADE
);

-- Création de la table messages
CREATE TABLE IF NOT EXISTS messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    conversation_id INT NOT NULL,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    content TEXT NOT NULL,
    sender_type ENUM('STUDENT', 'EMPLOYER') NOT NULL,
    receiver_type ENUM('STUDENT', 'EMPLOYER') NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES student_profile(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES employer_profile(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES student_profile(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES employer_profile(id) ON DELETE CASCADE
);

-- Index pour optimiser les performances
CREATE INDEX idx_conversations_student_id ON conversations(student_id);
CREATE INDEX idx_conversations_participant ON conversations(participant_id, participant_type);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_sender ON messages(sender_id, sender_type);
