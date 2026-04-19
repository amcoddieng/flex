# 🎨 Palette de Couleurs - Layout Admin

## 📋 Vue d'ensemble des couleurs utilisées

### 🏗️ STRUCTURE PRINCIPALE

```
┌─────────────────────────────────────────────────────────────────┐
│  FOND PRINCIPAL                                        │
│  bg-gray-50     #F9FAFB                              │
│  Gris très clair - Base de l'interface               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐  ┌─────────────────────────────────────┐
│  SIDEBAR        │  │  MAIN CONTENT                     │
│  bg-white       │  │  (hérite de bg-gray-50)        │
│  #FFFFFF         │  │  #F9FAFB                         │
│  Blanc pur      │  │  Gris très clair                 │
└─────────────────┘  └─────────────────────────────────────┘
```

### 🎨 Palette de Couleurs Détail

#### 📊 Gris - Hiérarchie visuelle
```
┌─────────────────────────────────────────────────────────────────┐
│  NIVEAUX DE GRIS                                      │
│                                                       │
│  text-gray-900    #111827   ██████████ Titres principaux    │
│  text-gray-600    #4B5563   ██████ Textes secondaires   │
│  text-gray-500    #6B7280   ████ Textes tertiaires    │
│  border-gray-300  #D1D5DB   ████ Bordures principales    │
│  border-gray-200  #E5E7EB   ██   Bordures secondaires  │
│  bg-gray-50      #F9FAFB   █    Fond principal          │
└─────────────────────────────────────────────────────────────────┘
```

#### 🔵 État Actif - Navigation
```
┌─────────────────────────────────────────────────────────────────┐
│  SÉLECTION ACTIVE                                     │
│                                                       │
│  variant="default"  #3B82F6   ██████████ Bouton actif      │
│  Bleu principal    #2563EB   ████████ Hover/état     │
│  Bleu foncé      #1D4ED8   ████████ Focus           │
└─────────────────────────────────────────────────────────────────┘
```

#### 🔴 Action Critique - Déconnexion
```
┌─────────────────────────────────────────────────────────────────┐
│  DÉCONNEXION                                          │
│                                                       │
│  text-red-600      #DC2626   ██████████ Texte principal    │
│  hover:text-red-700 #B91C1C   ████████ Hover            │
│  border-red-200    #FEE2E2   ██   Bordure           │
│  hover:bg-red-50   #FEF2F2   █    Fond au hover      │
└─────────────────────────────────────────────────────────────────┘
```

### 🖼️ Visualisation des Composants

#### 📱 Sidebar
```
┌─────────────────────────────────────────┐
│  bg-white                        │
│  #FFFFFF                          │
│  ┌─────────────────────────────┐   │
│  │  HEADER                  │   │
│  │  border-gray-200         │   │
│  │  #E5E7EB                │   │
│  └─────────────────────────────┘   │
│                                   │
│  ┌─────────────────────────────┐   │
│  │  NAVIGATION             │   │
│  │                         │   │
│  │  [🏠] Tableau de bord   │   │ ← Actif: Bleu
│  │  [✓] Validations       │   │ ← Inactif: Gris
│  │  [👥] Utilisateurs      │   │
│  │  [💼] Gestion Offres   │   │
│  │  [📄] Candidatures      │   │
│  │                         │   │
│  └─────────────────────────────┘   │
│                                   │
│  border-gray-300                 │
│  #D1D5DB                         │
└─────────────────────────────────────────┘
```

#### 🔝 Top Bar
```
┌─────────────────────────────────────────────────────────────────┐
│  TOP BAR                                              │
│                                                       │
│  bg-white #FFFFFF                                      │
│  ┌─────────────────────────────────────────────────────┐     │
│  │  [☰] Titre de page          [👤 Admin] [🚪] │     │
│  │  text-gray-900               text-gray-600  rouge   │     │
│  │  #111827                     #4B5563   #DC2626 │     │
│  └─────────────────────────────────────────────────────┘     │
│  border-gray-200 #E5E7EB                              │
└─────────────────────────────────────────────────────────────────┘
```

### 🎯 Sémantique des Couleurs

#### 📋 Signification
- **Gris 900** : Information la plus importante (titres)
- **Gris 600** : Information secondaire (descriptions)
- **Gris 300/200** : Séparations et bordures
- **Gris 50** : Fond de base (espace de travail)
- **Blanc** : Surfaces d'interaction (sidebar, top bar)
- **Bleu** : État actif/sélectionné
- **Rouge** : Action critique/danger (déconnexion)

#### 🔄 États Interactifs
```
NORMAL     →     ACTIF
Gris       →     Bleu
#4B5563    →     #3B82F6
Inactif    →     Sélectionné
```

#### 🎨 Accessibilité
- **Contraste élevé** : Texte foncé sur fond clair
- **Ratios WCAG** : Tous les contrastes > 4.5:1
- **États clairs** : Différenciation évidente des états

### 📱 Responsive Design

#### 📐 Adaptations
- **Desktop** : Sidebar complète (w-64)
- **Mobile** : Sidebar réduite (w-20)
- **Tablette** : Transition fluide entre les deux
- **Touch** : Zones de tap suffisamment grandes (44px minimum)

### 🎯 Recommandations

#### ✅ Bonnes pratiques
- **Cohérence** : Mêmes couleurs partout
- **Hiérarchie** : Gris 900 > 600 > 300 > 50
- **Sémantique** : Bleu = actif, Rouge = danger
- **Contraste** : Excellente lisibilité

#### 🎨 Extensions possibles
- **Thème sombre** : Inverser les gris
- **Thème couleur** : Utiliser d'autres couleurs primaires
- **Personnalisation** : Permettre le choix des couleurs

---

*Créé le 19 avril 2026 pour la documentation des couleurs du layout admin*
