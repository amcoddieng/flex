const analyzeAdminSystemColors = () => {
  console.log('=== ANALYSE DES COULEURS DU SYSTÈME ADMIN ===');
  
  console.log('\n--- COULEURS DU LAYOUT ADMIN (RÉFÉRENCE SYSTÈME) ---');
  
  const adminSystemColors = {
    // Layout général
    layout: {
      background: 'bg-gray-50',
      sidebar: 'bg-white',
      sidebarBorder: 'border-gray-200',
      topBar: 'bg-white',
      topBarBorder: 'border-gray-200',
      content: 'bg-white'
    },
    
    // Textes
    text: {
      primary: 'text-gray-900',
      secondary: 'text-gray-600',
      muted: 'text-gray-500',
      accent: 'text-blue-600',
      danger: 'text-red-600',
      dangerHover: 'text-red-700'
    },
    
    // Boutons et interactions
    buttons: {
      primary: 'border-blue-600', // Spinner border
      danger: 'text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200',
      outline: 'border-gray-200'
    },
    
    // États
    states: {
      loading: 'border-b-2 border-blue-600',
      active: 'text-blue-600',
      hover: 'hover:bg-gray-50'
    }
  };
  
  console.log('\n--- COULEURS DU LAYOUT ÉTUDIANT (ACTUEL) ---');
  
  const studentCurrentColors = {
    layout: {
      background: 'bg-slate-50',
      sidebar: 'bg-white/90 backdrop-blur-md',
      sidebarBorder: 'border-slate-200/50',
      topBar: 'bg-white/90 backdrop-blur-md',
      topBarBorder: 'border-slate-200/50',
      content: 'bg-white'
    },
    
    text: {
      primary: 'text-slate-900',
      secondary: 'text-slate-600',
      muted: 'text-slate-500',
      accent: 'text-blue-600',
      danger: 'text-red-600',
      special: 'text-white' // Pour gradients
    },
    
    // Éléments spéciaux
    special: {
      logo: 'bg-gradient-to-r from-blue-600 to-purple-600',
      activeMenu: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md',
      profileAvatar: 'bg-gradient-to-r from-blue-500 to-purple-600',
      notifications: 'bg-blue-100 text-blue-600',
      badges: 'bg-orange-400'
    }
  };
  
  console.log('\n--- COMPARAISON ADMIN vs ÉTUDIANT ---');
  
  const comparison = [
    {
      element: 'Background principal',
      admin: adminSystemColors.layout.background,
      student: studentCurrentColors.layout.background,
      status: adminSystemColors.layout.background !== studentCurrentColors.layout.background ? 'DIFFÉRENT' : 'IDENTIQUE'
    },
    {
      element: 'Sidebar background',
      admin: adminSystemColors.layout.sidebar,
      student: studentCurrentColors.layout.sidebar,
      status: adminSystemColors.layout.sidebar !== studentCurrentColors.layout.sidebar ? 'DIFFÉRENT' : 'IDENTIQUE'
    },
    {
      element: 'Texte principal',
      admin: adminSystemColors.text.primary,
      student: studentCurrentColors.text.primary,
      status: adminSystemColors.text.primary !== studentCurrentColors.text.primary ? 'DIFFÉRENT' : 'IDENTIQUE'
    },
    {
      element: 'Texte secondaire',
      admin: adminSystemColors.text.secondary,
      student: studentCurrentColors.text.secondary,
      status: adminSystemColors.text.secondary !== studentCurrentColors.text.secondary ? 'DIFFÉRENT' : 'IDENTIQUE'
    },
    {
      element: 'Border couleurs',
      admin: adminSystemColors.layout.sidebarBorder,
      student: studentCurrentColors.layout.sidebarBorder,
      status: adminSystemColors.layout.sidebarBorder !== studentCurrentColors.layout.sidebarBorder ? 'DIFFÉRENT' : 'IDENTIQUE'
    }
  ];
  
  comparison.forEach(item => {
    console.log(`${item.element}:`);
    console.log(`  Admin: ${item.admin}`);
    console.log(`  Étudiant: ${item.student}`);
    console.log(`  Statut: ${item.status}`);
    console.log('');
  });
  
  console.log('--- CORRECTIONS NÉCESSAIRES ---');
  console.log('Pour harmoniser avec le système admin:');
  console.log('1. bg-slate-50 -> bg-gray-50');
  console.log('2. border-slate-200/50 -> border-gray-200');
  console.log('3. text-slate-900 -> text-gray-900');
  console.log('4. text-slate-600 -> text-gray-600');
  console.log('5. bg-white/90 backdrop-blur-md -> bg-white');
  console.log('6. Supprimer les gradients (from-blue-600 to-purple-600)');
  console.log('7. Utiliser bg-blue-600 pour les éléments principaux');
  
  console.log('\n--- COULEURS À APPLIQUER PARTOUT ---');
  const universalColors = {
    backgrounds: {
      main: 'bg-gray-50',
      cards: 'bg-white',
      sidebar: 'bg-white',
      header: 'bg-white'
    },
    borders: {
      primary: 'border-gray-200',
      secondary: 'border-gray-100'
    },
    texts: {
      primary: 'text-gray-900',
      secondary: 'text-gray-600',
      muted: 'text-gray-500',
      accent: 'text-blue-600',
      danger: 'text-red-600'
    },
    interactions: {
      hover: 'hover:bg-gray-50',
      active: 'bg-blue-600 text-white',
      focus: 'border-blue-600'
    }
  };
  
  Object.entries(universalColors).forEach(([category, colors]) => {
    console.log(`\n${category.toUpperCase()}:`);
    Object.entries(colors).forEach(([name, color]) => {
      console.log(`  ${name}: ${color}`);
    });
  });
  
  console.log('\n=== ACTION REQUISE ===');
  console.log('Appliquer les couleurs du système admin (gray-*) à tous les layouts');
  console.log('Remplacer les couleurs slate-* par gray-*');
  console.log('Supprimer les backdrop-blur-md et transparences');
  console.log('Utiliser des couleurs solides au lieu de gradients');
  
  return universalColors;
};

analyzeAdminSystemColors();
