// Script pour générer un token JWT valide pour l'étudiant Amadou Dieng
// Exécuter avec: node generate-jwt-token.js

const jwt = require('jsonwebtoken');

// Clé secrète (doit être la même que dans l'application)
const JWT_SECRET = 'cle_a_modifier';

function generateValidToken() {
  const payload = {
    userId: 56, // user_id de Amadou Dieng
    role: 'STUDENT',
    name: 'Amadou Dieng',
    email: 'etudiant@etudiant.com',
    iat: Math.floor(Date.now() / 1000),
    iata: null,
    iss: null,
    validationStatus: 'VALIDATED'
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
  
  console.log('=== Token JWT Généré ===');
  console.log('Token:', token);
  console.log('Payload:', JSON.stringify(payload, null, 2));
  
  // Vérifier le token
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token valide:', decoded);
  } catch (error) {
    console.error('Token invalide:', error.message);
  }
  
  return token;
}

generateValidToken();
