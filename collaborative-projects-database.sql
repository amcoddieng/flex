-- ========================================
-- SYSTÈME DE PROJETS COLLABORATIFS
-- ========================================

-- 1. Table des projets collaboratifs
CREATE TABLE collaborative_projects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    creator_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category ENUM('business', 'social', 'event', 'academic', 'other') NOT NULL,
    objective TEXT,
    location VARCHAR(255),
    duration VARCHAR(100), -- ex: "3 mois", "6 semaines"
    max_participants INT NOT NULL DEFAULT 5,
    current_participants INT DEFAULT 0,
    profiles_sought TEXT, -- ex: "communication, marketing, design"
    requirements TEXT,
    status ENUM('open', 'in_progress', 'completed', 'cancelled') DEFAULT 'open',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (creator_id) REFERENCES student_profile(id) ON DELETE CASCADE,
    INDEX idx_creator (creator_id),
    INDEX idx_category (category),
    INDEX idx_status (status),
    INDEX idx_location (location),
    INDEX idx_created_at (created_at DESC)
);

-- 2. Table des candidatures aux projets
CREATE TABLE project_applications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    applicant_id INT NOT NULL,
    message TEXT,
    skills TEXT, -- ex: "communication, design, gestion"
    availability TEXT,
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    reviewed_at DATETIME NULL,
    
    FOREIGN KEY (project_id) REFERENCES collaborative_projects(id) ON DELETE CASCADE,
    FOREIGN KEY (applicant_id) REFERENCES student_profile(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_application (project_id, applicant_id),
    INDEX idx_project (project_id),
    INDEX idx_applicant (applicant_id),
    INDEX idx_status (status)
);

-- 3. Table des membres du projet (candidats acceptés)
CREATE TABLE project_members (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    member_id INT NOT NULL,
    role VARCHAR(100) DEFAULT 'member', -- ex: "leader", "communication", "design"
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (project_id) REFERENCES collaborative_projects(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES student_profile(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_member (project_id, member_id),
    INDEX idx_project (project_id),
    INDEX idx_member (member_id)
);

-- 4. Table des messages du projet (chat interne)
CREATE TABLE project_messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    sender_id INT NOT NULL,
    content TEXT NOT NULL,
    message_type ENUM('text', 'file', 'task') DEFAULT 'text',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (project_id) REFERENCES collaborative_projects(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES student_profile(id) ON DELETE CASCADE,
    
    INDEX idx_project (project_id),
    INDEX idx_sender (sender_id),
    INDEX idx_created_at (created_at DESC)
);

-- 5. Table des tâches du projet
CREATE TABLE project_tasks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assigned_to INT, -- member_id
    status ENUM('todo', 'in_progress', 'completed') DEFAULT 'todo',
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    due_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (project_id) REFERENCES collaborative_projects(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES student_profile(id) ON DELETE SET NULL,
    
    INDEX idx_project (project_id),
    INDEX idx_assigned (assigned_to),
    INDEX idx_status (status),
    INDEX idx_priority (priority)
);

-- 6. Table des feedbacks/réputations
CREATE TABLE project_feedbacks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    reviewer_id INT NOT NULL,
    reviewed_id INT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (project_id) REFERENCES collaborative_projects(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES student_profile(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_id) REFERENCES student_profile(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_feedback (project_id, reviewer_id, reviewed_id),
    INDEX idx_reviewed (reviewed_id),
    INDEX idx_rating (rating)
);

-- 7. Table des compétences des étudiants (pour les recommandations)
CREATE TABLE student_skills (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    skill_name VARCHAR(100) NOT NULL,
    level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'intermediate',
    verified BOOLEAN DEFAULT FALSE,
    
    FOREIGN KEY (student_id) REFERENCES student_profile(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_skill (student_id, skill_name),
    INDEX idx_skill (skill_name),
    INDEX idx_level (level)
);

-- 8. Vues pour les statistiques et recommandations
CREATE VIEW project_stats AS
SELECT 
    p.id,
    p.title,
    p.category,
    p.status,
    COUNT(DISTINCT pa.id) as total_applications,
    COUNT(DISTINCT pm.id) as current_members,
    AVG(pf.rating) as avg_rating,
    p.created_at
FROM collaborative_projects p
LEFT JOIN project_applications pa ON p.id = pa.project_id
LEFT JOIN project_members pm ON p.id = pm.project_id
LEFT JOIN project_feedbacks pf ON p.id = pf.project_id
GROUP BY p.id;

CREATE VIEW student_reputation AS
SELECT 
    sp.id as student_id,
    sp.name,
    COUNT(DISTINCT pm.project_id) as projects_participated,
    COUNT(DISTINCT cp.id) as projects_created,
    AVG(pf.rating) as avg_rating_given,
    COUNT(DISTINCT pf.id) as feedbacks_received,
    GROUP_CONCAT(DISTINCT ss.skill_name) as skills
FROM student_profile sp
LEFT JOIN project_members pm ON sp.id = pm.member_id
LEFT JOIN collaborative_projects cp ON sp.id = cp.creator_id
LEFT JOIN project_feedbacks pf ON sp.id = pf.reviewed_id
LEFT JOIN student_skills ss ON sp.id = ss.student_id
GROUP BY sp.id;

-- 9. Triggers pour maintenir les compteurs
DELIMITER //

-- Trigger pour mettre à jour le nombre de participants
CREATE TRIGGER update_project_participants_after_insert
AFTER INSERT ON project_members
FOR EACH ROW
BEGIN
    UPDATE collaborative_projects 
    SET current_participants = (
        SELECT COUNT(*) 
        FROM project_members 
        WHERE project_id = NEW.project_id
    )
    WHERE id = NEW.project_id;
END//

CREATE TRIGGER update_project_participants_after_delete
AFTER DELETE ON project_members
FOR EACH ROW
BEGIN
    UPDATE collaborative_projects 
    SET current_participants = (
        SELECT COUNT(*) 
        FROM project_members 
        WHERE project_id = OLD.project_id
    )
    WHERE id = OLD.project_id;
END//

DELIMITER ;

-- 10. Index pour les performances
CREATE INDEX idx_projects_search ON collaborative_projects(title, description, category);
CREATE INDEX idx_projects_location_category ON collaborative_projects(location, category);
CREATE INDEX idx_applications_status ON project_applications(status, applied_at);
CREATE INDEX idx_messages_project_time ON project_messages(project_id, created_at DESC);
CREATE INDEX idx_tasks_project_status ON project_tasks(project_id, status);
