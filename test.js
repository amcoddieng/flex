const { Client } = require('pg');

// Insérez votre vraie chaîne de connexion ici
const connectionString = 'postgresql://neondb_owner:npg_Zg9dfD8xEKvN@ep-tiny-salad-al5cdk5z-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require';

async function testConnection() {
    console.log('🔌 Tentative de connexion à NeonDB...');
    
    const client = new Client({
        connectionString: connectionString,
        ssl: {
            rejectUnauthorized: false  // Important pour NeonDB
        }
    });

    try {
        await client.connect();
        console.log('✅ Connexion réussie !');
        
        // Test simple
        const result = await client.query('SELECT 1 as test');
        console.log('Test réussi :', result.rows[0]);
        
        await client.end();
    } catch (err) {
        console.error('❌ Erreur détaillée:', err.message);
        if (err.code) console.error('Code:', err.code);
        if (err.detail) console.error('Détail:', err.detail);
    }
}

testConnection();