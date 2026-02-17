# Système Complet de Candidature et Gestion des Applications

## Vue d'ensemble

Un système complet permettant aux étudiants de consulter les offres d'emploi, postuler, et aux employeurs de gérer les candidatures en temps réel.

---

## 1. CÔTÉ ÉTUDIANT

### A. Page de consultation des offres - `/app/jobs/page.tsx`
- ✅ Liste dynamique des offres actives
- ✅ Recherche et filtrage en temps réel
- ✅ Affichage du nombre de candidatures par offre
- ✅ Paginntion automatique

### B. Page de détail d'une offre - `/app/jobs/[id]/page.tsx`
- ✅ Affichage complet des détails du poste
- ✅ Description, requirements, localisation
- ✅ Informations de contact du recruteur
- ✅ Formulaire de candidature intégré
- ✅ Vérification si l'étudiant a déjà postulé
- ✅ Message de confirmation après envoi
- ✅ Gestion d'erreurs avec fallback

**Flux utilisateur :**
1. Étudiant accède à `/jobs`
2. Clique sur une offre pour aller à `/jobs/[id]`
3. Remplit le formulaire de candidature
4. Reçoit une confirmation d'envoi
5. Voit l'état "Vous avez postulé" pour les futurs accès

### C. API Endpoints

#### GET `/api/job`
- Récupère la liste des offres actives
- Paramètres: `page`, `limit`, `search`
- Réponse: pagination + data des offres

#### GET `/api/job/[id]`
- Détails complets d'une offre
- Paramètre: `id` de l'offre
- Réponse: données complètes du job

#### POST `/api/job/[id]/apply`
- Soumet une candidature
- Auth: Bearer token (STUDENT)
- Body:
  ```json
  {
    "message": "...",
    "availability": "...",
    "experience": "...",
    "start_date": "YYYY-MM-DD"
  }
  ```
- Vérifications:
  - Utilisateur authentifié et STUDENT
  - Profil étudiant existe
  - Pas déjà candidaté à cette offre
  - Offre active et non bloquée

#### GET `/api/job/[id]/application-status`
- Vérifie si l'étudiant a candidaté
- Auth: Bearer token optionnel
- Réponse: `{ hasApplied: boolean, status: string }`

---

## 2. CÔTÉ EMPLOYEUR

### A. Page de gestion des applications - `/app/employer/applications/page.tsx`
- ✅ Liste de toutes les candidatures reçues
- ✅ Filtrage par statut (En attente, Acceptée, Rejetée, Entretien)
- ✅ Recherche par nom, email, poste
- ✅ Pagination
- ✅ Affichage du statut avec code couleur

### B. Modal de détail candidature - `components/application-detail-modal.tsx`
Affiche les informations complètes du candidat:
- **Profil du candidat**
  - Nom complet
  - Université et département
  - Année d'études
  
- **Coordonnées**
  - Email
  - Téléphone
  
- **Détails de candidature**
  - Message du candidat
  - Expérience décrite
  - Date de début souhaitée
  - Disponibilité
  
- **Compétences et Bio**
  - Liste des compétences
  - Biographie
  
- **Actions contextuelles**
  - Accepter → Statut ACCEPTED
  - Rejeter → Statut REJECTED
  - Entretien → Statut INTERVIEW
  - Infos entretien si programmé (date, heure, lieu)

### C. API Endpoints

#### GET `/api/employer/applications`
- Récupère les applications de l'employeur
- Auth: Bearer token (EMPLOYER)
- Paramètres: `page`, `limit`, `search`, `status`
- Filtrage: affiche uniquement les applications pour les jobs de l'employeur

#### GET `/api/employer/applications/[id]`
- Détails complets d'une candidature
- Auth: Bearer token (EMPLOYER)
- Réponse enrichie avec:
  - Infos candidature (message, expérience, disponibilité)
  - Profil étudiant complet (bio, skills, coordonnées)
  - Infos entretien si programmé

#### PUT `/api/employer/applications/[id]`
- Met à jour le statut d'une candidature
- Auth: Bearer token (EMPLOYER)
- Body: `{ status: "PENDING|ACCEPTED|REJECTED|INTERVIEW" }`
- Valide que l'application appartient aux jobs de l'employeur

---

## 3. FLUX COMPLET

### Scenario 1: Candidature simple
```
1. Étudiant → /jobs
2. Étudiant → /jobs/[id] (consulte offre)
3. Étudiant → Remplir formulaire et soumettre
4. API POST /job/[id]/apply → Créer candidature (status=PENDING)
5. BDD: job_application créée, applicants +1
6. Employeur reçoit notification
7. Étudiant voit "Vous avez postulé"
```

### Scenario 2: Gestion des candidatures
```
1. Employeur → /employer/applications
2. Employeur → Clique "Détails" sur candidature
3. Modal → Affiche profil complet du candidat
4. Employeur → Clique "Accepter/Rejeter/Entretien"
5. API PUT /employer/applications/[id] → MAJ statut
6. BDD: job_application.status updated
7. Modal → Se ferme automatiquement
8. Liste → Rafraîchit et affiche nouveau statut
```

---

## 4. ÉTATS ET TRANSITIONS

### Statuts possibles:
- **PENDING** (Par défaut) - En attente de réponse
- **INTERVIEW** - Entretien programmé
- **ACCEPTED** - Candidature acceptée
- **REJECTED** - Candidature rejetée

### Transitions autorisées:
- PENDING → INTERVIEW ✅
- PENDING → ACCEPTED ✅
- PENDING → REJECTED ✅
- Tout état → Tout état ✅ (modification par employeur)

---

## 5. DONNÉES STOCKÉES PAR CANDIDATURE

```sql
-- job_application
id (PK)
job_id (FK)
student_id (FK)
status (ENUM)
message (TEXT - motivations)
availability (TEXT - disponibilités)
experience (TEXT - expérience candidat)
start_date (DATE - début souhaité)
applied_at (DATETIME - timestamp candidature)
interview_date (DATETIME - si INTERVIEW)
interview_time (VARCHAR - heure entretien)
interview_location (VARCHAR - lieu entretien)
```

---

## 6. SÉCURITÉ

- ✅ Auth required pour postuler (STUDENT)
- ✅ Auth required pour voir applications (EMPLOYER)
- ✅ Vérification ownership - employeur ne voit que ses own applications
- ✅ Vérification duplication - étudiant ne peut postuler qu'une fois par offre
- ✅ Vérification offre active - pas de candidature si offre inactive/bloquée
- ✅ Validation JWT dans les routes protégées

---

## 7. AMÉLIORATIONS FUTURES

- [ ] Notifications email à chaque changement de statut
- [ ] Export CSV des candidatures
- [ ] Planification d'entretien intégrée (calendrier)
- [ ] Commentaires internes de l'employeur sur candidature
- [ ] Scoring automatique des candidatures
- [ ] Template de messages de refus/acceptation
- [ ] Historique des modifications de statut
- [ ] Possibilité de reprogrammer entretien
- [ ] Système de notes du candidat

---

## 8. FICHIERS CRÉÉS/MODIFIÉS

### Créés:
- ✅ `/app/jobs/[id]/page.tsx` - Page détail offre étudiant
- ✅ `/app/api/job/[id]/route.ts` - GET détail offre
- ✅ `/app/api/job/[id]/apply/route.ts` - POST/GET candidature
- ✅ `/components/application-detail-modal.tsx` - Modal détail candidature

### Modifiés:
- ✅ `/app/employer/applications/page.tsx` - Intégration modal
- ✅ `/app/api/employer/applications/[id]/route.ts` - Enrichissement données

---

## 9. TESTING CHECKLIST

- [ ] Étudiant peut voir détails offre
- [ ] Étudiant peut postuler avec formulaire
- [ ] Message d'erreur si déjà postulé
- [ ] Statut "Vous avez postulé" s'affiche après candidature
- [ ] Employeur voit candidatures dans sa liste
- [ ] Modal affiche profil complet candidat
- [ ] Employeur peut accepter/rejeter/mettre en entretien
- [ ] Candidature disparaît de "En attente" après action
- [ ] Statut updated correctly dans BDD
- [ ] Recherche/filtrage fonctionne bien
- [ ] Pagination fonctionne bien
