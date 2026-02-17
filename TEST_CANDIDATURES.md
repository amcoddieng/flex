# 🧪 Guide de Test - Système de Candidatures

## Prérequis
- Deux comptes: 1 ÉTUDIANT + 1 EMPLOYEUR
- Offres d'emploi créées et actives
- Serveur développement en cours: `npm run dev`

---

## 📋 Scénario de test complet

### PHASE 1: Consultation de l'étudiant

#### Test 1.1 - Accès à la page des offres
```
1. Aller sur http://localhost:3000/jobs
2. Vérifier:
   ✓ Liste des offres s'affiche
   ✓ Recherche fonctionne
   ✓ Filtres disponibles
   ✓ Pagination fonctionne
```

#### Test 1.2 - Accès à une offre spécifique
```
1. Cliquer sur une offre (bouton "Voir l'offre")
2. Aller sur http://localhost:3000/jobs/[id]
3. Vérifier:
   ✓ Titre de l'offre affiché
   ✓ Description complète visible
   ✓ Localisation, salaire, type affichés
   ✓ Bouton "Postuler maintenant" visible
```

#### Test 1.3 - Candidature sans authentification
```
1. Sur la page offre, cliquer "Postuler maintenant"
2. Vérifier:
   ✓ Redirection vers /login
   OU
   ✓ Message "Authentification requise"
```

#### Test 1.4 - Connexion étudiant
```
1. Se connecter avec compte ÉTUDIANT
2. Retourner à /jobs/[id]
3. Vérifier:
   ✓ Formulaire de candidature visible
   ✓ Champs: message, expérience, disponibilité, date débutOK
```

#### Test 1.5 - Première candidature
```
1. Remplir le formulaire:
   - Message: "Je suis très intéressé par ce poste"
   - Expérience: "3 ans de développement"
   - Disponibilité: "Lundi à Vendredi"
   - Date: [Date future]
2. Cliquer "Envoyer ma candidature"
3. Vérifier:
   ✓ Message de succès s'affiche
   ✓ Formulaire disparaît
   ✓ Message "Vous avez postulé" apparaît
   ✓ Applicants +1 dans la BDD
```

#### Test 1.6 - Tentative de double candidature
```
1. Recharger la page
2. Vérifier:
   ✓ État "Vous avez postulé" persiste
   ✓ Bouton "Postuler" désactivé
3. Essayer de contourner en modifiant l'URL
4. Vérifier:
   ✓ Message d'erreur "Déjà postulé"
```

---

### PHASE 2: Gestion côté employeur

#### Test 2.1 - Connexion employeur
```
1. Se déconnecter (si encore connecté)
2. Connecter avec compte EMPLOYEUR
3. Aller à http://localhost:3000/employer/applications
4. Vérifier:
   ✓ Page charge sans erreur
   ✓ Liste des applications affichée
   ✓ La candidature du test 1.5 est visible
```

#### Test 2.2 - Recherche de candidature
```
1. Chercher par nom du candidat
2. Vérifier:
   ✓ Candidature filtrée correctement
3. Effacer recherche
4. Chercher par email
5. Vérifier:
   ✓ Candidature trouvée
```

#### Test 2.3 - Filtrage par statut
```
1. Filtrer par "En attente" (PENDING)
2. Vérifier:
   ✓ Candidatures récentes affichées
   ✓ Statut PENDING visible
3. Filtrer par "Acceptée"
4. Vérifier:
   ✓ Candidature du test 1.5 N'EST PAS là
```

#### Test 2.4 - Pagination
```
1. Créer plusieurs candidatures (>20)
2. Aller page 2
3. Vérifier:
   ✓ Nouvelles candidatures affichées
   ✓ Bouton "Précédent" actif
```

#### Test 2.5 - Ouverture du détail candidature
```
1. Cliquer "Détails" sur une candidature
2. Vérifier le modal:
   ✓ Titre de l'offre affiché
   ✓ Statut affiché (En attente/Accepté/etc)
   ✓ Nom complet du candidat
   ✓ Année d'études
   ✓ Université/Département
   ✓ Email et téléphone
   ✓ Bio du candidat (si remplie)
   ✓ Compétences (si remplies)
   ✓ Message de candidature
   ✓ Expérience décrite
   ✓ Date de début souhaitée
   ✓ Disponibilité
```

#### Test 2.6 - Acceptation de candidature
```
1. Modal ouvert sur candidature PENDING
2. Cliquer "Accepter"
3. Vérifier:
   ✓ Modal se ferme
   ✓ Liste rafraîchit
   ✓ Candidature disparaît de "En attente"
   ✓ Candidature apparaît avec statut ACCEPTED
   ✓ BDD: job_application.status = ACCEPTED
```

#### Test 2.7 - Rejet de candidature
```
1. Modal ouvert sur candidature PENDING
2. Cliquer "Rejeter"
3. Vérifier:
   ✓ Modal se ferme
   ✓ Candidature affichée avec statut REJECTED
   ✓ BDD: job_application.status = REJECTED
```

#### Test 2.8 - Programmation d'entretien
```
1. Modal ouvert sur candidature PENDING
2. Cliquer "Entretien"
3. Vérifier:
   ✓ Candidature change statut INTERVIEW
   ✓ BDD: job_application.status = INTERVIEW
   ✓ Message "Entretien programmé" visible
```

#### Test 2.9 - Modal de candidature acceptée
```
1. Cliquer "Détails" sur candidature ACCEPTED
2. Vérifier:
   ✓ Modal affiche "Candidature acceptée"
   ✓ Boutons d'action désactivés (lecture seule)
```

#### Test 2.10 - Modal de candidature rejetée
```
1. Cliquer "Détails" sur candidature REJECTED
2. Vérifier:
   ✓ Modal affiche "Candidature rejetée"
   ✓ Boutons d'action désactivés
```

---

### PHASE 3: Vérification des données

#### Test 3.1 - Base de données
```
Requête SQL:
SELECT * FROM job_application WHERE job_id = [id];

Vérifier:
✓ Candidature créée avec status PENDING
✓ student_id correct
✓ message rempli
✓ experience rempli
✓ availability rempli
✓ start_date rempli
✓ applied_at = NOW()
```

#### Test 3.2 - Compteur de candidatures
```
Requête SQL:
SELECT applicants FROM job_offer WHERE id = [id];

Vérifier:
✓ Applicants = nombre de candidatures
✓ Incrémente correctement à chaque candidature
```

---

### PHASE 4: Tests de limite

#### Test 4.1 - Erreur d'authentification
```
1. Tamponner le token JWT
2. Essayer d'accéder à /employer/applications
3. Vérifier:
   ✓ Message "Accès refusé"
   ✓ Redirection vers /login
```

#### Test 4.2 - Candidature offre inactive
```
1. Désactiver une offre (is_active = 0)
2. Étudiant essaye de postuler
3. Vérifier:
   ✓ Message d'erreur "Offre non trouvée"
   ✓ Formulaire non soumis
```

#### Test 4.3 - Candidature offre bloquée
```
1. Bloquer une offre (blocked = 1)
2. Étudiant essaye de postuler
3. Vérifier:
   ✓ Message d'erreur "Offre non trouvée"
```

#### Test 4.4 - Accès non autorisé
```
1. Employeur A essaye de voir candidatures d'Employeur B
2. Modifier l'URL avec un application_id qui n'est pas sien
3. Vérifier:
   ✓ Message "Accès refusé"
   ✓ Données non affichées
```

---

## 📊 Checklist de vérification

### Frontend:
- [ ] Page /jobs charge et liste les offres
- [ ] Page /jobs/[id] affiche tous les détails
- [ ] Formulaire candidature visible si authentifié
- [ ] Message de succès après candidature
- [ ] État "Vous avez postulé" persiste
- [ ] Page /employer/applications charge
- [ ] Modal détail s'ouvre
- [ ] Toutes les infos du candidat affichées
- [ ] Boutons accepter/rejeter/entretien actifs
- [ ] Modal ferme après action

### Backend:
- [ ] GET /api/job retourne offres actives
- [ ] GET /api/job/[id] retourne détails corrects
- [ ] POST /api/job/[id]/apply valide auth
- [ ] POST /api/job/[id]/apply crée candidature
- [ ] POST /api/job/[id]/apply incrémente applicants
- [ ] GET /api/job/[id]/application-status fonctionne
- [ ] GET /api/employer/applications retourne candidatures
- [ ] GET /api/employer/applications/[id] retourne profil complet
- [ ] PUT /api/employer/applications/[id] met à jour statut
- [ ] Vérification ownership employeur fonctionne

### Base de données:
- [ ] job_application créée correctement
- [ ] status initial = PENDING
- [ ] applicants incrémenté
- [ ] Pas de duplication possible
- [ ] Requêtes paramétrées (sécurité)

---

## 🐛 Troubleshooting

### Problème: Formulaire candidature ne s'affiche pas
**Solution:**
1. Vérifier token JWT valide: `localStorage.getItem('token')`
2. Vérifier profil étudiant existe: SELECT * FROM student_profile WHERE user_id = [id]
3. Vérifier offre active: SELECT is_active, blocked FROM job_offer WHERE id = [id]

### Problème: Modal ne charge pas le détail candidat
**Solution:**
1. Ouvrir DevTools F12
2. Onglet Network
3. Vérifier réponse GET /api/employer/applications/[id]
4. Vérifier structure JSON retournée

### Problème: Candidature n'apparaît pas chez employeur
**Solution:**
1. Vérifier que candidate et employer sont corrects
2. Vérifier employer_id de l'offre: SELECT employer_id FROM job_offer WHERE id = [id]
3. Vérifier requête GET /api/employer/applications filtre correctement

### Problème: Token expiré
**Solution:**
1. Se reconnecter
2. localStorage.clear() et recharger

---

## 📞 Support

Si les tests échouent:
1. Vérifier les logs du serveur: `npm run dev`
2. Vérifier la console du navigateur: F12 → Console
3. Vérifier les erreurs BDD: `npm run dev` affiche les erreurs SQL
4. Vérifier les tokens JWT: decodeToken() valide

---

## ✅ Validation finale

Une fois tous les tests passés ✅, le système est validé et prêt pour la production!
