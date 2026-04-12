import mysql from 'mysql2/promise';

// Configuration temporaire avec l'utilisateur root
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: 'root',
  password: '', // Mot de passe root par défaut (vide)
  database: process.env.DB_NAME || 'job_platform',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export { pool };
