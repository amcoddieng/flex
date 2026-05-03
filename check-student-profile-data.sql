-- Vérifier les données dans student_profile
SELECT * FROM student_profile;

-- Vérifier les utilisateurs dans la table user
SELECT id, email, role FROM user WHERE role = 'STUDENT';

-- Vérifier la correspondance entre user.id et student_profile.user_id
SELECT u.id, u.email, u.role, sp.id as profile_id, sp.user_id 
FROM user u 
LEFT JOIN student_profile sp ON u.id = sp.user_id 
WHERE u.role = 'STUDENT';
