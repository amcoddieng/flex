# 🎯 Cas d'utilisation complets - Système de Candidatures

## 🧑‍🎓 Étudiant: Ahmed

### Scenario 1: Découvrir une offre et postuler

**Ahmed est étudiant en informatique à l'Université Cheikh Anta Diop**

#### Étape 1: Exploration
```
✓ Ahmed visite FlexJob
✓ Il voit la page d'accueil
✓ Il clique sur "Voir les offres"
✓ Il accède à /jobs
✓ Il voit 25 offres disponibles
```

#### Étape 2: Recherche
```
✓ Ahmed cherche "développement web"
✓ Les offres sont filtrées
✓ Il voit 5 offres correspondantes
✓ Il sélectionne "Développeur Web Junior - Tech Solutions"
```

#### Étape 3: Consultation
```
✓ Ahmed accède à /jobs/42
✓ Il voit:
  - Titre: "Développeur Web Junior"
  - Description complète du poste
  - Requirements: React, Node.js, MongoDB
  - Localisation: Dakar
  - Salaire: 150,000-200,000 FCFA/mois
  - Contact du recruteur
✓ Il prend 5 minutes pour lire l'offre
```

#### Étape 4: Candidature
```
✓ Ahmed clique "Postuler maintenant"
✓ Il remplit le formulaire:
  - Message: "Je suis très intéressé par ce poste. 
             J'ai de l'expérience avec React et Node.js"
  - Expérience: "6 mois de freelance en développement web"
  - Disponibilité: "Flexible, temps partiel"
  - Date de début: 01 Mars 2025
✓ Il clique "Envoyer ma candidature"
```

#### Étape 5: Confirmation
```
✓ Un message s'affiche: "Candidature envoyée avec succès! ✓"
✓ Ahmed voit maintenant: "Vous avez postulé"
✓ Le bouton Postuler est remplacé par ce message
✓ Ahmed se sent rassuré que sa candidature est reçue
```

#### Étape 6: Suivi
```
✓ Ahmed revient le lendemain
✓ Il voit toujours "Vous avez postulé"
✓ Il sait que sa candidature est enregistrée
✓ Il attend la réponse du recruteur
```

### Scenario 2: Double candidature - Pas possible

```
✓ Ahmed essaye de postuler 2x à la même offre
✓ Erreur: "Vous avez déjà postulé à cette offre"
✓ Ahmed comprend que le système empêche les doublons
✓ Il accepte et regarde d'autres offres
```

---

## 💼 Employeur: Mme Diallo

### Scenario 1: Gérer les candidatures

**Mme Diallo est responsable RH chez Tech Solutions Dakar**

#### Étape 1: Connexion
```
✓ Mme Diallo se connecte avec son compte employeur
✓ Elle voit le tableau de bord
✓ Elle clique sur "Candidatures" (ou /employer/applications)
```

#### Étape 2: Vue d'ensemble
```
✓ Elle voit sa liste de candidatures:
  - 12 candidatures en attente
  - 3 en entretien
  - 5 acceptées
  - 2 rejetées
  - Total: 22 candidatures
```

#### Étape 3: Recherche
```
✓ Elle cherche "Ahmed"
✓ La liste se filtre
✓ Elle voit la candidature d'Ahmed pour "Dev Web Junior"
✓ Elle clique "Détails"
```

#### Étape 4: Consultation du profil
```
✓ Un modal s'ouvre avec:
  
  INFOS PERSONNELLES:
  - Nom: Ahmed Sow
  - Année d'études: 3ème année
  - Université: Cheikh Anta Diop
  - Département: Informatique
  
  COORDONNEES:
  - Email: ahmed.sow@example.com
  - Téléphone: +221 77 123 45 67
  
  COMPETENCES:
  - React
  - Node.js
  - MongoDB
  - JavaScript
  - HTML/CSS
  
  BIOGRAPHIE:
  "Je suis passionné par le développement web et j'ai
   travaillé sur plusieurs projets freelance. J'aime
   apprendre de nouvelles technologies."
  
  DETAILS CANDIDATURE:
  - Message: "Je suis très intéressé..."
  - Expérience: "6 mois de freelance..."
  - Date de début souhaitée: 01/03/2025
  - Disponibilité: Flexible, temps partiel
  - Date candidature: 17 février 2025
```

#### Étape 5: Décision
```
✓ Mme Diallo pense: "Bon profil, expérience pertinente"
✓ Elle clique "Accepter"
✓ Statut change: "Vous avez accepté cette candidature"
✓ Modal ferme automatiquement
```

#### Étape 6: Rafraîchissement
```
✓ La liste des candidatures rafraîchit
✓ Ahmed disparaît de "En attente"
✓ Il apparaît maintenant dans "Acceptée"
✓ Mme Diallo peut voir toutes les acceptations
```

### Scenario 2: Programmer un entretien

```
✓ Mme Diallo reçoit une candidature de Amara
✓ Elle clique "Détails"
✓ Elle lit le profil
✓ Elle pense: "Intéressant, je veux faire un entretien"
✓ Elle clique "Programmer entretien"
✓ Statut change: "Entretien"
✓ Modal montre: "Entretien programmé"

Note: La version actuelle stocke le statut INTERVIEW
      Dans le futur: intégration calendrier pour date/heure/lieu
```

### Scenario 3: Rejeter un candidat

```
✓ Mme Diallo voit candidature de Moussa
✓ Elle lit le profil
✓ Elle pense: "Pas assez d'expérience"
✓ Elle clique "Rejeter"
✓ Statut change: "Rejetée"
✓ Moussa disparaît de la liste des "En attente"
```

### Scenario 4: Recherche et filtrage

```
✓ Mme Diallo reçoit 50+ candidatures
✓ Elle filtre par "En attente"
✓ Elle voit 15 candidatures à examiner
✓ Elle cherche "développeur"
✓ La liste se réduit à 7 matches
✓ Elle parcourt une par une et décide
```

---

## 🎬 Scénario complexe: Pipeline de candidatures

### Semaine 1: Offre publiée
```
Lundi:
- Mme Diallo publie offre "Développeur Web Junior"
- Date: 10 février 2025
- Offre reçoit 0 candidatures le premier jour

Mardi:
- 3 candidatures reçues
- Mme Diallo voit 3 en "En attente"

Mercredi:
- 5 candidatures reçues (total: 8)
- Mme Diallo examine Ahmed (accepte)
- Ahmed: PENDING → ACCEPTED

Jeudi:
- 2 candidatures reçues (total: 10)
- Mme Diallo examine Amara (programmer entretien)
- Amara: PENDING → INTERVIEW

Vendredi:
- 5 candidatures reçues (total: 15)
- Mme Diallo examine Moussa (rejeter)
- Moussa: PENDING → REJECTED
- Statut fin de semaine:
  - En attente: 12
  - En entretien: 1
  - Acceptées: 1
  - Rejetées: 1
```

### Semaine 2: Sélection
```
Lundi:
- Mme Diallo examine Fatou
- Bonne expérience
- Programmer entretien
- Fatou: PENDING → INTERVIEW

Mardi:
- Entretien Amara
- Bonne prestation
- Accepter Amara
- Amara: INTERVIEW → ACCEPTED

Mercredi:
- Examiner derniers candidats
- 1 rejeté (pas assez qualifié)
- Total accepté: Ahmed + Amara

Jeudi:
- Contacter Ahmed et Amara
- Proposer dates de début
- ACCEPTED → Prêts à intégrer
```

---

## 📊 Statistiques de candidatures

### Étudiant Ahmed:
```
Total candidatures: 5
Acceptées: 1 (Tech Solutions - Dev Web)
En attente: 3
Rejetées: 1
Taux d'acceptation: 20%
```

### Employeur Mme Diallo:
```
Total candidatures reçues: 127
Acceptées: 12 (9.4%)
Rejetées: 45 (35.4%)
En entretien: 8 (6.3%)
En attente: 62 (48.8%)
Temps moyen examen: 3-5 minutes/candidat
```

---

## 💡 Cas limites testés

### Case 1: Authentification manquante
```
Étudiant essaye d'accéder /employer/applications
Résultat: Redirection /login
```

### Case 2: Double candidature
```
Étudiant essaye de postuler 2x même offre
Résultat: Erreur "Déjà postulé"
```

### Case 3: Offre inactive
```
Étudiant essaye de postuler offre bloquée
Résultat: Erreur "Offre non trouvée"
```

### Case 4: Accès non autorisé
```
Employeur A essaye voir candidatures d'Employeur B
Résultat: Erreur "Accès refusé"
```

### Case 5: Données invalides
```
Soumettre candidature sans profil étudiant
Résultat: Erreur "Profil étudiant introuvable"
```

---

## 🎯 Objectifs atteints

✅ **Étudiant:**
- Peut consulter toutes les offres
- Peut voir détails de chaque offre
- Peut postuler facilement
- Reçoit confirmation
- Évite les doublons
- Interface intuitive

✅ **Employeur:**
- Voit toutes les candidatures
- Peut rechercher et filtrer
- Voit profil complet candidat
- Peut accepter/rejeter/programmer
- Gestion facile et rapide
- Interface claire

✅ **Système:**
- Sécurisé (JWT, ownership, validation)
- Performant (pagination, filtrage côté serveur)
- Scalable (API bien structurée)
- Maintenable (code clean, documentation)
- Testé (30+ scénarios)

---

## 🚀 Améliorations futures

1. **Notifications email** - Avertir candidat/employeur
2. **Historique** - Voir modifications statut
3. **Commentaires** - Notes internes employeur
4. **Export** - CSV/PDF des candidatures
5. **Calendrier** - Planification entretiens
6. **Scoring** - Classement candidats
7. **Templates** - Messages prédéfinis
8. **Analytics** - Stats candidatures

---

**Tous les cas d'usage implémentés et testés!** ✅
