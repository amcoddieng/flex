# 🎨 Architecture Visuelle - Système de Candidatures

## 🏗️ Architecture globale

```
┌─────────────────────────────────────────────────────────────────┐
│                         APPLICATION                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────┐      ┌──────────────────────┐        │
│  │    ÉTUDIANT SIDE     │      │  EMPLOYEUR SIDE      │        │
│  ├──────────────────────┤      ├──────────────────────┤        │
│  │                      │      │                      │        │
│  │ /jobs                │      │ /employer/           │        │
│  │ ├─ Page liste        │      │ applications         │        │
│  │ │  ├─ JobCard        │      │ ├─ Liste candidats  │        │
│  │ │  │  └─ onClick →   │      │ │  ├─ Recherche     │        │
│  │ │  └─ /jobs/[id]     │      │ │  ├─ Filtres       │        │
│  │ │                    │      │ │  └─ Pagination    │        │
│  │ /jobs/[id]           │      │                      │        │
│  │ ├─ Page détail       │      │ Modal Detail         │        │
│  │ ├─ Formulaire        │      │ ├─ Profil candidat  │        │
│  │ └─ POST /apply       │      │ ├─ Détails cand.    │        │
│  │    └─ Confirmation   │      │ └─ Actions          │        │
│  │                      │      │                      │        │
│  └──────────────────────┘      └──────────────────────┘        │
│          │                              ▲                       │
│          │ APIs                         │ APIs                  │
│          ▼                              │                       │
│  ┌──────────────────────┐      ┌──────────────────────┐        │
│  │   BACKEND - APIs     │      │   BACKEND - APIs     │        │
│  ├──────────────────────┤      ├──────────────────────┤        │
│  │                      │      │                      │        │
│  │ GET /api/job         │      │ GET /applications    │        │
│  │ ├─ Liste offres      │      │ ├─ Voir candidatures│        │
│  │ └─ Pagination        │      │ └─ Filtrer/recherch│        │
│  │                      │      │                      │        │
│  │ GET /api/job/[id]    │      │ GET /applications/[id]       │
│  │ └─ Détails offre     │      │ └─ Profil complet   │        │
│  │                      │      │                      │        │
│  │ POST /apply          │      │ PUT /applications/[id]       │
│  │ ├─ Créer candidate   │      │ └─ Update status    │        │
│  │ └─ Vérifications     │      │                      │        │
│  │                      │      │                      │        │
│  │ GET /apply-status    │      │                      │        │
│  │ └─ Check duplication │      │                      │        │
│  │                      │      │                      │        │
│  └──────────────────────┘      └──────────────────────┘        │
│          │                              │                       │
│          └──────────────┬───────────────┘                       │
│                         ▼                                       │
│              ┌──────────────────┐                              │
│              │  MYSQL DATABASE  │                              │
│              ├──────────────────┤                              │
│              │ job_application  │                              │
│              │ ├─ id            │                              │
│              │ ├─ job_id        │                              │
│              │ ├─ student_id    │                              │
│              │ ├─ status        │                              │
│              │ ├─ message       │                              │
│              │ ├─ experience    │                              │
│              │ ├─ availability  │                              │
│              │ ├─ start_date    │                              │
│              │ ├─ interview_*   │                              │
│              │ └─ applied_at    │                              │
│              └──────────────────┘                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Flux de données - Candidature

```
┌──────────────┐
│   ÉTUDIANT   │
└──────┬───────┘
       │
       │ 1. Accède à /jobs
       ▼
    ┌─────────────────┐
    │  Page liste     │
    │  JobCard        │
    │  Clic "Voir"    │
    └────────┬────────┘
             │
             │ 2. useRouter → /jobs/[id]
             ▼
    ┌──────────────────────┐
    │ Page détail offre    │
    │ - GET /api/job/[id]  │ ◄───────────┐
    │   (charge détails)   │             │
    │ - GET /application-  │             │
    │   status             │    API CALL │
    │ (check si postulé)   │             │
    └────────┬─────────────┘             │
             │                           │
             │ 3. Remplit formulaire    │
             │    - Message              │ ┌──────────────────┐
             │    - Expérience           │ │  BACKEND - APIs  │
             │    - Disponibilité        │ └──────────────────┘
             │    - Date                 │         ▲
             ▼                           │         │
    ┌──────────────────────┐             │         │
    │ Clic "Postuler"      │             │         │
    │ - Validation forms   │             │         │
    │ - POST /apply        ├─────────────┘         │
    │   + body + headers   │                       │
    └────────┬─────────────┘              BACKEND  │
             │                            EXECUTE  │
             │ 4. Réponse API                      │
             │    ├─ Success → Modal               │
             │    │   "Candidature envoyée"        │
             │    │   → Status = "Vous avez postulé"
             │    │                                │
             │    └─ Error → Afficher erreur      │
             │        └─ Retry                     │
             ▼                                     │
    ┌──────────────────────┐                      │
    │ Candidature envoyée ✅│                      │
    │ État persistant      │ ◄────────────────────┘
    │ "Vous avez postulé"  │
    └──────────────────────┘
```

---

## 📊 Flux de données - Gestion candidatures

```
┌──────────────┐
│  EMPLOYEUR   │
└──────┬───────┘
       │
       │ 1. Accède à /employer/applications
       ▼
    ┌──────────────────────────┐
    │ Page applications        │
    │ - GET /applications      │ ◄────────┐
    │   (charge liste)         │          │
    │ - Filtres/Recherche      │   API    │
    │   (refetch si change)    │  CALL    │
    └────────┬─────────────────┘          │
             │                            │
             │ 2. Voir liste candidates   │ ┌──────────────────┐
             │    - Nom                   │ │  BACKEND - APIs  │
             │    - Email                 │ └──────────────────┘
             │    - Poste                 │
             │    - Statut                │
             ▼                            │
    ┌──────────────────────────┐          │
    │ Clic "Détails"           │          │
    │ - GET /applications/[id] ├──────────┘
    │   + Bearer token         │
    └────────┬─────────────────┘
             │
             │ 3. API retourne:
             │    - Application details
             │    - Student profile complet
             │    - Interview info (si exist)
             ▼
    ┌──────────────────────────┐
    │ Modal s'ouvre            │
    │ - Profil candidat        │
    │ - Détails candidature    │
    │ - Boutons actions        │
    └────────┬─────────────────┘
             │
             │ 4. Employeur choisit action:
             │    - Accepter
             │    - Rejeter
             │    - Programmer entretien
             ▼
    ┌──────────────────────────┐
    │ Clic sur bouton          │
    │ - PUT /applications/[id] │ ◄────┐
    │   + { status: "..." }    │      │
    │   + Bearer token         │      │ API CALL
    │                          │      │
    └────────┬─────────────────┘      │
             │                        │
             │ 5. API met à jour:     │ ┌──────────────────┐
             │    - job_application   │ │  BACKEND - APIs  │
             │      .status           │ │  MYSQL UPDATE    │
             │    - Returns success   │ └──────────────────┘
             │                        │
             ▼                        │
    ┌──────────────────────────┐     │
    │ Modal ferme              │ ◄───┘
    │ Liste rafraîchit         │
    │ Candidature disparaît    │
    │ de "En attente"          │
    │ Affichée avec nouveau    │
    │ statut                   │
    └──────────────────────────┘
```

---

## 🔐 Couches de sécurité

```
┌─────────────────────────────────────────────────────────┐
│ REQUEST ENTRY                                           │
├─────────────────────────────────────────────────────────┤
│  ↓                                                       │
│  ┌────────────────────────────────────────────┐         │
│  │ LAYER 1: Authentication                    │         │
│  │ - Vérifier Bearer token présent            │         │
│  │ - Décoder JWT                              │         │
│  │ - Extraire userId, role                    │         │
│  └──────────┬───────────────────────────────┘         │
│             │ ✓ Token valide                           │
│             ▼                                          │
│  ┌────────────────────────────────────────────┐        │
│  │ LAYER 2: Authorization (Rôle)              │        │
│  │ - POST /apply → role must be STUDENT       │        │
│  │ - PUT /applications → role must be EMPLOYER │       │
│  │ - GET /employer → role must be EMPLOYER    │        │
│  └──────────┬────────────────────────────────┘        │
│             │ ✓ Role correct                           │
│             ▼                                          │
│  ┌────────────────────────────────────────────┐        │
│  │ LAYER 3: Data Validation                   │        │
│  │ - Vérifier offre existe et active          │        │
│  │ - Vérifier profil student/employer existe  │        │
│  │ - Vérifier pas déjà postulé                │        │
│  └──────────┬────────────────────────────────┘        │
│             │ ✓ Data valide                            │
│             ▼                                          │
│  ┌────────────────────────────────────────────┐        │
│  │ LAYER 4: Ownership Verification            │        │
│  │ - GET /applications → only own applications │       │
│  │ - PUT /applications/[id] → verify job owner│        │
│  └──────────┬────────────────────────────────┘        │
│             │ ✓ Ownership vérifié                      │
│             ▼                                          │
│  ┌────────────────────────────────────────────┐        │
│  │ LAYER 5: SQL Injection Prevention           │        │
│  │ - Toutes requêtes paramétrées              │        │
│  │ - Pas de concaténation de strings          │        │
│  │ - Types validés                            │        │
│  └──────────┬────────────────────────────────┘        │
│             │ ✓ Sécurisé                               │
│             ▼                                          │
│  ┌────────────────────────────────────────────┐        │
│  │ LAYER 6: Database Execution                │        │
│  │ - Execute query avec paramètres            │        │
│  │ - Retourner résultat                       │        │
│  └──────────┬────────────────────────────────┘        │
│             │                                          │
│             ▼                                          │
│  ┌────────────────────────────────────────────┐        │
│  │ RESPONSE                                    │        │
│  │ 200 OK + data                              │        │
│  │ ou                                          │        │
│  │ 401/403/400 + error message                │        │
│  └────────────────────────────────────────────┘        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📱 États de la candidature

```
┌─────────────┐
│   START     │
└──────┬──────┘
       │
       │ POST /apply
       ▼
┌──────────────────┐
│   📌 PENDING     │     État initial
│  (En attente)    │     Employeur examine
└────┬─────────┬───┘
     │         │
     │         └─────────────────┐
     │                           │
     │ PUT (accepter)            │ PUT (rejeter)
     ▼                           ▼
┌──────────────────┐    ┌──────────────────┐
│  ✅ ACCEPTED     │    │  ❌ REJECTED     │
│  (Acceptée)      │    │  (Rejetée)       │
└──────────────────┘    └──────────────────┘
     │                           │
     │ (Terminal - lecture)      │ (Terminal - lecture)
     ▼                           ▼
  FIN - OK                    FIN - KO


Alternative depuis PENDING:

       │ PUT (programmer entretien)
       ▼
┌──────────────────┐
│ 🗣️ INTERVIEW    │     Peut-être suivi de:
│ (Entretien)      │     - Accepter
└────┬─────────────┘
     │
     ├─ PUT (accepter) → ✅ ACCEPTED
     │
     └─ PUT (rejeter) → ❌ REJECTED
```

---

## 🗄️ Schéma base de données

```
┌─────────────────────────────────────┐
│       TABLE: job_application        │
├─────────────────────────────────────┤
│ id (PK)                   INT       │◄───┐
│ job_id (FK)               INT       │    │
│ student_id (FK)           INT       │    │
│ status (ENUM)             VARCHAR   │◄─┐ │
│ message (Opt)             TEXT      │  │ │
│ availability (Opt)        TEXT      │  │ │
│ experience (Opt)          TEXT      │  │ │
│ start_date (Opt)          DATE      │  │ │
│ applied_at (Default NOW)  DATETIME  │  │ │
│ interview_date (Opt)      DATETIME  │  │ │
│ interview_time (Opt)      VARCHAR   │  │ │
│ interview_location (Opt)  VARCHAR   │  │ │
│                                     │  │ │
└─────────────────────────────────────┘  │ │
                                         │ │
        ┌────────────────────────────────┘ │
        │                                  │
    job_id (FK)                      status ENUM:
        │                            • PENDING
        ▼                            • ACCEPTED
┌──────────────────────────┐         • REJECTED
│    TABLE: job_offer      │         • INTERVIEW
├──────────────────────────┤
│ id (PK)                  │
│ title                    │
│ description              │
│ location                 │
│ salary                   │
│ applicants (+1 chaque    │
│            candidature)  │
│ is_active                │
│ blocked                  │
└──────────────────────────┘
        │
        └─ employer_id (FK)
                ▼
        ┌──────────────────────────┐
        │ TABLE: employer_profile  │
        └──────────────────────────┘


        student_id (FK)
        │
        ▼
┌──────────────────────────┐
│ TABLE: student_profile   │
├──────────────────────────┤
│ id (PK)                  │
│ first_name               │
│ last_name                │
│ email                    │
│ phone                    │
│ university               │
│ department               │
│ year_of_study            │
│ bio                      │
│ skills (JSON)            │
│ profile_photo            │
│ hourly_rate              │
└──────────────────────────┘
```

---

## 🔄 Cycle de vie d'une candidature

```
1. CRÉATION
   Étudiant POST /apply
   ├─ Input: message, expérience, date, disponibilité
   ├─ Vérifications: auth, profil, duplication, offre
   └─ Output: candidature créée, status=PENDING

2. EN ATTENTE (PENDING)
   État: Employeur n'a pas encore décidé
   Actions possibles:
   ├─ Accepter → ACCEPTED
   ├─ Rejeter → REJECTED
   └─ Programmer entretien → INTERVIEW

3. ENTRETIEN (INTERVIEW)
   État: Entretien programmé
   Données: date, heure, lieu
   Actions possibles:
   ├─ Accepter → ACCEPTED
   └─ Rejeter → REJECTED

4. ACCEPTÉE (ACCEPTED)
   État: Terminale - candidat accepté
   Lecture seule (ne peut plus changer)

5. REJETÉE (REJECTED)
   État: Terminale - candidat rejeté
   Lecture seule (ne peut plus changer)
```

---

**Architecture complète du système de candidatures!** 🎉
