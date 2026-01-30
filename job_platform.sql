/* ================================
   BASE DE DONNÉES : JOB PLATFORM
   ================================ */

DROP DATABASE IF EXISTS job_platform;
CREATE DATABASE job_platform
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE job_platform;

/* ================================
   TABLE USER (AUTHENTIFICATION)
   ================================ */

CREATE TABLE user (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('STUDENT', 'EMPLOYER', 'ADMIN') NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

/* ================================
   EMPLOYER
   ================================ */

CREATE TABLE employer_profile (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) UNIQUE,
    company_name VARCHAR(255),
    contact_person VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    description TEXT,
    validation_status ENUM('PENDING', 'VALIDATED', 'REJECTED') DEFAULT 'PENDING',
    created_by_admin BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

CREATE TABLE employer_cart (
    id VARCHAR(36) PRIMARY KEY,
    employer_id VARCHAR(36) UNIQUE,
    FOREIGN KEY (employer_id) REFERENCES employer_profile(id) ON DELETE CASCADE
);

CREATE TABLE cart_item (
    id VARCHAR(36) PRIMARY KEY,
    cart_id VARCHAR(36),
    student_id VARCHAR(36),
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cart_id) REFERENCES employer_cart(id) ON DELETE CASCADE
);

/* ================================
   STUDENT
   ================================ */

CREATE TABLE student_profile (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(50),
    email VARCHAR(255),
    university VARCHAR(255),
    department VARCHAR(255),
    year_of_study INT,
    bio TEXT,
    skills JSON,
    availability JSON,
    services JSON,
    hourly_rate DECIMAL(10,2),
    profile_photo VARCHAR(255),
    student_card_pdf VARCHAR(255),
    validation_status ENUM('PENDING', 'VALIDATED', 'REJECTED') DEFAULT 'PENDING',
    rejection_reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

/* ================================
   JOB OFFER & APPLICATION
   ================================ */

CREATE TABLE job_offer (
    id VARCHAR(36) PRIMARY KEY,
    employer_id VARCHAR(36),
    title VARCHAR(255),
    description TEXT,
    company VARCHAR(255),
    location VARCHAR(255),
    service_type VARCHAR(255),
    salary VARCHAR(100),
    availability JSON,
    requirements TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    posted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    applicants INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (employer_id) REFERENCES employer_profile(id) ON DELETE CASCADE
);

CREATE TABLE job_application (
    id VARCHAR(36) PRIMARY KEY,
    job_id VARCHAR(36),
    student_id VARCHAR(36),
    status ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'INTERVIEW') DEFAULT 'PENDING',
    message TEXT,
    availability TEXT,
    experience TEXT,
    start_date DATE,
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    interview_date DATETIME,
    interview_time VARCHAR(50),
    interview_location VARCHAR(255),
    FOREIGN KEY (job_id) REFERENCES job_offer(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES student_profile(id) ON DELETE CASCADE
);

/* ================================
   FORUM
   ================================ */

CREATE TABLE forum_topic (
    id VARCHAR(36) PRIMARY KEY,
    author_id VARCHAR(36),
    author_name VARCHAR(255),
    author_university VARCHAR(255),
    author_department VARCHAR(255),
    category VARCHAR(255),
    title VARCHAR(255),
    content TEXT,
    tags JSON,
    likes INT DEFAULT 0,
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES student_profile(id) ON DELETE SET NULL
);

CREATE TABLE forum_reply (
    id VARCHAR(36) PRIMARY KEY,
    topic_id VARCHAR(36),
    author_id VARCHAR(36),
    author_name VARCHAR(255),
    author_university VARCHAR(255),
    content TEXT,
    likes INT DEFAULT 0,
    is_helpful BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (topic_id) REFERENCES forum_topic(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES student_profile(id) ON DELETE SET NULL
);

/* ================================
   NOTIFICATION
   ================================ */

CREATE TABLE notification (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    type ENUM('APPLICATION', 'INTERVIEW', 'ACCEPTED', 'REJECTED', 'VALIDATION'),
    title VARCHAR(255),
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    metadata JSON,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);
