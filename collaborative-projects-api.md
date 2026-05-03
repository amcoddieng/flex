# 🚀 API Endpoints pour Projets Collaboratifs

## 📋 Structure des API Routes

### 1. Projets (`/api/student/projects`)

#### GET `/api/student/projects`
- **Description**: Lister tous les projets avec filtres
- **Query params**: `category`, `location`, `status`, `search`, `page`, `limit`
- **Response**: Array de projets avec détails du créateur

```typescript
// GET /api/student/projects?category=business&location=Paris&page=1&limit=10
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": 1,
        "title": "Lancement de marque éco",
        "description": "Création d'une marque de vêtements durables",
        "category": "business",
        "location": "Paris",
        "max_participants": 5,
        "current_participants": 2,
        "creator": {
          "id": 1,
          "name": "Marie Dupont",
          "university": "HEC"
        },
        "created_at": "2024-01-15T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

#### POST `/api/student/projects`
- **Description**: Créer un nouveau projet
- **Body**: Détails du projet
- **Auth**: Token JWT requis

```typescript
// POST /api/student/projects
{
  "title": "Conférence étudiante IA",
  "description": "Organiser une conférence sur l'intelligence artificielle",
  "category": "event",
  "objective": "Partager les connaissances sur l'IA",
  "location": "Lyon",
  "duration": "2 mois",
  "max_participants": 8,
  "profiles_sought": "communication, marketing, technique",
  "requirements": "Expérience en événementiel"
}
```

#### GET `/api/student/projects/[id]`
- **Description**: Détails d'un projet spécifique
- **Response**: Projet complet + membres + nombre de candidatures

#### PUT `/api/student/projects/[id]`
- **Description**: Mettre à jour un projet (créateur uniquement)
- **Auth**: Token JWT + vérification créateur

#### DELETE `/api/student/projects/[id]`
- **Description**: Supprimer un projet (créateur uniquement)
- **Auth**: Token JWT + vérification créateur

---

### 2. Candidatures (`/api/student/projects/[id]/applications`)

#### GET `/api/student/projects/[id]/applications`
- **Description**: Lister les candidatures (créateur uniquement)
- **Response**: Liste des candidats avec détails

```typescript
{
  "success": true,
  "data": {
    "applications": [
      {
        "id": 1,
        "applicant": {
          "id": 2,
          "name": "Jean Martin",
          "university": "Polytechnique",
          "skills": ["marketing", "communication"]
        },
        "message": "Passionné par le marketing durable",
        "skills": "marketing, communication",
        "availability": "Week-ends",
        "status": "pending",
        "applied_at": "2024-01-16T14:30:00Z"
      }
    ]
  }
}
```

#### POST `/api/student/projects/[id]/applications`
- **Description**: Postuler à un projet
- **Body**: Message de motivation + compétences
- **Auth**: Token JWT requis

```typescript
{
  "message": "Je suis très intéressé par ce projet",
  "skills": "design, communication",
  "availability": "Soirs et week-ends"
}
```

#### PUT `/api/student/projects/[id]/applications/[appId]`
- **Description**: Accepter/refuser une candidature (créateur uniquement)
- **Body**: `{ "status": "accepted" }` ou `{ "status": "rejected" }`

---

### 3. Membres (`/api/student/projects/[id]/members`)

#### GET `/api/student/projects/[id]/members`
- **Description**: Lister les membres du projet
- **Response**: Liste des membres avec rôles

#### POST `/api/student/projects/[id]/members`
- **Description**: Ajouter un membre (créateur uniquement)
- **Body**: `{ "member_id": 5, "role": "communication" }`

#### DELETE `/api/student/projects/[id]/members/[memberId]`
- **Description**: Retirer un membre (créateur uniquement)

---

### 4. Chat du projet (`/api/student/projects/[id]/messages`)

#### GET `/api/student/projects/[id]/messages`
- **Description**: Récupérer les messages du chat
- **Query**: `page`, `limit`
- **Auth**: Membre du projet uniquement

#### POST `/api/student/projects/[id]/messages`
- **Description**: Envoyer un message
- **Body**: `{ "content": "Bonjour l'équipe !" }`
- **Auth**: Membre du projet uniquement

---

### 5. Tâches (`/api/student/projects/[id]/tasks`)

#### GET `/api/student/projects/[id]/tasks`
- **Description**: Lister les tâches du projet
- **Response**: Tâches avec responsable et statut

#### POST `/api/student/projects/[id]/tasks`
- **Description**: Créer une tâche (créateur ou membre)
- **Body**: `{ "title": "Créer le logo", "description": "Design du logo", "assigned_to": 3, "due_date": "2024-02-15" }`

#### PUT `/api/student/projects/[id]/tasks/[taskId]`
- **Description**: Mettre à jour une tâche
- **Body**: `{ "status": "completed" }` ou autre champ

---

### 6. Feedbacks (`/api/student/projects/[id]/feedbacks`)

#### GET `/api/student/projects/[id]/feedbacks`
- **Description**: Lister les feedbacks du projet
- **Auth**: Membre du projet uniquement

#### POST `/api/student/projects/[id]/feedbacks`
- **Description**: Donner un feedback à un membre
- **Body**: `{ "reviewed_id": 3, "rating": 5, "comment": "Excellent travail !" }`
- **Auth**: Membre du projet uniquement
- **Constraint**: Un feedback par membre par projet

---

### 7. Compétences étudiantes (`/api/student/skills`)

#### GET `/api/student/skills`
- **Description**: Lister toutes les compétences disponibles

#### POST `/api/student/skills`
- **Description**: Ajouter une compétence à son profil
- **Body**: `{ "skill_name": "marketing", "level": "advanced" }`

#### DELETE `/api/student/skills/[skillId]`
- **Description**: Supprimer une compétence

---

### 8. Recommandations (`/api/student/projects/recommendations`)

#### GET `/api/student/projects/recommendations`
- **Description**: Projets recommandés pour l'étudiant
- **Logic**: Basé sur compétences, localisation, intérêts
- **Auth**: Token JWT requis

```typescript
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "project": { /* détails du projet */ },
        "match_score": 85,
        "match_reasons": ["Compétences en marketing", "Localisation compatible", "Disponibilité"]
      }
    ]
  }
}
```

---

## 🔐 Sécurité et Permissions

### Middleware d'authentification
```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return NextResponse.json({ error: 'Token requis' }, { status: 401 });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    // Ajouter les infos utilisateur à la requête
    request.headers.set('x-user-id', decoded.id.toString());
    request.headers.set('x-user-role', decoded.role);
  } catch {
    return NextResponse.json({ error: 'Token invalide' }, { status: 403 });
  }
}
```

### Vérifications de permissions
- **Créateur du projet**: Vérification `project.creator_id === user.id`
- **Membre du projet**: Vérification dans `project_members`
- **Candidature unique**: Contrainte `UNIQUE (project_id, applicant_id)`
- **Feedback unique**: Contrainte `UNIQUE (project_id, reviewer_id, reviewed_id)`

---

## 🚀 Architecture des routes

```
app/
├── api/
│   └── student/
│       ├── projects/
│       │   ├── route.ts              # GET / POST projets
│       │   ├── [id]/
│       │   │   ├── route.ts          # GET / PUT / DELETE projet
│       │   │   ├── applications/
│       │   │   │   ├── route.ts      # GET applications (créateur)
│       │   │   │   └── [appId]/
│       │   │   │       └── route.ts  # PUT accept/reject
│       │   │   ├── members/
│       │   │   │   └── route.ts      # GET / POST / DELETE membres
│       │   │   ├── messages/
│       │   │   │   └── route.ts      # GET / POST messages
│       │   │   ├── tasks/
│       │   │   │   └── route.ts      # GET / POST / PUT tâches
│       │   │   └── feedbacks/
│       │   │       └── route.ts      # GET / POST feedbacks
│       │   └── recommendations/
│       │       └── route.ts          # GET recommandations
│       └── skills/
│           └── route.ts              # GET / POST / DELETE compétences
```

---

## 📊 Performance et Optimisation

### Index de base de données
- Recherche par titre/description: `idx_projects_search`
- Filtres combinés: `idx_projects_location_category`
- Messages temps réel: `idx_messages_project_time`
- Tâches par statut: `idx_tasks_project_status`

### Pagination
- Tous les endpoints list utilisent `page` et `limit`
- Default: `page=1, limit=10`
- Maximum: `limit=50`

### Cache
- Projets populaires: Redis TTL 1h
- Recommandations: Redis TTL 30min
- Messages chat: Redis TTL 24h

---

## 🔄 WebSocket pour temps réel

### Événements WebSocket
```typescript
// Nouveau message dans le chat
socket.emit('project:new_message', {
  project_id: 1,
  message: { /* détails */ }
});

// Nouvelle candidature
socket.emit('project:new_application', {
  project_id: 1,
  application: { /* détails */ }
});

// Changement de statut de tâche
socket.emit('project:task_updated', {
  project_id: 1,
  task: { /* détails */ }
});
```
