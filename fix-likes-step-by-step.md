# 🛠️ Guide de diagnostic et correction du système de likes

## 🚨 Problèmes possibles et solutions

### 1. **Problème : Tables manquantes ou incorrectes**
```bash
# Vérifier si les tables existent
mysql -u root -p -e "SHOW TABLES LIKE 'forum_%';" job_platform
mysql -u root -p -e "SHOW TABLES LIKE 'likes';" job_platform

# Solution : Exécuter le script de diagnostic
mysql -u root -p job_platform < debug-likes-system.sql
```

### 2. **Problème : Colonnes likes inexistantes**
```sql
-- Vérifier si la colonne likes existe dans forum_topic
DESCRIBE forum_topic;

-- Si la colonne n'existe pas, l'ajouter
ALTER TABLE forum_topic ADD COLUMN likes INT DEFAULT 0;
ALTER TABLE forum_reply ADD COLUMN likes INT DEFAULT 0;
```

### 3. **Problème : Triggers défectueux**
```sql
-- Supprimer tous les triggers existants
DROP TRIGGER IF EXISTS update_topic_likes_after_insert;
DROP TRIGGER IF EXISTS update_topic_likes_after_delete;
-- etc...

-- Recréer les triggers avec le script debug
```

### 4. **Problème : API inaccessible**
```bash
# Vérifier que le serveur Next.js tourne
npm run dev

# Tester l'API directement
curl http://localhost:3000/api/forum/topics
```

## 🔧 Étapes de correction

### Étape 1 : Diagnostic complet
```bash
# 1. Exécuter le script de diagnostic SQL
mysql -u root -p job_platform < debug-likes-system.sql

# 2. Tester l'API
node test-likes-api.js
```

### Étape 2 : Correction des problèmes SQL
```bash
# Si des erreurs apparaissent, corriger avec :
mysql -u root -p job_platform -e "
-- Supprimer et recréer la table likes
DROP TABLE IF EXISTS likes;
CREATE TABLE likes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    target_type ENUM('topic', 'reply', 'comment_reply') NOT NULL,
    target_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_like (user_id, target_type, target_id)
);
"
```

### Étape 3 : Test manuel
```sql
-- Test simple d'insertion
INSERT INTO likes (user_id, target_type, target_id) VALUES (1, 'topic', 1);

-- Vérifier le résultat
SELECT * FROM likes;
SELECT id, likes FROM forum_topic WHERE id = 1;
```

### Étape 4 : Intégration frontend
```tsx
// Dans votre composant, ajouter le token
const [token, setToken] = useState(null);

useEffect(() => {
  setToken(localStorage.getItem('token'));
}, []);

// Utiliser le composant LikeButton
<LikeButton
  targetType="topic"
  targetId={topic.id}
  token={token}
/>
```

## 🐛 Problèmes courants et leurs solutions

### "Table 'likes' doesn't exist"
**Solution :** Exécuter la création de table dans debug-likes-system.sql

### "Column 'likes' doesn't exist"
**Solution :** Ajouter la colonne avec ALTER TABLE

### "Trigger already exists"
**Solution :** Supprimer les triggers avant de les recréer

### "401 Unauthorized"
**Solution :** Vérifier l'authentification et le token JWT

### "404 Not Found"
**Solution :** Vérifier que l'API route existe dans app/api/forum/likes/

### "500 Internal Server Error"
**Solution :** Vérifier les logs du serveur et la connexion DB

## 📋 Checklist de déploiement

- [ ] Base de données accessible
- [ ] Tables forum_topic et forum_reply existent
- [ ] Colonnes likes présentes dans les tables
- [ ] Table likes créée avec contrainte unique
- [ ] Triggers créés et fonctionnels
- [ ] API Next.js accessible
- [ ] Token JWT fonctionnel
- [ ] Composants frontend intégrés

## 🧪 Tests de validation

### Test 1 : Base de données
```sql
-- Doit retourner des résultats
SELECT COUNT(*) FROM likes;
SELECT id, likes FROM forum_topic LIMIT 5;
```

### Test 2 : API
```bash
# Doit retourner 200 ou 401 (auth requis)
curl -H "Authorization: Bearer VOTRE_TOKEN" \
     http://localhost:3000/api/forum/likes?target=topic_1
```

### Test 3 : Frontend
```tsx
// Le bouton doit apparaître et réagir au clic
<LikeButton targetType="topic" targetId={1} token="votre_token" />
```

## 🚨 Si rien ne fonctionne

### Solution de secours : Version simplifiée
```sql
-- Supprimer tout et recommencer avec une version simple
DROP TABLE IF EXISTS likes;
DROP TRIGGER IF EXISTS update_topic_likes_after_insert;

-- Créer juste la table likes sans triggers
CREATE TABLE likes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    target_type ENUM('topic', 'reply') NOT NULL,
    target_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_like (user_id, target_type, target_id)
);
```

P utiliser les likes directement depuis la table likes sans triggers :
```sql
-- Pour compter les likes d'un topic
SELECT COUNT(*) as likes_count 
FROM likes 
WHERE target_type = 'topic' AND target_id = 1;
```

Cette approche simplifiée garantit que le système fonctionne même si les triggers posent problème.
