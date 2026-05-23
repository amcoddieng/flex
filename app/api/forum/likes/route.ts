import { NextRequest, NextResponse } from 'next/server';
import mysql from '@/lib/db';
import { verifyToken, getTokenFromHeader } from '@/lib/jwt';

const pool = mysql.createPool();

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
  const connection = await pool.getConnection();
  try {
    let query = '';
    switch (targetType) {
      case 'topic':
        query = 'SELECT id FROM forum_topic WHERE id = ?';
        break;
      case 'reply':
        query = 'SELECT id FROM forum_reply WHERE id = ?';
        break;
      case 'comment_reply':
        query = 'SELECT id FROM comment_reply WHERE id = ?';
        break;
      default:
        return false;
    }
    
    const [rows] = await connection.execute(query, [targetId]);
    return (rows as any[]).length > 0;
  } finally {
    connection.release();
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

    const connection = await pool.getConnection();
    try {
      // Vérifier si l'utilisateur a déjà liké
      const [likeRows] = await connection.execute(
        'SELECT id FROM likes WHERE user_id = ? AND target_type = ? AND target_id = ?',
        [userId, targetType, targetId]
      );
      
      const isLiked = (likeRows as any[]).length > 0;

      // Récupérer le total des likes
      let countQuery = '';
      switch (targetType) {
        case 'topic':
          countQuery = 'SELECT likes FROM forum_topic WHERE id = ?';
          break;
        case 'reply':
          countQuery = 'SELECT likes FROM forum_reply WHERE id = ?';
          break;
        case 'comment_reply':
          countQuery = 'SELECT likes FROM comment_reply WHERE id = ?';
          break;
      }

      const [countRows] = await connection.execute(countQuery, [targetId]);
      const totalLikes = (countRows as any[])[0]?.likes || 0;

      // Récupérer les utilisateurs récents qui ont liké (optionnel)
      const [recentRows] = await connection.execute(
        `SELECT u.email, u.role 
         FROM likes l 
         JOIN user u ON l.user_id = u.id 
         WHERE l.target_type = ? AND l.target_id = ? 
         ORDER BY l.created_at DESC 
         LIMIT 3`,
        [targetType, targetId]
      );

      const recentLikes = (recentRows as any[]).map(row => ({
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

    } finally {
      connection.release();
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

    // Vérifier que l'utilisateur ne like pas son propre contenu
    const connection = await pool.getConnection();
    try {
      let authorQuery = '';
      switch (targetType) {
        case 'topic':
          authorQuery = 'SELECT author_id FROM forum_topic WHERE id = ?';
          break;
        case 'reply':
          authorQuery = 'SELECT author_id FROM forum_reply WHERE id = ?';
          break;
        case 'comment_reply':
          authorQuery = 'SELECT author_id FROM comment_reply WHERE id = ?';
          break;
      }

      const [authorRows] = await connection.execute(authorQuery, [targetId]);
      const authorId = (authorRows as any[])[0]?.author_id;

      if (authorId === userId) {
        return NextResponse.json({ error: 'Vous ne pouvez pas liker votre propre contenu' }, { status: 403 });
      }

      // Vérifier si l'utilisateur a déjà liké
      const [existingLike] = await connection.execute(
        'SELECT id FROM likes WHERE user_id = ? AND target_type = ? AND target_id = ?',
        [userId, targetType, targetId]
      );

      let action: 'liked' | 'unliked';
      
      if ((existingLike as any[]).length > 0) {
        // Unlike
        await connection.execute(
          'DELETE FROM likes WHERE user_id = ? AND target_type = ? AND target_id = ?',
          [userId, targetType, targetId]
        );
        action = 'unliked';
      } else {
        // Like
        await connection.execute(
          'INSERT INTO likes (user_id, target_type, target_id) VALUES (?, ?, ?)',
          [userId, targetType, targetId]
        );
        action = 'liked';
      }

      // Récupérer le nouveau total
      let countQuery = '';
      switch (targetType) {
        case 'topic':
          countQuery = 'SELECT likes FROM forum_topic WHERE id = ?';
          break;
        case 'reply':
          countQuery = 'SELECT likes FROM forum_reply WHERE id = ?';
          break;
        case 'comment_reply':
          countQuery = 'SELECT likes FROM comment_reply WHERE id = ?';
          break;
      }

      const [countRows] = await connection.execute(countQuery, [targetId]);
      const totalLikes = (countRows as any[])[0]?.likes || 0;

      return NextResponse.json({
        success: true,
        data: {
          action,
          totalLikes,
          isLiked: action === 'liked'
        }
      });

    } finally {
      connection.release();
    }

  } catch (error: any) {
    console.error('POST likes error:', error);
    
    // Gérer les erreurs de contrainte unique
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'Vous avez déjà liké ce contenu' }, { status: 409 });
    }
    
    return NextResponse.json(
      { error: 'Erreur serveur', message: error.message },
      { status: 500 }
    );
  }
}

