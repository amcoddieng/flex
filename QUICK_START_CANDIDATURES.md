# 🚀 Quick Start - Système de Candidatures

## ⚡ Démarrage rapide

### 1. Vérifier la compilation
```bash
cd /home/amcode/Bureau/FlexJob
npm run build
# ✓ Tous les fichiers doivent compiler sans erreur
```

### 2. Lancer le serveur de développement
```bash
npm run dev
# ✓ Serveur accessible à http://localhost:3000
```

### 3. Tester en tant qu'ÉTUDIANT

#### 3.1 Créer un compte étudiant
```
1. Aller à http://localhost:3000/register
2. S'inscrire comme ÉTUDIANT
3. Email: etudiant@example.com
4. Password: Test123!
```

#### 3.2 Compléter le profil
```
1. Aller à /student (si redirect auto)
2. Remplir le profil:
   - Prénom, Nom
   - Université, Département
   - Année d'études
   - Compétences
   - Bio
3. Sauvegarder
```

#### 3.3 Consulter les offres
```
1. Aller à http://localhost:3000/jobs
2. Vérifier la liste des offres
3. Cliquer sur une offre
4. Aller à http://localhost:3000/jobs/[id]
```

#### 3.4 Postuler
```
1. Sur /jobs/[id], cliquer "Postuler maintenant"
2. Remplir le formulaire:
   - Message: "Je m'intéresse à ce poste"
   - Expérience: "2 ans de développement"
   - Date de début: [Date future]
   - Disponibilité: "Lundi à Vendredi"
3. Cliquer "Envoyer ma candidature"
4. Vérifier le message de succès ✓
5. Vérifier que "Vous avez postulé" s'affiche
```

### 4. Tester en tant qu'EMPLOYEUR

#### 4.1 Créer un compte employeur
```
1. http://localhost:3000/register
2. S'inscrire comme EMPLOYEUR
3. Email: employer@example.com
4. Password: Test123!
```

#### 4.2 Compléter le profil employeur
```
1. Aller à /employer/profile
2. Remplir:
   - Nom entreprise
   - Contact person
   - Téléphone
   - Adresse
3. Télécharger documents d'identité
4. Sauvegarder
```

#### 4.3 Créer une offre
```
1. Aller à /employer/jobs
2. Cliquer "Créer une offre"
3. Remplir:
   - Titre: "Développeur Web Junior"
   - Description
   - Localisation
   - Salaire
   - Type de contrat
4. Publier
```

#### 4.4 Voir les candidatures
```
1. Aller à /employer/applications
2. Vérifier la liste (la candidature du test 3.4 doit être là)
3. Filtrer par "En attente" (PENDING)
4. Chercher par nom du candidat
```

#### 4.5 Gérer une candidature
```
1. Cliquer "Détails" sur une candidature
2. Vérifier dans le modal:
   - Profil complet du candidat
   - Détails de la candidature
   - Message, expérience, date, disponibilité
3. Cliquer "Accepter"
4. Vérifier la fermeture du modal
5. Revenir à /applications
6. Vérifier que la candidature est passée en "Acceptée"
```

---

## 📍 URLs clés

### Public
- `http://localhost:3000/jobs` - Liste des offres
- `http://localhost:3000/jobs/[id]` - Détail offre + candidature

### Étudiant (auth required)
- `http://localhost:3000/student` - Profil étudiant

### Employeur (auth required)
- `http://localhost:3000/employer/applications` - Gestion candidatures
- `http://localhost:3000/employer/jobs` - Gestion offres
- `http://localhost:3000/employer/profile` - Profil employeur

### Auth
- `http://localhost:3000/login` - Connexion
- `http://localhost:3000/register` - Inscription

---

## 🧪 Commandes utiles

### Tests API avec cURL

#### Lister les offres
```bash
curl -X GET "http://localhost:3000/api/job?page=1&limit=20"
```

#### Détail d'une offre
```bash
curl -X GET "http://localhost:3000/api/job/1"
```

#### Postuler (nécessite token)
```bash
curl -X POST "http://localhost:3000/api/job/1/apply" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Test message",
    "availability": "Flexible",
    "experience": "Test",
    "start_date": "2025-03-01"
  }'
```

#### Lister les candidatures (employeur)
```bash
curl -X GET "http://localhost:3000/api/employer/applications" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Détail candidature (employeur)
```bash
curl -X GET "http://localhost:3000/api/employer/applications/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Accepter candidature
```bash
curl -X PUT "http://localhost:3000/api/employer/applications/1" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "ACCEPTED"}'
```

---

## 🔍 Debugging

### Erreurs courantes

#### "Token invalide"
```
→ Vérifier localStorage.getItem('token')
→ Se reconnecter
```

#### "Accès refusé"
```
→ Vérifier le rôle de l'utilisateur
→ STUDENT pour postuler
→ EMPLOYER pour gérer candidatures
```

#### "Profil introuvable"
```
→ Compléter le profil (étudiant ou employeur)
→ Rafraîchir la page
```

#### "Offre non trouvée"
```
→ Vérifier que l'offre est active (is_active=1)
→ Vérifier que l'offre n'est pas bloquée
```

### Vérifier les logs
```
1. Ouvrir DevTools: F12
2. Onglet "Console" pour les erreurs JS
3. Onglet "Network" pour les requêtes API
4. Regarder le terminal: `npm run dev` pour les logs serveur
```

---

## ✅ Checklist Quick Test

- [ ] Compilation OK (`npm run build`)
- [ ] Serveur lance (`npm run dev`)
- [ ] Créer compte étudiant
- [ ] Compléter profil étudiant
- [ ] Consulter /jobs
- [ ] Voir détail offre /jobs/[id]
- [ ] Postuler à une offre
- [ ] Voir confirmation candidature
- [ ] Créer compte employeur
- [ ] Compléter profil employeur
- [ ] Voir candidatures en /employer/applications
- [ ] Ouvrir détail candidature
- [ ] Voir profil complet candidat
- [ ] Accepter/rejeter candidature
- [ ] Vérifier changement statut

---

## 🎯 Prochains tests

Après le quick test, consulter:
- `TEST_CANDIDATURES.md` - Guide de test complet avec 30+ scénarios
- `ARCHITECTURE_VISUELLE.md` - Diagrammes de l'architecture

---

**Vous êtes prêt à tester!** 🚀

Commencez par le quick test ci-dessus, puis consultez les guides détaillés.
