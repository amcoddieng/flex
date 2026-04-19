const commentReplyStructure = () => {
  console.log('=== STRUCTURE DE LA TABLE comment_reply ===');
  
  console.log('\n--- TABLE comment_reply POUR LES RÉPONSES AUX COMMENTAIRES ---');
  
  const tableStructure = {
    name: 'comment_reply',
    purpose: 'Stocker les réponses aux commentaires du forum (réponses imbriquées)',
    relationship: 'comment_reply.reply_id → forum_reply.id',
    
    columns: {
      id: {
        type: 'INT PRIMARY KEY AUTO_INCREMENT',
        description: 'Identifiant unique de la réponse'
      },
      
      reply_id: {
        type: 'INT NOT NULL',
        description: 'ID du commentaire de forum auquel cette réponse répond',
        foreign_key: 'FOREIGN KEY (reply_id) REFERENCES forum_reply(id) ON DELETE CASCADE',
        relationship: 'comment_reply → forum_reply'
      },
      
      author_id: {
        type: 'INT NOT NULL',
        description: 'ID de l\'étudiant qui a écrit cette réponse',
        foreign_key: 'FOREIGN KEY (author_id) REFERENCES student_profile(id) ON DELETE SET NULL',
        relationship: 'comment_reply → student_profile'
      },
      
      author_name: {
        type: 'VARCHAR(255) NOT NULL',
        description: 'Nom de l\'auteur (redondant pour performance)'
      },
      
      author_university: {
        type: 'VARCHAR(255)',
        description: 'Université de l\'auteur (optionnel)'
      },
      
      content: {
        type: 'TEXT NOT NULL',
        description: 'Contenu de la réponse au commentaire'
      },
      
      likes: {
        type: 'INT DEFAULT 0',
        description: 'Nombre de likes reçus par cette réponse'
      },
      
      is_helpful: {
        type: 'BOOLEAN DEFAULT FALSE',
        description: 'Indique si cette réponse est marquée comme utile'
      },
      
      created_at: {
        type: 'DATETIME DEFAULT CURRENT_TIMESTAMP',
        description: 'Date et heure de création de la réponse'
      }
    },
    
    indexes: [
      'CREATE INDEX idx_comment_reply_reply_id ON comment_reply(reply_id)',
      'CREATE INDEX idx_comment_reply_author_id ON comment_reply(author_id)',
      'CREATE INDEX idx_comment_reply_created_at ON comment_reply(created_at)'
    ]
  };
  
  console.log('\nDÉTAILS DES COLONNES:');
  Object.entries(tableStructure.columns).forEach(([column, details]) => {
    console.log(`\n${column.toUpperCase()}:`);
    console.log(`  Type: ${details.type}`);
    console.log(`  Description: ${details.description}`);
    if (details.foreign_key) {
      console.log(`  Foreign Key: ${details.foreign_key}`);
    }
    if (details.relationship) {
      console.log(`  Relationship: ${details.relationship}`);
    }
  });
  
  console.log('\nINDEXES POUR OPTIMISATION:');
  tableStructure.indexes.forEach((index, i) => {
    console.log(`  ${i + 1}. ${index}`);
  });
  
  console.log('\n--- RELATIONS ENTRE TABLES ---');
  
  const relationships = {
    'forum_topic': {
      columns: ['id', 'title', 'content', 'author_id', 'created_at'],
      description: 'Sujets du forum'
    },
    
    'forum_reply': {
      columns: ['id', 'topic_id', 'author_id', 'content', 'likes', 'created_at'],
      description: 'Commentaires sur les sujets'
    },
    
    'comment_reply': {
      columns: ['id', 'reply_id', 'author_id', 'content', 'likes', 'created_at'],
      description: 'Réponses aux commentaires (IMBRIQUÉES)'
    },
    
    'student_profile': {
      columns: ['id', 'first_name', 'last_name', 'email', 'university'],
      description: 'Profils des étudiants'
    }
  };
  
  console.log('\nHiérarchie des données:');
  console.log('1. forum_topic (sujets)');
  console.log('   └── 2. forum_reply (commentaires sur sujets)');
  console.log('        └── 3. comment_reply (réponses aux commentaires)');
  
  console.log('\nDÉTAILS DES RELATIONS:');
  Object.entries(relationships).forEach(([table, details]) => {
    console.log(`\n${table.toUpperCase()}:`);
    console.log(`  Colonnes: ${details.columns.join(', ')}`);
    console.log(`  Description: ${details.description}`);
  });
  
  console.log('\n--- EXEMPLES DE REQUÊTES ---');
  
  const queries = {
    // Récupérer toutes les réponses à un commentaire
    getReplies: `
      SELECT 
        cr.id,
        cr.reply_id,
        cr.author_id,
        cr.author_name,
        cr.author_university,
        cr.content,
        cr.likes,
        cr.is_helpful,
        cr.created_at
      FROM comment_reply cr
      WHERE cr.reply_id = ?
      ORDER BY cr.created_at ASC
    `,
    
    // Récupérer les réponses avec détails du commentaire parent
    getRepliesWithParent: `
      SELECT 
        cr.id,
        cr.reply_id,
        cr.author_id,
        cr.author_name,
        cr.author_university,
        cr.content,
        cr.likes,
        cr.is_helpful,
        cr.created_at,
        fr.content as reply_content,
        ft.title as topic_title
      FROM comment_reply cr
      JOIN forum_reply fr ON cr.reply_id = fr.id
      JOIN forum_topic ft ON fr.topic_id = ft.id
      WHERE cr.reply_id = ?
      ORDER BY cr.created_at ASC
    `,
    
    // Compter les réponses par commentaire
    countReplies: `
      SELECT 
        reply_id,
        COUNT(*) as reply_count
      FROM comment_reply
      GROUP BY reply_id
    `,
    
    // Récupérer les statistiques d'un étudiant
    getStudentStats: `
      SELECT 
        COUNT(DISTINCT cr.id) as comment_replies_count,
        SUM(cr.likes) as total_reply_likes,
        COUNT(CASE WHEN cr.is_helpful = TRUE THEN 1 END) as helpful_replies
      FROM comment_reply cr
      WHERE cr.author_id = ?
    `
  };
  
  console.log('\nRequêtes SQL principales:');
  Object.entries(queries).forEach(([name, query]) => {
    console.log(`\n${name}:`);
    console.log(query.trim());
  });
  
  console.log('\n--- DONNÉES D\'EXEMPLE ---');
  
  const exampleData = {
    comment_replies: [
      {
        id: 1,
        reply_id: 5, // Répond au commentaire ID 5
        author_id: 2,
        author_name: "Marie Dupont",
        author_university: "Université Paris 1",
        content: "Merci pour cette information ! C'est très utile.",
        likes: 3,
        is_helpful: true,
        created_at: "2024-01-15 10:30:00"
      },
      {
        id: 2,
        reply_id: 5, // Autre réponse au même commentaire
        author_id: 3,
        author_name: "Thomas Martin",
        author_university: "ENS Lyon",
        content: "Je confirme, cette approche fonctionne bien.",
        likes: 1,
        is_helpful: false,
        created_at: "2024-01-15 11:15:00"
      }
    ]
  };
  
  console.log('\nExemples de données comment_reply:');
  exampleData.comment_replies.forEach((reply, index) => {
    console.log(`\nRéponse ${index + 1}:`);
    console.log(`  ID: ${reply.id}`);
    console.log(`  Reply_ID: ${reply.reply_id} (répond au commentaire ${reply.reply_id})`);
    console.log(`  Auteur: ${reply.author_name} (${reply.author_university})`);
    console.log(`  Contenu: "${reply.content}"`);
    console.log(`  Likes: ${reply.likes}`);
    console.log(`  Utile: ${reply.is_helpful ? 'Oui' : 'Non'}`);
    console.log(`  Date: ${reply.created_at}`);
  });
  
  console.log('\n--- API ENDPOINTS NÉCESSAIRES ---');
  
  const apiEndpoints = {
    create: {
      method: 'POST',
      path: '/api/student/forum/replies/[replyId]/replies',
      description: 'Créer une réponse à un commentaire',
      body: {
        content: "string (required)",
        author_id: "number (from token)"
      }
    },
    
    get: {
      method: 'GET',
      path: '/api/student/forum/replies/[replyId]/replies',
      description: 'Récupérer toutes les réponses à un commentaire',
      response: {
        success: true,
        data: "comment_reply[]"
      }
    },
    
    like: {
      method: 'POST',
      path: '/api/student/forum/comment-replies/[id]/like',
      description: 'Aimer une réponse à un commentaire',
      response: {
        success: true,
        message: "Like ajouté avec succès"
      }
    },
    
    delete: {
      method: 'DELETE',
      path: '/api/student/forum/comment-replies/[id]',
      description: 'Supprimer sa propre réponse',
      authorization: 'author_id must match token user_id'
    }
  };
  
  console.log('\nAPI endpoints pour comment_reply:');
  Object.entries(apiEndpoints).forEach(([action, details]) => {
    console.log(`\n${action.toUpperCase()}:`);
    console.log(`  Method: ${details.method}`);
    console.log(`  Path: ${details.path}`);
    console.log(`  Description: ${details.description}`);
    if (details.body) {
      console.log(`  Body: ${JSON.stringify(details.body, null, 6)}`);
    }
    if (details.response) {
      console.log(`  Response: ${JSON.stringify(details.response, null, 6)}`);
    }
  });
  
  console.log('\n--- INTÉGRATION FRONTEND ---');
  
  const frontendIntegration = {
    dataStructure: {
      interface: 'CommentReply',
      fields: [
        'id: number',
        'reply_id: number',
        'author_id: number',
        'author_name: string',
        'author_university: string',
        'content: string',
        'likes: number',
        'is_helpful: boolean',
        'created_at: string'
      ]
    },
    
    stateManagement: {
      commentReplies: 'Map<number, CommentReply[]>',
      showAllReplies: 'Map<number, boolean>',
      newReplyContent: 'Map<number, string>'
    },
    
    components: [
      'ReplyInput (pour chaque commentaire)',
      'ReplyList (max 2 + voir plus)',
      'ReplyItem (avatar + contenu + actions)',
      'LikeButton (pour chaque réponse)'
    ]
  };
  
  console.log('\nIntégration frontend:');
  console.log('Interface TypeScript:');
  frontendIntegration.dataStructure.fields.forEach(field => {
    console.log(`  ${field}`);
  });
  
  console.log('\nGestion d\'état:');
  Object.entries(frontendIntegration.stateManagement).forEach(([state, type]) => {
    console.log(`  ${state}: ${type}`);
  });
  
  console.log('\nComposants nécessaires:');
  frontendIntegration.components.forEach(component => {
    console.log(`  - ${component}`);
  });
  
  console.log('\n--- RÉSUMÉ ---');
  console.log('La table comment_reply permet:');
  console.log('1. Réponses imbriquées aux commentaires du forum');
  console.log('2. Hiérarchie: topic → reply → comment_reply');
  console.log('3. Likes et marquage "utile" sur les réponses');
  console.log('4. Traçabilité complète avec auteur et dates');
  console.log('5. Performance avec indexes appropriés');
  console.log('6. Intégration frontend avec état réactif');
  
  return tableStructure;
};

commentReplyStructure();
