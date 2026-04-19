const analyzeSystemColors = () => {
  console.log('=== ANALYSE DES COULEURS DU SYSTÈME ===');
  
  console.log('\n--- COULEURS DE THÈME PRINCIPALES ---');
  
  // Couleurs Light Mode
  console.log('\nLIGHT MODE:');
  const lightColors = {
    '--background': 'oklch(1 0 0) - Blanc pur',
    '--foreground': 'oklch(0.145 0 0) - Noir très foncé',
    '--card': 'oklch(1 0 0) - Blanc',
    '--card-foreground': 'oklch(0.145 0 0) - Noir très foncé',
    '--primary': 'oklch(0.205 0 0) - Gris très foncé',
    '--primary-foreground': 'oklch(0.985 0 0) - Blanc presque pur',
    '--secondary': 'oklch(0.97 0 0) - Gris très clair',
    '--secondary-foreground': 'oklch(0.205 0 0) - Gris très foncé',
    '--muted': 'oklch(0.97 0 0) - Gris très clair',
    '--muted-foreground': 'oklch(0.556 0 0) - Gris moyen',
    '--accent': 'oklch(0.97 0 0) - Gris très clair',
    '--accent-foreground': 'oklch(0.205 0 0) - Gris très foncé',
    '--destructive': 'oklch(0.577 0.245 27.325) - Rouge orangé',
    '--destructive-foreground': 'oklch(0.577 0.245 27.325) - Rouge orangé',
    '--border': 'oklch(0.922 0 0) - Gris clair',
    '--input': 'oklch(0.922 0 0) - Gris clair',
    '--ring': 'oklch(0.708 0 0) - Gris moyen'
  };
  
  Object.entries(lightColors).forEach(([varName, description]) => {
    console.log(`  ${varName}: ${description}`);
  });
  
  // Couleurs Dark Mode
  console.log('\nDARK MODE:');
  const darkColors = {
    '--background': 'oklch(0.145 0 0) - Gris très foncé',
    '--foreground': 'oklch(0.985 0 0) - Blanc presque pur',
    '--card': 'oklch(0.145 0 0) - Gris très foncé',
    '--card-foreground': 'oklch(0.985 0 0) - Blanc presque pur',
    '--primary': 'oklch(0.985 0 0) - Blanc presque pur',
    '--primary-foreground': 'oklch(0.205 0 0) - Gris très foncé',
    '--secondary': 'oklch(0.269 0 0) - Gris foncé',
    '--secondary-foreground': 'oklch(0.985 0 0) - Blanc presque pur',
    '--muted': 'oklch(0.269 0 0) - Gris foncé',
    '--muted-foreground': 'oklch(0.708 0 0) - Gris moyen',
    '--accent': 'oklch(0.269 0 0) - Gris foncé',
    '--accent-foreground': 'oklch(0.985 0 0) - Blanc presque pur',
    '--destructive': 'oklch(0.396 0.141 25.723) - Rouge foncé',
    '--destructive-foreground': 'oklch(0.637 0.237 25.331) - Rouge clair',
    '--border': 'oklch(0.269 0 0) - Gris foncé',
    '--input': 'oklch(0.269 0 0) - Gris foncé',
    '--ring': 'oklch(0.439 0 0) - Gris moyen-foncé'
  };
  
  Object.entries(darkColors).forEach(([varName, description]) => {
    console.log(`  ${varName}: ${description}`);
  });
  
  console.log('\n--- COULEURS DES GRAPHIQUES (CHART) ---');
  const chartColors = {
    'Light Mode': {
      '--chart-1': 'oklch(0.646 0.222 41.116) - Orange vif',
      '--chart-2': 'oklch(0.6 0.118 184.704) - Bleu cyan',
      '--chart-3': 'oklch(0.398 0.07 227.392) - Bleu foncé',
      '--chart-4': 'oklch(0.828 0.189 84.429) - Vert jaune',
      '--chart-5': 'oklch(0.769 0.188 70.08) - Vert olive'
    },
    'Dark Mode': {
      '--chart-1': 'oklch(0.488 0.243 264.376) - Bleu violet',
      '--chart-2': 'oklch(0.696 0.17 162.48) - Vert cyan',
      '--chart-3': 'oklch(0.769 0.188 70.08) - Vert olive',
      '--chart-4': 'oklch(0.627 0.265 303.9) - Rose violet',
      '--chart-5': 'oklch(0.645 0.246 16.439) - Orange rouge'
    }
  };
  
  Object.entries(chartColors).forEach(([mode, colors]) => {
    console.log(`\n${mode}:`);
    Object.entries(colors).forEach(([varName, description]) => {
      console.log(`  ${varName}: ${description}`);
    });
  });
  
  console.log('\n--- COULEURS SIDEBAR ---');
  const sidebarColors = {
    'Light Mode': {
      '--sidebar': 'oklch(0.985 0 0) - Blanc presque pur',
      '--sidebar-foreground': 'oklch(0.145 0 0) - Noir très foncé',
      '--sidebar-primary': 'oklch(0.205 0 0) - Gris très foncé',
      '--sidebar-primary-foreground': 'oklch(0.985 0 0) - Blanc presque pur',
      '--sidebar-accent': 'oklch(0.97 0 0) - Gris très clair',
      '--sidebar-accent-foreground': 'oklch(0.205 0 0) - Gris très foncé',
      '--sidebar-border': 'oklch(0.922 0 0) - Gris clair',
      '--sidebar-ring': 'oklch(0.708 0 0) - Gris moyen'
    },
    'Dark Mode': {
      '--sidebar': 'oklch(0.205 0 0) - Gris très foncé',
      '--sidebar-foreground': 'oklch(0.985 0 0) - Blanc presque pur',
      '--sidebar-primary': 'oklch(0.488 0.243 264.376) - Bleu violet',
      '--sidebar-primary-foreground': 'oklch(0.985 0 0) - Blanc presque pur',
      '--sidebar-accent': 'oklch(0.269 0 0) - Gris foncé',
      '--sidebar-accent-foreground': 'oklch(0.985 0 0) - Blanc presque pur',
      '--sidebar-border': 'oklch(0.269 0 0) - Gris foncé',
      '--sidebar-ring': 'oklch(0.439 0 0) - Gris moyen-foncé'
    }
  };
  
  Object.entries(sidebarColors).forEach(([mode, colors]) => {
    console.log(`\n${mode}:`);
    Object.entries(colors).forEach(([varName, description]) => {
      console.log(`  ${varName}: ${description}`);
    });
  });
  
  console.log('\n--- SYSTÈME DE COULEURS UTILISÉ ---');
  console.log('Format: OKLCH (Oklch color space)');
  console.log('Avantages:');
  console.log('  - Meilleure perception humaine des couleurs');
  console.log('  - Meilleure accessibilité');
  console.log('  - Meilleure cohérence entre light/dark mode');
  console.log('  - Support natif dans les navigateurs modernes');
  
  console.log('\n--- COHÉRENCE DES COULEURS ---');
  console.log('1. Thème principal: Gris monochrome avec accents colorés');
  console.log('2. Mode sombre: Inversion complète avec ajustements');
  console.log('3. Graphiques: Palette de 5 couleurs distinctes');
  console.log('4. Sidebar: Variantes spécifiques pour la navigation');
  
  console.log('\n--- UTILISATION DANS LES COMPOSANTS ---');
  console.log('Les couleurs sont appliquées via:');
  console.log('  - Variables CSS (--color-*)');
  console.log('  - Classes Tailwind (bg-primary, text-foreground)');
  console.log('  - Classes personnalisées (text-slate-600, bg-blue-500)');
  
  console.log('\n=== RÉSUMÉ DU SYSTÈME DE COULEURS ===');
  console.log('L\'application utilise un système de couleurs moderne basé sur OKLCH.');
  console.log('Thème principal: Gris monochrome avec accents colorés contrôlés.');
  console.log('Support complet du mode clair/sombre avec cohérence visuelle.');
  console.log('Palette de graphiques distincte pour les visualisations.');
  console.log('Système de sidebar avec variantes spécifiques.');
};

analyzeSystemColors();
