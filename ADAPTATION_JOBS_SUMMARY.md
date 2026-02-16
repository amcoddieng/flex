# Adaptation de la Page Jobs

## Résumé des modifications

La page `/app/jobs/page.tsx` a été adaptée pour récupérer les jobs depuis l'API au lieu d'utiliser des données statiques, similaire à l'espace employeur.

### Fichiers modifiés

#### 1. `/app/jobs/page.tsx`

**Changements principaux:**

- **Ajout des imports JWT**: `useRouter` et `decodeToken` pour gérer l'authentification optionnelle
- **Nouveau type `APIJob`**: Type définissant la structure des jobs provenant de l'API
- **Fonction `transformAPIJobToUI`**: Convertit les jobs de l'API au format attendu par le composant JobCard
- **État de chargement**: 
  - `loading`: Indicateur de chargement des données
  - `error`: Gestion des erreurs
  - `jobs`: Stockage des jobs récupérées
  - `page`: Gestion de la pagination
  - `total`: Total des offres disponibles
  
- **Fonction `fetchJobs()`**: 
  - Récupère les jobs depuis `/api/job?page=X&limit=20`
  - Supporte la recherche via le paramètre `search`
  - Optionnel: Authorization header si un token est présent
  - En cas d'erreur, affiche un message mais continue avec les données en cache
  
- **Catégories dynamiques**: Extraites à partir des jobs récupérées via `job.service_type`
  
- **Filtres et recherche**:
  - Recherche en temps réel intégrée
  - Filtres par type de contrat, localisation, et catégorie
  - Réinitialisation intelligente lors du changement de recherche
  
- **Interface améliorée**:
  - État de chargement avec spinner
  - Affichage des erreurs avec fallback sur les données en cache
  - Bouton "Charger plus" fonctionnel basé sur la pagination
  - Message "Aucune offre trouvée" avec option de réinitialisation

#### 2. `/app/api/job/route.ts`

**Nouvel endpoint GET:**

- **Route**: `GET /api/job`
- **Paramètres**:
  - `page`: Numéro de page (par défaut: 1)
  - `limit`: Nombre de résultats par page (par défaut: 20)
  - `search`: Recherche par titre, entreprise ou description
  
- **Filtres automatiques**:
  - Récupère uniquement les offres actives (`is_active = 1`)
  - Exclut les offres bloquées (`blocked = 0`)
  
- **Réponse**:
  ```json
  {
    "success": true,
    "data": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5
    }
  }
  ```

- **Avantages**:
  - Endpoint public (pas d'authentification requise)
  - Recherche performante côté serveur
  - Pagination correctement gérée
  - Réutilisable par d'autres clients

### Comportement

1. **Au chargement**: 
   - Récupère les jobs depuis l'API
   - Affiche un message "Chargement des offres..."
   - Transforme les données au format UI

2. **Lors de la recherche**:
   - Réinitialise à la page 1
   - Recalcule les catégories basées sur les résultats

3. **En cas d'erreur**:
   - Affiche un message d'erreur
   - Propose d'utiliser les données en cache (données d'exemple)
   - Permet à l'utilisateur de continuer avec les données disponibles

4. **Pagination**:
   - Affiche le bouton "Charger plus" seulement s'il y a plus de résultats
   - Charge les jobs supplémentaires sans remplacer les existantes

### Avantages de cette adaptation

- ✅ Données en temps réel depuis la base de données
- ✅ Recherche performante côté serveur
- ✅ Pagination automatique
- ✅ Authentification optionnelle (pas requise pour les visiteurs)
- ✅ Catégories dynamiques basées sur les données réelles
- ✅ Gestion gracieuse des erreurs
- ✅ Interface cohérente avec l'espace employeur
- ✅ Support pour filtres et recherche avancée

### Prochaines étapes possibles

- Ajouter des filtres supplémentaires (salaire min/max, type de paiement)
- Implémenter un système de favoris pour les utilisateurs connectés
- Ajouter des statistiques de vue des offres
- Intégrer une notification de nouvelles offres
