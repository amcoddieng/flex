// Script pour vérifier les bases de données disponibles
const mysql = require('mysql2/promise');

async function checkDatabases() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  });

  try {
    console.log('🔍 Vérification des bases de données disponibles...\n');
    
    const [databases] = await connection.execute('SHOW DATABASES');
    console.log('📊 Bases de données trouvées:');
    databases.forEach(db => {
      console.log(`  • ${db.Database}`);
    });

    // Tester la connexion à chaque base potentiellement utilisée
    const possibleNames = ['flexjob', 'jobflex', 'job_flex', 'flex_job', 'flexjob_db'];
    
    for (const dbName of possibleNames) {
      try {
        await connection.execute(`USE ${dbName}`);
        console.log(`\n✅ Connexion réussie à la base: ${dbName}`);
        
        // Vérifier les tables dans cette base
        const [tables] = await connection.execute('SHOW TABLES');
        console.log(`📋 Tables dans ${dbName}:`);
        tables.forEach(table => {
          const tableName = table[`Tables_in_${dbName}`];
          console.log(`  • ${tableName}`);
        });
        
        // Si on trouve les tables attendues, c'est la bonne base
        const hasStudentProfile = tables.some(t => 
          t[`Tables_in_${dbName}`] === 'student_profile'
        );
        const hasJobApplication = tables.some(t => 
          t[`Tables_in_${dbName}`] === 'job_application'
        );
        
        if (hasStudentProfile && hasJobApplication) {
          console.log(`🎯 Base de données identifiée: ${dbName}`);
          
          // Compter les étudiants et candidatures
          const [studentCount] = await connection.execute('SELECT COUNT(*) as count FROM student_profile');
          const [appCount] = await connection.execute('SELECT COUNT(*) as count FROM job_application');
          
          console.log(`📊 Statistiques:`);
          console.log(`  • Étudiants: ${studentCount[0].count}`);
          console.log(`  • Candidatures: ${appCount[0].count}`);
        }
        
        break; // Sortir après avoir trouvé une base valide
      } catch (err) {
        console.log(`❌ Impossible d'accéder à la base: ${dbName}`);
      }
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await connection.end();
  }
}

checkDatabases();
