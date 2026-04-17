# Résumé des Routes API - FlexJob Platform

## Routes par Catégorie

### Authentification (2 routes)
- `POST /api/login` - Connexion utilisateur
- `POST /api/register` - Inscription utilisateur

### Routes Publiques (3 routes)
- `GET /api/jobs` - Lister les offres d'emploi
- `GET /api/jobs/[id]` - Détails d'une offre
- `GET /api/me` - Infos utilisateur connecté

### API Étudiant (4 routes)
- `GET /api/student/applications` - Lister les candidatures
- `POST /api/student/applications` - Créer une candidature
- `DELETE /api/student/applications/[id]` - Supprimer une candidature
- `GET/PUT /api/student/profile` - Gérer le profil étudiant

### API Employeur (8 routes)
- `GET /api/employer/jobs` - Lister les offres
- `POST /api/employer/jobs` - Créer une offre
- `GET /api/employer/applications` - Lister les candidatures reçues
- `PUT /api/employer/applications/[id]` - Mettre à jour une candidature
- `GET/PUT /api/employer/profile` - Gérer le profil employeur
- `GET /api/employer/stats` - Statistiques employeur
- `GET /api/employer/conversations` - Conversations avec étudiants

### API Administrateur (8 routes)
- `GET /api/admin/stats` - Stats globales
- `GET /api/admin/users` - Lister tous les utilisateurs
- `GET /api/admin/students` - Lister les étudiants
- `GET /api/admin/employers` - Lister les employeurs
- `GET /api/admin/jobs` - Lister toutes les offres
- `GET /api/admin/applications` - Lister toutes les candidatures
- `POST /api/admin/employer-validation` - Valider un employeur

### API Forum (6 routes)
- `GET/POST /api/forum/topics` - Lister/créer des sujets
- `GET /api/forum/topics/[id]` - Détails d'un sujet
- `POST /api/forum/topics/[id]/replies` - Ajouter une réponse
- `POST /api/forum/topics/[id]/like` - Aimer un sujet
- `POST /api/forum/replies/[id]/like` - Aimer une réponse

### API Profil (2 routes)
- `GET /api/profile/student` - Profil étudiant public
- `GET /api/profile/employer` - Profil employeur public

### API Utilisateur (3 routes)
- `GET /api/user/[id]` - Infos utilisateur
- `PUT /api/user/[id]/profile` - Mettre à jour profil

### API Legacy (3 routes)
- `GET/POST /api/job` - Routes legacy jobs
- `GET/POST /api/job/[id]` - Routes legacy job détails
- `POST /api/job/[id]/apply` - Route legacy candidature

## Total: 46 routes API documentées
