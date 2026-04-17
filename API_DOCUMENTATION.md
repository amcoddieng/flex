# Documentation API - FlexJob Platform

## Table des matières

1. [Authentification](#authentification)
2. [Routes Publiques](#routes-publiques)
3. [API Étudiant](#api-étudiant)
4. [API Employeur](#api-employeur)
5. [API Administrateur](#api-administrateur)
6. [API Forum](#api-forum)
7. [API Profil](#api-profil)
8. [API Utilisateur](#api-utilisateur)

---

## Authentification

### POST /api/login
**Description**: Connexion utilisateur et génération de token JWT

**Headers**:
- `Content-Type: application/json`

**Body**:
```json
{
  "email": "string",
  "password": "string"
}
```

**Réponse (200)**:
```json
{
  "success": true,
  "token": "string",
  "role": "STUDENT|EMPLOYER|ADMIN",
  "userId": "number",
  "email": "string",
  "name": "string",
  "avatar": "string|null"
}
```

**Réponse (401)**:
```json
{
  "error": "Mot de passe incorrect"
}
```

**Réponse (404)**:
```json
{
  "error": "Utilisateur non trouvé"
}
```

---

### POST /api/register
**Description**: Inscription nouvel utilisateur

**Headers**:
- `Content-Type: application/json`

**Body**:
```json
{
  "email": "string",
  "password": "string",
  "role": "STUDENT|EMPLOYER",
  "firstName": "string",
  "lastName": "string"
}
```

**Réponse (201)**:
```json
{
  "success": true,
  "message": "Utilisateur créé avec succès"
}
```

---

### GET /api/me
**Description**: Récupérer les informations de l'utilisateur connecté

**Headers**:
- `Authorization: Bearer <token>`

**Réponse (200)**:
```json
{
  "id": "number",
  "email": "string",
  "role": "string",
  "profile": "object"
}
```

---

## Routes Publiques

### GET /api/jobs
**Description**: Lister toutes les offres d'emploi actives

**Query Parameters**:
- `page`: number (default: 1)
- `limit`: number (default: 20)
- `search`: string (recherche par titre, description, entreprise)
- `job_type`: string (filtre par type de contrat)
- `location`: string (filtre par localisation)

**Réponse (200)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "number",
      "title": "string",
      "company": "string",
      "employer_company": "string",
      "location": "string",
      "job_type": "string",
      "salary": "string",
      "description": "string",
      "requirements": "string",
      "posted_at": "string",
      "is_active": "boolean",
      "contact_person": "string",
      "contact_email": "string",
      "contact_phone": "string",
      "applicants_count": "number"
    }
  ],
  "pagination": {
    "page": "number",
    "limit": "number",
    "total": "number",
    "pages": "number"
  }
}
```

---

### GET /api/jobs/[id]
**Description**: Détails d'une offre d'emploi spécifique

**Réponse (200)**:
```json
{
  "success": true,
  "data": {
    "id": "number",
    "title": "string",
    "company": "string",
    "employer_company": "string",
    "location": "string",
    "job_type": "string",
    "salary": "string",
    "description": "string",
    "requirements": "string",
    "posted_at": "string",
    "is_active": "boolean",
    "employer_id": "number",
    "contact_person": "string",
    "contact_email": "string",
    "contact_phone": "string",
    "employer_description": "string",
    "applicants_count": "number"
  }
}
```

---

## API Étudiant

### GET /api/student/applications
**Description**: Récupérer toutes les candidatures de l'étudiant connecté

**Headers**:
- `Authorization: Bearer <token>`

**Query Parameters**:
- `page`: number (default: 1)
- `limit`: number (default: 20)

**Réponse (200)**:
```json
{
  "applications": [
    {
      "id": "number",
      "job_id": "number",
      "student_id": "number",
      "status": "PENDING|INTERVIEW|ACCEPTED|REJECTED",
      "applied_at": "string",
      "cover_letter": "string",
      "job": {
        "id": "number",
        "title": "string",
        "description": "string",
        "location": "string",
        "job_type": "string",
        "salary": "string",
        "created_at": "string",
        "employer": {
          "company_name": "string",
          "contact_person": "string",
          "email": "string",
          "phone": "string"
        }
      }
    }
  ],
  "pagination": {
    "page": "number",
    "limit": "number",
    "total": "number",
    "totalPages": "number"
  }
}
```

---

### POST /api/student/applications
**Description**: Créer une nouvelle candidature

**Headers**:
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Body**:
```json
{
  "job_id": "number"
}
```

**Réponse (201)**:
```json
{
  "success": true,
  "message": "Candidature envoyée avec succès",
  "data": {
    "id": "number"
  }
}
```

**Réponse (400)**:
```json
{
  "error": "Vous avez déjà postulé à cette offre"
}
```

---

### DELETE /api/student/applications/[id]
**Description**: Supprimer/retirer une candidature

**Headers**:
- `Authorization: Bearer <token>`

**Réponse (200)**:
```json
{
  "success": true,
  "message": "Candidature retirée avec succès"
}
```

---

### GET /api/student/profile
**Description**: Récupérer le profil de l'étudiant connecté

**Headers**:
- `Authorization: Bearer <token>`

**Réponse (200)**:
```json
{
  "success": true,
  "data": {
    "id": "number",
    "user_id": "number",
    "first_name": "string",
    "last_name": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "bio": "string",
    "education": "string",
    "experience": "string",
    "skills": "string",
    "cv_url": "string",
    "linkedin_url": "string",
    "portfolio_url": "string"
  }
}
```

---

### PUT /api/student/profile
**Description**: Mettre à jour le profil de l'étudiant

**Headers**:
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Body**:
```json
{
  "first_name": "string",
  "last_name": "string",
  "email": "string",
  "phone": "string",
  "location": "string",
  "bio": "string",
  "education": "string",
  "experience": "string",
  "skills": "string",
  "cv_url": "string",
  "linkedin_url": "string",
  "portfolio_url": "string"
}
```

**Réponse (200)**:
```json
{
  "success": true,
  "message": "Profil mis à jour avec succès",
  "data": "object"
}
```

---

## API Employeur

### GET /api/employer/jobs
**Description**: Lister toutes les offres de l'employeur connecté

**Headers**:
- `Authorization: Bearer <token>`

**Query Parameters**:
- `page`: number (default: 1)
- `limit`: number (default: 20)
- `search`: string

**Réponse (200)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "number",
      "title": "string",
      "location": "string",
      "is_active": "boolean",
      "blocked": "boolean",
      "posted_at": "string",
      "description": "string",
      "applicants": "number"
    }
  ],
  "pagination": {
    "page": "number",
    "limit": "number",
    "total": "number",
    "pages": "number"
  }
}
```

---

### POST /api/employer/jobs
**Description**: Créer une nouvelle offre d'emploi

**Headers**:
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Body**:
```json
{
  "title": "string",
  "location": "string",
  "description": "string",
  "company": "string",
  "service_type": "string",
  "salary": "string",
  "requirements": "string",
  "contact_email": "string",
  "contact_phone": "string",
  "availability": "Temps plein|Temps partiel|Mi-temps|Temps flexible|Horaires flexibles",
  "type_paiement": "heure|jour|semaine|mois"
}
```

**Réponse (201)**:
```json
{
  "success": true,
  "message": "Offre créée avec succès",
  "data": {
    "id": "number"
  }
}
```

---

### GET /api/employer/applications
**Description**: Lister toutes les candidatures reçues

**Headers**:
- `Authorization: Bearer <token>`

**Query Parameters**:
- `page`: number (default: 1)
- `limit`: number (default: 20)
- `status`: string (PENDING|INTERVIEW|ACCEPTED|REJECTED)

**Réponse (200)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "number",
      "job_id": "number",
      "student_id": "number",
      "status": "string",
      "applied_at": "string",
      "message": "string",
      "student": {
        "first_name": "string",
        "last_name": "string",
        "email": "string",
        "phone": "string"
      },
      "job": {
        "title": "string",
        "location": "string"
      }
    }
  ],
  "pagination": {
    "page": "number",
    "limit": "number",
    "total": "number",
    "pages": "number"
  }
}
```

---

### PUT /api/employer/applications/[id]
**Description**: Mettre à jour le statut d'une candidature

**Headers**:
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Body**:
```json
{
  "status": "PENDING|INTERVIEW|ACCEPTED|REJECTED",
  "message": "string"
}
```

**Réponse (200)**:
```json
{
  "success": true,
  "message": "Candidature mise à jour avec succès"
}
```

---

### GET /api/employer/profile
**Description**: Récupérer le profil de l'employeur

**Headers**:
- `Authorization: Bearer <token>`

**Réponse (200)**:
```json
{
  "success": true,
  "data": {
    "id": "number",
    "user_id": "number",
    "company_name": "string",
    "contact_person": "string",
    "email": "string",
    "phone": "string",
    "address": "string",
    "description": "string",
    "validation_status": "PENDING|VALIDATED|REJECTED"
  }
}
```

---

### PUT /api/employer/profile
**Description**: Mettre à jour le profil de l'employeur

**Headers**:
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Body**:
```json
{
  "company_name": "string",
  "contact_person": "string",
  "email": "string",
  "phone": "string",
  "address": "string",
  "description": "string"
}
```

---

### GET /api/employer/stats
**Description**: Statistiques de l'employeur

**Headers**:
- `Authorization: Bearer <token>`

**Réponse (200)**:
```json
{
  "success": true,
  "data": {
    "total_jobs": "number",
    "active_jobs": "number",
    "total_applications": "number",
    "pending_applications": "number",
    "accepted_applications": "number",
    "recent_applications": "array"
  }
}
```

---

### GET /api/employer/conversations
**Description**: Lister les conversations avec les étudiants

**Headers**:
- `Authorization: Bearer <token>`

**Réponse (200)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "number",
      "participant_id": "number",
      "participant_name": "string",
      "participant_type": "STUDENT",
      "last_message": "string",
      "last_message_at": "string",
      "unread_count": "number"
    }
  ]
}
```

---

## API Administrateur

### GET /api/admin/stats
**Description**: Statistiques globales de la plateforme

**Headers**:
- `Authorization: Bearer <token> (role: ADMIN)`

**Réponse (200)**:
```json
{
  "success": true,
  "data": {
    "total_users": "number",
    "total_students": "number",
    "total_employers": "number",
    "total_jobs": "number",
    "total_applications": "number",
    "active_jobs": "number",
    "pending_validations": "number"
  }
}
```

---

### GET /api/admin/users
**Description**: Lister tous les utilisateurs

**Headers**:
- `Authorization: Bearer <token> (role: ADMIN)`

**Query Parameters**:
- `page`: number
- `limit`: number
- `role`: string (STUDENT|EMPLOYER)
- `search`: string

**Réponse (200)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "number",
      "email": "string",
      "role": "string",
      "blocked": "boolean",
      "created_at": "string",
      "profile": "object"
    }
  ],
  "pagination": "object"
}
```

---

### GET /api/admin/students
**Description**: Lister tous les étudiants

**Headers**:
- `Authorization: Bearer <token> (role: ADMIN)`

**Réponse (200)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "number",
      "user_id": "number",
      "first_name": "string",
      "last_name": "string",
      "email": "string",
      "validation_status": "string"
    }
  ]
}
```

---

### GET /api/admin/employers
**Description**: Lister tous les employeurs

**Headers**:
- `Authorization: Bearer <token> (role: ADMIN)`

**Réponse (200)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "number",
      "user_id": "number",
      "company_name": "string",
      "contact_person": "string",
      "email": "string",
      "validation_status": "string"
    }
  ]
}
```

---

### GET /api/admin/jobs
**Description**: Lister toutes les offres d'emploi

**Headers**:
- `Authorization: Bearer <token> (role: ADMIN)`

**Réponse (200)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "number",
      "title": "string",
      "company": "string",
      "location": "string",
      "is_active": "boolean",
      "blocked": "boolean",
      "posted_at": "string",
      "applicants": "number"
    }
  ]
}
```

---

### GET /api/admin/applications
**Description**: Lister toutes les candidatures

**Headers**:
- `Authorization: Bearer <token> (role: ADMIN)`

**Réponse (200)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "number",
      "job_id": "number",
      "student_id": "number",
      "status": "string",
      "applied_at": "string",
      "student": "object",
      "job": "object"
    }
  ]
}
```

---

### POST /api/admin/employer-validation
**Description**: Valider/rejeter un employeur

**Headers**:
- `Authorization: Bearer <token> (role: ADMIN)`
- `Content-Type: application/json`

**Body**:
```json
{
  "employer_id": "number",
  "validation_status": "VALIDATED|REJECTED",
  "rejection_reason": "string"
}
```

---

## API Forum

### GET /api/forum/topics
**Description**: Lister tous les sujets du forum

**Query Parameters**:
- `page`: number
- `limit`: number
- `category`: string

**Réponse (200)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "number",
      "title": "string",
      "content": "string",
      "author_id": "number",
      "author_name": "string",
      "category": "string",
      "created_at": "string",
      "replies_count": "number",
      "likes_count": "number"
    }
  ]
}
```

---

### POST /api/forum/topics
**Description**: Créer un nouveau sujet

**Headers**:
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Body**:
```json
{
  "title": "string",
  "content": "string",
  "category": "string"
}
```

---

### GET /api/forum/topics/[id]
**Description**: Détails d'un sujet avec ses réponses

**Réponse (200)**:
```json
{
  "success": true,
  "data": {
    "id": "number",
    "title": "string",
    "content": "string",
    "author": "object",
    "created_at": "string",
    "replies": "array",
    "likes_count": "number"
  }
}
```

---

### POST /api/forum/topics/[id]/replies
**Description**: Ajouter une réponse à un sujet

**Headers**:
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Body**:
```json
{
  "content": "string"
}
```

---

### POST /api/forum/topics/[id]/like
**Description**: Aimer un sujet

**Headers**:
- `Authorization: Bearer <token>`

---

### POST /api/forum/replies/[id]/like
**Description**: Aimer une réponse

**Headers**:
- `Authorization: Bearer <token>`

---

## API Profil

### GET /api/profile/student
**Description**: Récupérer le profil étudiant (public)

**Réponse (200)**:
```json
{
  "success": true,
  "data": {
    "first_name": "string",
    "last_name": "string",
    "education": "string",
    "skills": "string",
    "bio": "string"
  }
}
```

---

### GET /api/profile/employer
**Description**: Récupérer le profil employeur (public)

**Réponse (200)**:
```json
{
  "success": true,
  "data": {
    "company_name": "string",
    "description": "string",
    "contact_person": "string"
  }
}
```

---

## API Utilisateur

### GET /api/user/[id]
**Description**: Récupérer les informations d'un utilisateur

**Headers**:
- `Authorization: Bearer <token>`

**Réponse (200)**:
```json
{
  "success": true,
  "data": {
    "id": "number",
    "email": "string",
    "role": "string",
    "created_at": "string",
    "profile": "object"
  }
}
```

---

### PUT /api/user/[id]/profile
**Description**: Mettre à jour le profil d'un utilisateur

**Headers**:
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

---

## Codes d'Erreur

### Codes HTTP Communs
- `200`: Succès
- `201`: Créé avec succès
- `400`: Requête invalide
- `401`: Non autorisé
- `403`: Accès refusé
- `404`: Non trouvé
- `500`: Erreur serveur

### Messages d'Erreur Types
```json
{
  "error": "Message d'erreur spécifique"
}
```

---

## Notes d'Authentification

1. **Token JWT**: Inclus dans le header `Authorization: Bearer <token>`
2. **Durée de vie**: 7 jours par défaut
3. **Rôles**: `STUDENT`, `EMPLOYER`, `ADMIN`
4. **Validation**: Le token est vérifié à chaque requête protégée

---

## Environnement de Développement

- **Base URL**: `http://localhost:3000/api`
- **Secret JWT**: `cle_a_modifier` (à changer en production)
- **Base de données**: MySQL
- **Framework**: Next.js 16.0.10 avec App Router

---

## Exemples d'Utilisation

### Connexion étudiante
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@test.com","password":"password123"}'
```

### Postuler à une offre
```bash
curl -X POST http://localhost:3000/api/student/applications \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"job_id":1}'
```

### Lister les offres
```bash
curl "http://localhost:3000/api/jobs?search=developpeur&page=1&limit=10"
```

---

## Dernière Mise à Jour

**Date**: 17 Avril 2026  
**Version**: 1.0  
**Auteur**: FlexJob Team
