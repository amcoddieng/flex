# Exemples de Tests API - FlexJob Platform

## Configuration de Test

### Variables d'environnement
```bash
BASE_URL=http://localhost:3000
STUDENT_EMAIL=student@test.com
STUDENT_PASSWORD=password123
EMPLOYER_EMAIL=employer@test.com
EMPLOYER_PASSWORD=password123
```

## Scripts de Test

### 1. Authentification

#### Connexion Étudiant
```bash
curl -X POST $BASE_URL/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'$STUDENT_EMAIL'",
    "password": "'$STUDENT_PASSWORD'"
  }'
```

#### Connexion Employeur
```bash
curl -X POST $BASE_URL/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'$EMPLOYER_EMAIL'",
    "password": "'$EMPLOYER_PASSWORD'"
  }'
```

### 2. Tests Étudiant

#### Lister les offres disponibles
```bash
curl -X GET "$BASE_URL/api/jobs?page=1&limit=10&search=developpeur"
```

#### Détails d'une offre
```bash
curl -X GET "$BASE_URL/api/jobs/1"
```

#### Postuler à une offre (nécessite token)
```bash
# Remplacer <TOKEN> par le token JWT obtenu lors de la connexion
curl -X POST $BASE_URL/api/student/applications \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"job_id": 1}'
```

#### Lister mes candidatures
```bash
curl -X GET $BASE_URL/api/student/applications \
  -H "Authorization: Bearer <TOKEN>"
```

#### Voir mon profil
```bash
curl -X GET $BASE_URL/api/student/profile \
  -H "Authorization: Bearer <TOKEN>"
```

#### Mettre à jour mon profil
```bash
curl -X PUT $BASE_URL/api/student/profile \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "bio": "Étudiant en informatique",
    "skills": "React, Node.js, Python"
  }'
```

#### Retirer une candidature
```bash
curl -X DELETE $BASE_URL/api/student/applications/1 \
  -H "Authorization: Bearer <TOKEN>"
```

### 3. Tests Employeur

#### Lister mes offres
```bash
curl -X GET $BASE_URL/api/employer/jobs \
  -H "Authorization: Bearer <TOKEN>"
```

#### Créer une nouvelle offre
```bash
curl -X POST $BASE_URL/api/employer/jobs \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Développeur Full Stack",
    "location": "Dakar",
    "description": "Nous recherchons un développeur talentueux",
    "company": "TechCompany",
    "service_type": "Temps plein",
    "salary": "150000",
    "requirements": "3+ ans expérience",
    "contact_email": "hr@techcompany.com",
    "contact_phone": "221123456789"
  }'
```

#### Lister les candidatures reçues
```bash
curl -X GET $BASE_URL/api/employer/applications \
  -H "Authorization: Bearer <TOKEN>"
```

#### Accepter une candidature
```bash
curl -X PUT $BASE_URL/api/employer/applications/1 \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "ACCEPTED",
    "message": "Votre candidature a été acceptée"
  }'
```

#### Voir mes statistiques
```bash
curl -X GET $BASE_URL/api/employer/stats \
  -H "Authorization: Bearer <TOKEN>"
```

### 4. Tests Administrateur

#### Statistiques globales
```bash
curl -X GET $BASE_URL/api/admin/stats \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

#### Lister tous les utilisateurs
```bash
curl -X GET "$BASE_URL/api/admin/users?page=1&limit=20&role=STUDENT" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

#### Valider un employeur
```bash
curl -X POST $BASE_URL/api/admin/employer-validation \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "employer_id": 1,
    "validation_status": "VALIDATED"
  }'
```

## Scripts Automatisés

### Script Bash Complet
```bash
#!/bin/bash

BASE_URL="http://localhost:3000"

echo "=== Test API FlexJob ==="

# 1. Test connexion étudiant
echo "1. Connexion étudiant..."
STUDENT_TOKEN=$(curl -s -X POST $BASE_URL/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@test.com","password":"password123"}' | \
  jq -r '.token')

if [ "$STUDENT_TOKEN" != "null" ]; then
  echo "Connexion étudiant réussie"
else
  echo "Échec connexion étudiant"
  exit 1
fi

# 2. Lister les offres
echo "2. Lister les offres..."
curl -s -X GET "$BASE_URL/api/jobs" | jq '.data | length'

# 3. Postuler à une offre
echo "3. Postuler à une offre..."
curl -s -X POST $BASE_URL/api/student/applications \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"job_id": 1}' | jq '.success'

# 4. Lister mes candidatures
echo "4. Lister mes candidatures..."
curl -s -X GET $BASE_URL/api/student/applications \
  -H "Authorization: Bearer $STUDENT_TOKEN" | jq '.applications | length'

echo "=== Tests terminés ==="
```

### Script Node.js
```javascript
// test-api.js
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

class APITester {
  constructor() {
    this.tokens = {};
  }

  async login(email, password, role) {
    const response = await fetch(`${BASE_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    if (data.success) {
      this.tokens[role] = data.token;
      console.log(`Connexion ${role} réussie`);
      return data.token;
    } else {
      console.error(`Échec connexion ${role}:`, data.error);
      return null;
    }
  }

  async testStudentFlow() {
    console.log('=== Test Flux Étudiant ===');
    
    // Connexion
    await this.login('student@test.com', 'password123', 'student');
    
    if (!this.tokens.student) return;
    
    // Lister les offres
    const jobsResponse = await fetch(`${BASE_URL}/api/jobs`);
    const jobsData = await jobsResponse.json();
    console.log(`Offres trouvées: ${jobsData.data.length}`);
    
    // Postuler à une offre
    if (jobsData.data.length > 0) {
      const applyResponse = await fetch(`${BASE_URL}/api/student/applications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.tokens.student}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ job_id: jobsData.data[0].id })
      });
      
      const applyData = await applyResponse.json();
      console.log('Résultat candidature:', applyData.success ? 'Succès' : applyData.error);
    }
    
    // Lister mes candidatures
    const appsResponse = await fetch(`${BASE_URL}/api/student/applications`, {
      headers: { 'Authorization': `Bearer ${this.tokens.student}` }
    });
    
    const appsData = await appsResponse.json();
    console.log(`Mes candidatures: ${appsData.applications.length}`);
  }

  async testEmployerFlow() {
    console.log('=== Test Flux Employeur ===');
    
    // Connexion employeur
    await this.login('employer@test.com', 'password123', 'employer');
    
    if (!this.tokens.employer) return;
    
    // Lister mes offres
    const jobsResponse = await fetch(`${BASE_URL}/api/employer/jobs`, {
      headers: { 'Authorization': `Bearer ${this.tokens.employer}` }
    });
    
    const jobsData = await jobsResponse.json();
    console.log(`Mes offres: ${jobsData.data.length}`);
    
    // Créer une offre
    const createResponse = await fetch(`${BASE_URL}/api/employer/jobs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.tokens.employer}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Test Job API',
        location: 'Dakar',
        description: 'Test description',
        company: 'Test Company',
        service_type: 'Temps plein',
        salary: '100000'
      })
    });
    
    const createData = await createResponse.json();
    console.log('Création offre:', createData.success ? 'Succès' : createData.error);
  }

  async runAllTests() {
    await this.testStudentFlow();
    await this.testEmployerFlow();
    console.log('=== Tests terminés ===');
  }
}

const tester = new APITester();
tester.runAllTests().catch(console.error);
```

## Postman Collection

### Importer dans Postman
```json
{
  "info": {
    "name": "FlexJob API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:3000"
    },
    {
      "key": "student_token",
      "value": ""
    },
    {
      "key": "employer_token",
      "value": ""
    }
  ],
  "item": [
    {
      "name": "Authentification",
      "item": [
        {
          "name": "Login Student",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"student@test.com\",\n  \"password\": \"password123\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/api/login",
              "host": ["{{base_url}}"],
              "path": ["api", "login"]
            }
          },
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "if (pm.response.code === 200) {",
                  "    const response = pm.response.json();",
                  "    pm.collectionVariables.set('student_token', response.token);",
                  "    pm.collectionVariables.set('student_id', response.userId);",
                  "}"
                ]
              }
            }
          ]
        }
      ]
    }
  ]
}
```

## Erreurs Communes et Solutions

### 401 Non autorisé
- **Cause**: Token manquant ou invalide
- **Solution**: Vérifier que le token est inclus dans le header `Authorization`

### 403 Accès refusé
- **Cause**: Rôle incorrect pour l'API
- **Solution**: Utiliser le bon type de compte (STUDENT/EMPLOYER/ADMIN)

### 404 Non trouvé
- **Cause**: Ressource inexistante
- **Solution**: Vérifier l'ID de la ressource

### 400 Requête invalide
- **Cause**: Données manquantes ou incorrectes
- **Solution**: Vérifier le format du body et les champs requis

## Monitoring et Débogage

### Logs du serveur
```bash
# Surveiller les logs en temps réel
npm run dev

# Vérifier les erreurs dans la console du navigateur
# Network tab > Status codes > Response body
```

### Validation des réponses
```javascript
// Toujours vérifier la structure de la réponse
if (response.ok && data.success) {
  // Succès
} else {
  console.error('Erreur:', data.error || 'Erreur inconnue');
}
```

---

## Notes Importantes

1. **Tokens JWT**: Durée de vie de 7 jours
2. **Rate Limiting**: Pas de limitation actuellement
3. **CORS**: Configuré pour le développement local
4. **Base de données**: MySQL avec connection pooling
5. **Environment**: Variables dans fichier `.env`

---

*Dernière mise à jour: 17 Avril 2026*
