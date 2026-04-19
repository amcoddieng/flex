const defineAdminColorPalette = () => {
  console.log('=== PALETTE DE COULEURS ADMIN (RÉFÉRENCE) ===');
  
  const adminColorPalette = {
    // Couleurs principales des cards
    primary: {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      purple: 'bg-purple-500',
      orange: 'bg-orange-500',
      yellow: 'bg-yellow-500',
      indigo: 'bg-indigo-500',
      teal: 'bg-teal-500',
      pink: 'bg-pink-500'
    },
    
    // Mapping des couleurs par type de contenu
    contentMapping: {
      // Utilisateurs et comptes
      users: 'bg-blue-500',
      students: 'bg-green-500',
      employers: 'bg-purple-500',
      admins: 'bg-blue-500',
      
      // Emploi et carrières
      jobs: 'bg-orange-500',
      applications: 'bg-indigo-500',
      interviews: 'bg-green-500',
      offers: 'bg-orange-500',
      
      // Validation et modération
      validations: 'bg-yellow-500',
      pending: 'bg-yellow-500',
      approved: 'bg-green-500',
      rejected: 'bg-red-500',
      
      // Communication
      messages: 'bg-purple-500',
      conversations: 'bg-blue-500',
      notifications: 'bg-yellow-500',
      
      // Activité et statistiques
      activity: 'bg-teal-500',
      statistics: 'bg-blue-500',
      charts: 'bg-indigo-500',
      
      // Actions et navigation
      primary: 'bg-blue-500',
      secondary: 'bg-gray-500',
      accent: 'bg-purple-500',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      danger: 'bg-red-500',
      
      // Éléments spécifiques
      registrations: 'bg-pink-500',
      profile: 'bg-purple-500',
      forum: 'bg-indigo-500',
      search: 'bg-blue-500'
    },
    
    // Couleurs pour les icônes et éléments UI
    iconColors: {
      primary: 'text-blue-600',
      success: 'text-green-600',
      warning: 'text-yellow-600',
      danger: 'text-red-600',
      info: 'text-indigo-600',
      muted: 'text-gray-600'
    },
    
    // Couleurs pour les backgrounds
    backgroundColors: {
      primary: 'bg-blue-50',
      success: 'bg-green-50',
      warning: 'bg-yellow-50',
      danger: 'bg-red-50',
      info: 'bg-indigo-50',
      muted: 'bg-gray-50'
    }
  };
  
  console.log('\n--- COULEURS PRINCIPALES ---');
  Object.entries(adminColorPalette.primary).forEach(([name, color]) => {
    console.log(`${name}: ${color}`);
  });
  
  console.log('\n--- MAPPING PAR TYPE DE CONTENU ---');
  Object.entries(adminColorPalette.contentMapping).forEach(([type, color]) => {
    console.log(`${type}: ${color}`);
  });
  
  console.log('\n--- COULEURS DES ICÔNES ---');
  Object.entries(adminColorPalette.iconColors).forEach(([type, color]) => {
    console.log(`${type}: ${color}`);
  });
  
  console.log('\n--- COULEURS DES BACKGROUNDS ---');
  Object.entries(adminColorPalette.backgroundColors).forEach(([type, color]) => {
    console.log(`${type}: ${color}`);
  });
  
  console.log('\n--- RÈGLES D\'APPLICATION ---');
  console.log('1. Utiliser bg-blue-500 pour les éléments principaux');
  console.log('2. Utiliser bg-green-500 pour le succès et la progression');
  console.log('3. Utiliser bg-purple-500 pour les informations secondaires');
  console.log('4. Utiliser bg-yellow-500 pour les alertes et attentes');
  console.log('5. Utiliser bg-orange-500 pour les offres et opportunités');
  console.log('6. Utiliser bg-indigo-500 pour les candidatures et données');
  console.log('7. Utiliser bg-teal-500 pour l\'activité et les statistiques');
  console.log('8. Utiliser bg-pink-500 pour les inscriptions et nouveaux éléments');
  
  return adminColorPalette;
};

module.exports = defineAdminColorPalette;
