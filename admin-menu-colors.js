const analyzeAdminMenuColors = () => {
  console.log('=== COULEURS DU MENU ADMIN ===');
  
  console.log('\n--- STRUCTURE DU MENU ADMIN ---');
  
  const adminMenuStructure = {
    sidebar: {
      background: 'bg-white',
      border: 'border-r border-gray-200',
      width: 'w-64 (ouvert) / w-20 (fermé)',
      transition: 'transition-all duration-300 ease-in-out'
    },
    
    header: {
      background: 'bg-white',
      border: 'border-b border-gray-200',
      padding: 'p-4',
      title: {
        text: 'text-gray-900',
        weight: 'font-bold',
        size: 'text-xl'
      },
      toggleButton: {
        variant: 'variant="ghost"',
        size: 'size="sm"',
        padding: 'p-2',
        icon: 'h-4 w-4'
      }
    },
    
    navigation: {
      container: 'flex-1 p-4 space-y-2',
      menuItem: {
        component: 'Button',
        layout: 'w-full justify-start',
        padding: '!sidebarOpen ? "px-2" : ""',
        states: {
          active: 'variant="default"',
          normal: 'variant="ghost"'
        },
        icon: {
          size: 'h-4 w-4',
          position: 'début du bouton'
        },
        text: {
          position: 'ml-3',
          condition: 'sidebarOpen && <span>'
        }
      }
    }
  };
  
  console.log('\n--- COULEURS PAR ÉTAT DU MENU ---');
  
  const menuColors = {
    // État normal (non sélectionné)
    normal: {
      button: 'variant="ghost"',
      background: 'transparent',
      text: 'text-gray-700',
      icon: 'text-gray-500',
      hover: {
        background: 'hover:bg-gray-100',
        text: 'hover:text-gray-900',
        icon: 'hover:text-gray-900'
      }
    },
    
    // État actif (sélectionné)
    active: {
      button: 'variant="default"',
      background: 'bg-gray-900', // Couleur principale du système
      text: 'text-white',
      icon: 'text-white',
      hover: {
        background: 'hover:bg-gray-800',
        text: 'text-white',
        icon: 'text-white'
      }
    },
    
    // État focus
    focus: {
      ring: 'focus:ring-2 focus:ring-gray-300',
      ringOffset: 'focus:ring-offset-2 focus:ring-offset-white'
    }
  };
  
  console.log('\n--- DÉTAIL DES COULEURS ---');
  
  Object.entries(menuColors).forEach(([state, colors]) => {
    console.log(`\n${state.toUpperCase()}:`);
    console.log(`  Bouton: ${colors.button}`);
    console.log(`  Background: ${colors.background}`);
    console.log(`  Texte: ${colors.text}`);
    console.log(`  Icône: ${colors.icon}`);
    
    if (colors.hover) {
      console.log(`  Hover:`);
      console.log(`    Background: ${colors.hover.background}`);
      console.log(`    Texte: ${colors.hover.text}`);
      console.log(`    Icône: ${colors.hover.icon}`);
    }
    
    if (colors.ring) {
      console.log(`  Focus: ${colors.ring}`);
      console.log(`  Ring Offset: ${colors.ringOffset}`);
    }
  });
  
  console.log('\n--- COULEURS DU CONTENEUR MENU ---');
  
  Object.entries(adminMenuStructure).forEach(([section, properties]) => {
    console.log(`\n${section.toUpperCase()}:`);
    
    if (typeof properties === 'object') {
      Object.entries(properties).forEach(([prop, value]) => {
        if (typeof value === 'object') {
          console.log(`  ${prop}:`);
          Object.entries(value).forEach(([subProp, subValue]) => {
            console.log(`    ${subProp}: ${subValue}`);
          });
        } else {
          console.log(`  ${prop}: ${value}`);
        }
      });
    }
  });
  
  console.log('\n--- SYSTÈME DE COULEURS DU MENU ADMIN ---');
  
  const adminMenuColorSystem = {
    primary: {
      background: 'bg-gray-900',
      text: 'text-white',
      icon: 'text-white',
      hover: 'hover:bg-gray-800'
    },
    
    secondary: {
      background: 'transparent',
      text: 'text-gray-700',
      icon: 'text-gray-500',
      hover: 'hover:bg-gray-100 hover:text-gray-900'
    },
    
    container: {
      sidebar: 'bg-white',
      border: 'border-gray-200',
      header: 'border-gray-200'
    },
    
    typography: {
      title: 'text-gray-900 font-bold text-xl',
      normal: 'text-gray-700',
      muted: 'text-gray-500'
    },
    
    interactions: {
      focus: 'focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-white',
      transition: 'transition-all duration-300 ease-in-out'
    }
  };
  
  console.log('\nPALETTE COMPLÈTE:');
  Object.entries(adminMenuColorSystem).forEach(([category, colors]) => {
    console.log(`\n${category}:`);
    Object.entries(colors).forEach(([name, color]) => {
      console.log(`  ${name}: ${color}`);
    });
  });
  
  console.log('\n--- COMPARAISON AVEC AUTRES MENUS ---');
  
  const comparison = {
    adminMenu: {
      active: 'bg-gray-900 text-white',
      normal: 'transparent text-gray-700 hover:bg-gray-100',
      container: 'bg-white border-gray-200'
    },
    
    studentMenu: {
      active: 'bg-blue-600 text-white shadow-md',
      normal: 'transparent text-gray-700 hover:bg-gray-100 hover:text-blue-600',
      container: 'bg-white border-gray-200'
    },
    
    employerMenu: {
      active: 'bg-blue-600 text-white shadow-md',
      normal: 'transparent text-gray-700 hover:bg-gray-100 hover:text-blue-600',
      container: 'bg-white border-gray-200'
    }
  };
  
  Object.entries(comparison).forEach(([menu, colors]) => {
    console.log(`\n${menu}:`);
    console.log(`  Actif: ${colors.active}`);
    console.log(`  Normal: ${colors.normal}`);
    console.log(`  Conteneur: ${colors.container}`);
  });
  
  console.log('\n--- RECOMMANDATION D\'HARMONISATION ---');
  console.log('Pour harmoniser tous les menus avec le système admin:');
  console.log('1. Utiliser bg-gray-900 pour l\'état actif au lieu de bg-blue-600');
  console.log('2. Garder text-white pour les éléments actifs');
  console.log('3. Utiliser text-gray-700 pour les éléments normaux');
  console.log('4. Utiliser hover:bg-gray-100 pour les états hover');
  console.log('5. Maintenir les conteneurs bg-white border-gray-200');
  
  return adminMenuColorSystem;
};

analyzeAdminMenuColors();
