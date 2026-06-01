// app/api/forum/likes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { verifyToken, getTokenFromHeader } from '@/lib/jwt';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 20000,
});

// Fonction utilitaire pour déterminer le type de cible et l'ID
const parseTarget = (targetString: string) => {
  const parts = targetString.split('_');
  if (parts.length !== 2) return null;
  
  const [type, id] = parts;
  if (!['topic', 'reply', 'comment-reply'].includes(type)) return null;
  
  const targetId = parseInt(id);
  if (isNaN(targetId)) return null;
  
  return { 
    targetType: type === 'comment-reply' ? 'comment_reply' : type, 
    targetId 
  };
};

// Vérifier que la cible existe
const verifyTargetExists = async (targetType: string, targetId: number): Promise<boolean> => {
  try {
    let query = '';
    switch (targetType) {
      case 'topic':
        query = 'SELECT id FROM forum_topic WHERE id = $1';
        break;
      case 'reply':
        query = 'SELECT id FROM forum_reply WHERE id = $1';
        break;
      case 'comment_reply':
        query = 'SELECT id FROM comment_reply WHERE id = $1';
        break;
      default:
        return false;
    }
    
    const result = await pool.query(query, [targetId]);
    return result.rows.length > 0;
  } catch (error) {
    console.error('Erreur verification target:', error);
    return false;
  }
};

// Récupérer le statut de like et le total
export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromHeader(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const target = searchParams.get('target');
    
    if (!target) {
      return NextResponse.json({ error: 'Paramètre target requis' }, { status: 400 });
    }

    const parsed = parseTarget(target);
    if (!parsed) {
      return NextResponse.json({ error: 'Format de target invalide' }, { status: 400 });
    }

    const { targetType, targetId } = parsed;
    const userId = payload.userId;

    // Vérifier que la cible existe
    const targetExists = await verifyTargetExists(targetType, targetId);
    if (!targetExists) {
      return NextResponse.json({ error: 'Cible introuvable' }, { status: 404 });
    }

    try {
      // Vérifier si l'utilisateur a déjà liké
      const likeResult = await pool.query(
        'SELECT id FROM likes WHERE user_id = $1 AND target_type = $2 AND target_id = $3',
        [userId, targetType, targetId]
      );
      
      const isLiked = likeResult.rows.length > 0;

      // Récupérer le total des likes
      let countQuery = '';
      switch (targetType) {
        case 'topic':
          countQuery = 'SELECT likes FROM forum_topic WHERE id = $1';
          break;
        case 'reply':
          countQuery = 'SELECT likes FROM forum_reply WHERE id = $1';
          break;
        case 'comment_reply':
          countQuery = 'SELECT likes FROM comment_reply WHERE id = $1';
          break;
      }

      const countResult = await pool.query(countQuery, [targetId]);
      const totalLikes = parseInt(countResult.rows[0]?.likes) || 0;

      // Récupérer les utilisateurs récents qui ont liké (optionnel)
      const recentResult = await pool.query(
        `SELECT u.email, u.role 
         FROM likes l 
         JOIN "user" u ON l.user_id = u.id 
         WHERE l.target_type = $1 AND l.target_id = $2 
         ORDER BY l.created_at DESC 
         LIMIT 3`,
        [targetType, targetId]
      );

      const recentLikes = recentResult.rows.map(row => ({
        name: row.email,
        role: row.role
      }));

      return NextResponse.json({
        success: true,
        data: {
          isLiked,
          totalLikes,
          recentLikes
        }
      });

    } catch (error: any) {
      throw error;
    }

  } catch (error: any) {
    console.error('GET likes error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', message: error.message },
      { status: 500 }
    );
  }
}

// Toggle like/unlike
export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromHeader(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 403 });
    }

    const body = await request.json();
    const { target } = body;
    
    if (!target) {
      return NextResponse.json({ error: 'Paramètre target requis' }, { status: 400 });
    }

    const parsed = parseTarget(target);
    if (!parsed) {
      return NextResponse.json({ error: 'Format de target invalide' }, { status: 400 });
    }

    const { targetType, targetId } = parsed;
    const userId = payload.userId;

    // Vérifier que la cible existe
    const targetExists = await verifyTargetExists(targetType, targetId);
    if (!targetExists) {
      return NextResponse.json({ error: 'Cible introuvable' }, { status: 404 });
    }

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Vérifier que l'utilisateur ne like pas son propre contenu
      let authorQuery = '';
      switch (targetType) {
        case 'topic':
          authorQuery = 'SELECT author_id FROM forum_topic WHERE id = $1';
          break;
        case 'reply':
          authorQuery = 'SELECT author_id FROM forum_reply WHERE id = $1';
          break;
        case 'comment_reply':
          authorQuery = 'SELECT author_id FROM comment_reply WHERE id = $1';
          break;
      }

      const authorResult = await client.query(authorQuery, [targetId]);
      const authorId = authorResult.rows[0]?.author_id;

      // Récupérer l'ID de l'étudiant à partir du user_id
      const studentResult = await client.query(
        'SELECT id FROM student_profile WHERE user_id = $1',
        [userId]
      );
      
      const studentId = studentResult.rows[0]?.id;

      if (authorId === studentId) {
        await client.query('ROLLBACK');
        return NextResponse.json({ error: 'Vous ne pouvez pas liker votre propre contenu' }, { status: 403 });
      }

      // Vérifier si l'utilisateur a déjà liké
      const existingLike = await client.query(
        'SELECT id FROM likes WHERE user_id = $1 AND target_type = $2 AND target_id = $3',
        [userId, targetType, targetId]
      );

      let action: 'liked' | 'unliked';
      let likesChange = 0;
      
      if (existingLike.rows.length > 0) {
        // Unlike
        await client.query(
          'DELETE FROM likes WHERE user_id = $1 AND target_type = $2 AND target_id = $3',
          [userId, targetType, targetId]
        );
        action = 'unliked';
        likesChange = -1;
      } else {
        // Like
        await client.query(
          'INSERT INTO likes (user_id, target_type, target_id, created_at) VALUES ($1, $2, $3, NOW())',
          [userId, targetType, targetId]
        );
        action = 'liked';
        likesChange = 1;
      }

      // Mettre à jour le compteur de likes dans la table correspondante
      let updateQuery = '';
      switch (targetType) {
        case 'topic':
          updateQuery = 'UPDATE forum_topic SET likes = GREATEST(likes + $1, 0) WHERE id = $2';
          break;
        case 'reply':
          updateQuery = 'UPDATE forum_reply SET likes = GREATEST(likes + $1, 0) WHERE id = $2';
          break;
        case 'comment_reply':
          updateQuery = 'UPDATE comment_reply SET likes = GREATEST(likes + $1, 0) WHERE id = $2';
          break;
      }
      
      await client.query(updateQuery, [likesChange, targetId]);

      // Récupérer le nouveau total
      let countQuery = '';
      switch (targetType) {
        case 'topic':
          countQuery = 'SELECT likes FROM forum_topic WHERE id = $1';
          break;
        case 'reply':
          countQuery = 'SELECT likes FROM forum_reply WHERE id = $1';
          break;
        case 'comment_reply':
          countQuery = 'SELECT likes FROM comment_reply WHERE id = $1';
          break;
      }

      const countResult = await client.query(countQuery, [targetId]);
      const totalLikes = parseInt(countResult.rows[0]?.likes) || 0;

      await client.query('COMMIT');

      return NextResponse.json({
        success: true,
        data: {
          action,
          totalLikes,
          isLiked: action === 'liked'
        }
      });

    } catch (error: any) {
      await client.query('ROLLBACK');
      
      // Gérer les erreurs de contrainte unique
      if (error.code === '23505') { // PostgreSQL unique violation
        return NextResponse.json({ error: 'Vous avez déjà liké ce contenu' }, { status: 409 });
      }
      
      throw error;
    } finally {
      client.release();
    }

  } catch (error: any) {
    console.error('POST likes error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', message: error.message },
      { status: 500 }
    );
  }
}